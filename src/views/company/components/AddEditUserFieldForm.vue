<template>
  <v-card class="wp wp--overflow__hidden">
    <div class="px-3 pt-3 text-h5">
      {{ info.id ? 'Edit User Field' : 'Add User Field' }}
    </div>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <v-overlay :value="isSaving" absolute z-index="1">
        <v-progress-circular indeterminate size="36" />
      </v-overlay>
      <div class="py-2 px-4 mt-n2 d-flex flex-column">
        <validation-provider v-slot="{ errors }" name="Label" rules="required">
          <v-text-field
            label="Label"
            :value="info.label"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'label')"
          />
        </validation-provider>
        <div class="d-flex align-baseline pt-4 text-uppercase font-weight-bold">
          <span class="pos-relative" style="top: -3px;">Active</span>
          <v-switch v-model="status" class="px-3 py-0 my-0" />
        </div>
        <div v-for="(c, i) in info.values" :key="i">
          <validation-provider
            v-slot="{ errors }"
            :name="`Value ${i}`"
            rules="required"
          >
            <v-text-field
              :label="`Value ${i}`"
              :value="c"
              :error-messages="errors"
              placeholder="New value here"
              class="input--text"
              @input="(x) => doUpdateData(x, `values.${i}`)"
            >
              <div slot="prepend" class="d-flex flex-column mt-n4">
                <v-icon slot="prepend" class="input--minus" @click.prevent="doRemoveValue(i)">
                  mdi-minus
                </v-icon>
                <v-icon v-if="(i + 1) === info.values.length" slot="prepend" class="input--plus" @click.prevent="doPushValue">
                  mdi-plus
                </v-icon>
              </div>
            </v-text-field>
          </validation-provider>
        </div>
        <v-btn v-if="info.values.length === 0" class="align-self-end mr-0 btn btn--export" @click="doPushValue">
          Add Value<v-icon color="white" right v-text="'mdi-plus'" />
        </v-btn>
        <div class="d-flex justify-end pt-4">
          <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
            Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
          </v-btn>
          <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
            Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
          </v-btn>
        </div>
      </div>
    </validation-observer>
  </v-card>
</template>

<script>
import { cloneDeep } from 'lodash'
import { initComponent } from '../../../lib'
export default initComponent('AddEditUserFieldForm', {
  methods: {
    async doRemoveValue (index) {
      const { info } = this
      const values = cloneDeep(info.values)
      values.splice(index, 1)
      return this.doUpdateData(values, 'values')
    },
    async doPushValue () {
      const { info } = this
      const values = cloneDeep(info.values)
      values.push('')
      return this.doUpdateData(values, 'values')
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.input
  &--is_correct, &--minus
    cursor: pointer
  &--is_correct:hover
    color: #43A047
  &--minus
    color: #E53935
</style>
