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
      <div class="d-flex flex-row align-center justify-space-between pt-4">
        <router-link :to="toLogin" class="mt-2 label d-block">
          Ready to sing in? Login
        </router-link>
        <v-btn
          color="primary"
          class="mr-n1"
          :disabled="invalid"
          @click="doCallAction"
        >
          RESET PASSWORD
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
import { ROUTE_SIGNIN } from '../../../constants'
import { initComponent } from '../../../lib'

export default initComponent('ResetPasswordForm', {
  data () {
    const { query } = this.$route
    return {
      toLogin: { name: ROUTE_SIGNIN, query },
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
