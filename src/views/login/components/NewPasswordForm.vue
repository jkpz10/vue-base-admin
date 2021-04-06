<template>
  <v-card-text class="pt-10 px-8">
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <validation-provider
        v-slot="{ errors }"
        name="Password"
        rules="required"
      >
        <v-text-field
          label="Password"
          :value="info.password"
          :error-messages="errors"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          hide-details="auto"
          @click:append="showPassword = !showPassword"
          @input="(x) => doUpdateData(x, 'password')"
        />
      </validation-provider>
      <div class="d-flex flex-row align-center justify-space-between pt-4">
        <v-btn
          block
          color="primary"
          class="mr-n1"
          :disabled="invalid"
          @click="doCallAction"
        >
          SUBMIT
          <v-icon
            right
            dark
          >
            mdi-send
          </v-icon>
        </v-btn>
      </div>
    </validation-observer>
  </v-card-text>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('NewPasswordForm', {
  data () {
    return {
      showPassword: false,
    }
  },
  methods: {},
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text
  &--content
    @include font(400, 10px)
    margin-bottom: 4px !important
a
  text-decoration: none
  @include font(600, 12px)
.v-btn--disabled
  background-color: rgba(0,0,0,.12)!important
</style>
