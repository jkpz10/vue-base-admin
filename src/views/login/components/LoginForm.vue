<template>
  <v-card-text class="pt-10 px-8">
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <validation-provider
        v-slot="{ errors }"
        name="Email"
        rules="required|email"
      >
        <v-text-field
          label="Email"
          :value="info.username"
          :error-messages="errors"
          hide-details="auto"
          @input="(x) => doUpdateData(x, 'username')"
        />
      </validation-provider>
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
      <div class="d-flex flex-row align-center pt-4" :class="isConfirm ? 'justify-end' : 'justify-space-between'">
        <router-link v-if="!isConfirm" :to="toResetPassword" class="mt-2 label d-block">
          Forgot password?
        </router-link>
        <router-link v-if="!isConfirm" :to="toSignUp" class="mt-2 label d-block">
          Sign Up here
        </router-link>
        <v-btn
          color="primary"
          class="mr-n1"
          :disabled="invalid"
          @click="doCallAction"
        >
          SIGN IN
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
import { ROUTE_RESET_PASSWORD, ROUTE_SIGNUP, ROUTE_SIGNUP_LINK, ROUTE_SIGNUP_VISITOR } from '../../../constants'
import { initComponent } from '../../../lib'

export default initComponent('LoginForm', {
  props: {
    isConfirm: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const { query } = this.$route
    return {
      showPassword: false,
      toResetPassword: { name: ROUTE_RESET_PASSWORD, query },
    }
  },
  computed: {
    toSignUp () {
      const { query } = this.$route
      const { role } = query

      const mapping = {
        default: ROUTE_SIGNUP,
        visitor: ROUTE_SIGNUP_VISITOR, // from thermal scanner
        link: ROUTE_SIGNUP_LINK, // from registation link
      }

      return { name: mapping[role || 'default'], params: query }
    },
  },
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
