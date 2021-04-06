<template>
  <v-content
    class="align-start"
  >
    <v-container
      class="fill-height"
      fluid
    >
      <v-dialog
        :value="true"
        width="500"
      >
        <v-card class="wp">
          <v-card-title class="headline pb-4" :class="colorClass">
            {{ title }}
          </v-card-title>

          <v-card-text>
            {{ text }}
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              text
              @click="doGoBack"
            >
              <div v-if="isLoading" class="d-flex justify-center">
                <v-progress-circular size="24" indeterminate class="mr-2" />
                <span class="mt-1">Redirecting...</span>
              </div>
              <span v-else>{{ actionText }}</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-content>
</template>

<script>
import { ROUTE_DASHBOARD, ROUTE_MYACCOUNT, ROUTE_SIGNIN } from '../../constants'
import { REQUEST_SIGNOUT } from '../../store/modules/login'

export default {
  name: 'Forbidden',

  props: {
    code: {
      type: String,
      default: '',
    },
  },

  data: () => ({ isLoading: false }),

  computed: {
    colorClass () {
      const { code } = this
      const mapping = {
        forbidden: 'red accent-2 white--text',
        session: 'red accent-2 white--text',
        notfound: 'blue-grey darken-1 white--text',
      }
      return mapping[code] || 'blue-grey lighten-1'
    },
    actionText () {
      const { code } = this
      const mapping = {
        forbidden: 'I understand',
        session: 'Login',
        notfound: 'Go Back',
      }
      return mapping[code] || 'Ok'
    },
    text () {
      const { code } = this
      const mapping = {
        forbidden: 'You do not have permission for this page. Please go back.',
        session: 'Your session has expired. Please login.',
        notfound: 'Nothing for you here. Please go back.',
      }
      return mapping[code] || `Something went wrong. Please consult site administrator. [${code}]`
    },
    title () {
      const { code } = this
      const mapping = {
        forbidden: 'Permission Denied',
        session: 'Session Expired',
        notfound: '404 Not Found',
      }
      return mapping[code] || 'Application Error'
    },
  },
  methods: {
    async doGoBack () {
      const { code, $router, $store } = this
      const mapping = {
        forbidden: async () => {
          this.isLoading = true
          return $router.push({ name: this.$api.allowedToDashboard() ? ROUTE_DASHBOARD : ROUTE_MYACCOUNT })
        },
        session: async () => {
          await $store.dispatch(REQUEST_SIGNOUT)
          this.isLoading = true
          return $router.push({ name: ROUTE_SIGNIN })
        },
        notfound: async () => {
          this.isLoading = true
          return $router.go(-1)
        },
      }
      const defaultFn = async () => $router.push({ name: ROUTE_MYACCOUNT })
      const fn = mapping[code] || defaultFn

      return fn.call(this)
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
