<template>
  <v-app class="main-container app-bg">
    <v-container>
      <v-card
        color="transparent"
        class="mx-auto mt-sm-16"
        max-width="426"
      >
        <v-overlay :value="isProcessing" absolute z-index="1" />
        <div class="d-flex flex-row align-start justify-space-between header app-bg">
          <div class="label">
            Sign Up
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
        <v-expand-transition>
          <mfa-form
            v-if="mfaMode"
            :info="form"
            :do-update-data="doUpdateData"
            :do-cancel="doCancel"
            :do-call-action="doSendMFA"
            :scenario="scenario"
          />
          <sign-up-visitor-form
            v-else
            :info="form"
            :do-call-action="doSignUp"
            :do-update-data="doUpdateData"
          />
        </v-expand-transition>
      </v-card>
      <base-snack-bars :objects.sync="snackBars" />
    </v-container>
  </v-app>
</template>

<script>
import { cloneDeep } from 'lodash'
import { initComponent } from '../../lib'
import { mapState, mapActions, mapMutations } from 'vuex'
import { REQUEST_MFA, REQUEST_SIGNUP, UPDATE_LOGIN_STATE } from '../../store/modules/login'
import { ROUTE_SIGNIN, SCENARIO_MFA_SIGNUP } from '../../constants'
import SignUpVisitorForm from './components/SignUpVisitorForm'
import MfaForm from './components/MfaForm'

export default initComponent('Visitor', {
  isPage: true,
  components: {
    SignUpVisitorForm,
    MfaForm,
  },
  data: () => ({
    scenario: SCENARIO_MFA_SIGNUP,
  }),
  computed: {
    ...mapState({
      isProcessing: (state) => state.login.isProcessing,
      mfaMode: (state) => state.login.isMFA,
      form: (state) => state.login.form,
    }),
  },
  methods: {
    async onSignUpSuccess () {
      this.$router.push({ name: ROUTE_SIGNIN })
    },
    async onReady () {
      return Promise.all([
        this.doUpdateData({
          ...(this.$store.state.login.form.scenario || {}),
          mfa: SCENARIO_MFA_SIGNUP,
        }, 'scenario'),
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
      async doSignUp (dispatch) {
        dispatch(REQUEST_SIGNUP)
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
  // margin-bottom: 0px
  .label
    font: normal normal normal 12px/20px Open Sans
  .header
    height: $header
    padding: 16px 30px 0px
    .label
      color: #fff
      font: normal normal normal 24px/33px Open Sans
  a
    text-decoration: none
  &__text--reveal
    opacity: 1 !important
    position: absolute
    width: 100%
    top: $header
    left: 0px
  &__text, &__actions
    background: white
</style>
