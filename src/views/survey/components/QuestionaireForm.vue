<template>
  <v-card-text class="pt-6 pb-6 px-8 d-flex flex-column align-start justify-stretch">
    <div class="d-flex full-width">
      <div class="wp--icon pa-2 mr-2 elevation-1 rounded">
        <v-icon v-text="'mdi-clipboard-text'" />
      </div>
      <div class="wp--title">
        <h3>Health Survey</h3>
        <h4>{{ companyName }}</h4>
      </div>
    </div>
    <div v-if="info.items.length > 0" class="d-flex flex-column full-width">
      <validation-observer
        ref="observer"
        v-slot="{ invalid }"
      >
        <div
          v-for="(item, x) in info.items"
          :key="x"
          class="wp--choices"
        >
          <validation-provider
            v-slot="{ errors }"
            :name="item.question"
            rules="checked"
          >
            <v-radio-group v-model="answers[x]" :error="errors.length > 0" hide-details="auto">
              <label class="text-body-1 mb-2">{{ item.question }}</label>
              <v-radio
                v-for="(choice, y) in item.choices"
                :key="y"
                :label="choice.value"
                :value="choice.value"
                @click="doUpdateData(choice.value, x)"
              />
            </v-radio-group>
          </validation-provider>
        </div>
        <v-btn block :disabled="invalid" class="flex-fill mt-8 mr-n1 inde btn btn--save" @click="doCallAction">
          DONE <v-icon right dark v-text="'mdi-send'" />
        </v-btn>
      </validation-observer>
    </div>
    <v-alert v-if="!isSaving && info.items.length === 0" border="top" color="red lighten-2" dark class="full-width mt-2 pb-2 pt-3 px-2">
      The company has no active surveys
    </v-alert>
  </v-card-text>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('QuestionaireForm', {
  props: {
    companyName: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      radios: [],
    }
  },
  computed: {
    answers () {
      return [].concat(this.info.answers || [])
    },
  },
  methods: {},
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--icon
    background: #47A8F9
  &--title
    @include font(400, 12px)
    h4
      @include font(400, 10px)
a
  text-decoration: none
  @include font(600, 12px)
</style>
