<template>
  <v-app class="main-container app-bg">
    <v-container>
      <v-card
        color="white"
        class="mx-auto mt-sm-16"
        max-width="426"
      >
        <v-overlay :value="isProcessing" absolute z-index="1" />
        <div class="d-flex flex-row align-start justify-space-between header app-bg">
          <div class="label">
            Sign In
          </div>
          <v-progress-circular
            v-if="isProcessing"
            :value="100"
            indeterminate
            color="green"
          />
          <v-img
            v-else
            class="white--text"
            contain
            max-width="130"
            src="@/assets/company-logo.png"
          />
        </div>
        <v-expand-transition v-if="!success">
          <mfa-form
            v-if="mfaMode"
            :info="form"
            :do-update-data="doUpdateData"
            :do-cancel="doCancel"
            :do-call-action="doSendMFA"
            :scenario="scenario"
          />
          <login-form
            v-else
            :info="form"
            :is-confirm="true"
            :do-call-action="doLogin"
            :do-update-data="doUpdateData"
          />
        </v-expand-transition>
        <div v-else class="pa-2">
          <v-progress-linear indeterminate />
        </div>
      </v-card>
      <base-snack-bars :objects.sync="snackBars" />
    </v-container>
  </v-app>
</template>

<script>
import { cloneDeep, get } from 'lodash'
import { initComponent } from '../../lib'
import { mapState, mapActions, mapMutations } from 'vuex'
import { REQUEST_LOGIN, REQUEST_MFA, RESET_LOGIN_STATE, UPDATE_LOGIN_STATE } from '../../store/modules/login'
import { ROUTE_MYACCOUNT, ROUTE_NEW_PASSWORD, SCENARIO_MFA_LOGIN } from '../../constants'
import LoginForm from './components/LoginForm'
import MfaForm from './components/MfaForm'

export default initComponent('Confirm', {
  isPage: true,
  components: {
    LoginForm,
    MfaForm,
  },
  data: () => ({
    scenario: SCENARIO_MFA_LOGIN,
    success: false,
  }),
  computed: {
    ...mapState({
      isProcessing: (state) => state.login.isProcessing,
      mfaMode: (state) => state.login.isMFA,
      form: (state) => state.login.form,
    }),
  },
  methods: {
    async onLoginSuccess () {
      this.$store.commit(RESET_LOGIN_STATE)
      this.success = true
      this.$router.push({ name: ROUTE_MYACCOUNT })
    },
    async onNewPasswordRequired () {
      this.$router.push({ name: ROUTE_NEW_PASSWORD })
    },
    async onReady () {
      const { email, password } = this.$route.params
      return Promise.all([
        this.doUpdateData({
          ...(get(this.$store.state.login, 'form.scenario', {})),
          params: this.$route.params,
          mfa: SCENARIO_MFA_LOGIN,
        }, 'scenario'),
        this.doUpdateData(email, 'username'),
        this.doUpdateData(password, 'password'),
      ])
    },
    async doUpdateData (value, key) {
      const { commit, state } = this.$store
      const form = cloneDeep(state.login.form)
      form[key] = value
      return commit(UPDATE_LOGIN_STATE, { form })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_LOGIN_STATE, { isMFA: false })
    },
    ...mapActions({
      async doLogin (dispatch) {
        dispatch(REQUEST_LOGIN)
      },
      async doSendMFA (dispatch) {
        dispatch(REQUEST_MFA)
      },
    }),
    ...mapMutations({}),
  },
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
$header: 66px
.v-card
  .header
    height: $header
    padding: 16px 30px 0px
    .label
      @include font(400, 24px)
      color: #fff
</style>
