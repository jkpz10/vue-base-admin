<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <div v-if="isAddMode" class="text-title" v-text="'New Question'" />
    <div v-else class="text-title" v-text="'Update Question'" />

    <div class="text-subtitle brown--text mt-2" v-text="'Question'" />

    <v-checkbox
      v-model="itemIsRequired"
      hide-details
      label="Is Required"
      class="input--text input--checkbox mt-1"
    />

    <v-checkbox
      v-model="itemIsActive"
      hide-details
      label="Is Active"
      class="input--text input--checkbox"
    />

    <validation-provider
      v-slot="{ errors }"
      name="Question"
      rules="required"
    >
      <v-text-field
        label="Question"
        :value="info.question"
        :error-messages="errors"
        class="input--text"
        @input="(x) => doUpdateData(x, 'question')"
      />
    </validation-provider>

    <v-select
      :value="info.weight"
      :items="sweightList"
      item-text="l"
      item-value="i"
      label="Weight Point"
      class="input--text"
      @input="(x) => doUpdateData(x, 'weight')"
    />

    <div class="text-subtitle brown--text my-2">
      Answers
    </div>

    <div v-for="(c, i) in info.choices" :key="i">
      <validation-provider
        v-slot="{ errors }"
        name="Answer"
        rules="required"
      >
        <v-text-field
          label="Answer"
          :value="c.value"
          :error-messages="errors"
          class="input--text"
          @input="(x) => doUpdateData(x, `choices[${i}].value`)"
        >
          <v-icon slot="append" class="input--is_correct" @click.prevent="doUpdateCorrectness(i)">
            {{ c.is_correct ? 'mdi-check-box-outline' : 'mdi-checkbox-blank-outline' }}
          </v-icon>
          <div slot="prepend" class="d-flex flex-column mt-n4">
            <v-icon slot="prepend" class="input--minus" @click.prevent="doRemoveAnswer(i)">
              mdi-minus
            </v-icon>
            <v-icon v-if="(i + 1) === info.choices.length" slot="prepend" class="input--plus" @click.prevent="doPushNewAnswer">
              mdi-plus
            </v-icon>
          </div>
        </v-text-field>
      </validation-provider>
    </div>

    <v-btn v-if="info.choices.length === 0" class="mb-4 inde btn btn--add" elevation="0" @click="doPushNewAnswer">
      Add Answer <v-icon color="white" right v-text="'mdi-plus'" />
    </v-btn>

    <div class="d-flex justify-end">
      <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
        Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
      </v-btn>
      <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
        Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
      </v-btn>
    </div>
  </validation-observer>
</template>

<script>
import { has, get, range, cloneDeep, isEmpty } from 'lodash'
import { initComponent } from '../../../lib'
export default initComponent('Question', {
  data: () => ({
    sweightList: range(1, 100, 1).map(x => ({ l: x.toFixed(1), i: Number(x.toFixed(1)) })),
  }),
  computed: {
    isAddMode () {
      return !has(this.info, 'id')
    },
    itemIsActive: {
      get () {
        const { info } = this
        return get(info, 'is_active', false)
      },
      async set (v) {
        return this.doUpdateData(v, 'is_active')
      },
    },
    itemIsRequired: {
      get () {
        const { info } = this
        return get(info, 'is_required', false)
      },
      async set (v) {
        return this.doUpdateData(v, 'is_required')
      },
    },
  },
  methods: {
    async doUpdateCorrectness (index) {
      const { info } = this
      const choices = cloneDeep(info.choices)
      choices.forEach((x, i) => {
        x.is_correct = i === index
      })
      return this.doUpdateData(choices, 'choices')
    },
    async doRemoveAnswer (index) {
      const { info } = this
      const choices = cloneDeep(info.choices)
      choices.splice(index, 1)
      return this.doUpdateData(choices, 'choices')
    },
    async doPushNewAnswer () {
      const { info } = this
      const choices = cloneDeep(info.choices)
      choices.push({
        value: 'Yes',
        is_correct: isEmpty(choices),
      })
      return this.doUpdateData(choices, 'choices')
    },
  },
})
</script>

<style lang="sass" scoped>
.input
  &--is_correct, &--minus
    cursor: pointer
  &--is_correct:hover
    color: #43A047
  &--minus
    color: #E53935
</style>
