<template>
  <v-card-text class="pt-10 px-8">
    <p class="text-center text--content">
      You will receive a code via sms from us.
    </p>
    <p class="text-center text--content">
      To complete your sign up please enter the code below.
    </p>
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
          v-if="isPasswordRequired"
          label="New Password"
          :value="info.password"
          :error-messages="errors"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          hide-details="auto"
          @click:append="showPassword = !showPassword"
          @input="(x) => doUpdateData(x, 'password')"
        />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Code"
        rules="required"
      >
        <v-text-field
          label="MFA Code"
          :value="info.code"
          :error-messages="errors"
          hide-details="auto"
          @input="(x) => doUpdateData(x, 'code')"
        />
      </validation-provider>
      <div class="d-flex flex-row align-center justify-space-between pt-4">
        <a
          class="label d-block"
          href="#"
          @click="doCancel"
        >
          {{ cancelWord }}
        </a>
        <v-btn
          color="primary"
          class="mr-n1"
          :disabled="invalid"
          @click="doCallAction"
        >
          Verify
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
import { SCENARIO_MFA_LOGIN, SCENARIO_MFA_NEW_PASSWORD, SCENARIO_MFA_RESET, SCENARIO_MFA_SIGNUP } from '../../../constants'
import { initComponent } from '../../../lib'

export default initComponent('MfaForm', {
  props: {
    scenario: {
      type: String,
      default: SCENARIO_MFA_SIGNUP,
    },
  },
  data () {
    return {
      showPassword: false,
    }
  },
  computed: {
    isPasswordRequired () {
      const { scenario } = this
      return scenario === SCENARIO_MFA_RESET
    },
    cancelWord () {
      const { scenario } = this
      return {
        [SCENARIO_MFA_SIGNUP]: 'Back to Sign Up',
        [SCENARIO_MFA_LOGIN]: 'Back to Sign In',
        [SCENARIO_MFA_RESET]: 'Back to Reset',
        [SCENARIO_MFA_NEW_PASSWORD]: 'Back to Sign In',
      }[scenario] || 'Go Back'
    },
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
