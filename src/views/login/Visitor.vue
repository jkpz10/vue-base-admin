<template>
  <v-app class="main-container app-bg">
    <v-container>
      <v-card
        color="white"
        class="mx-auto mt-sm-16"
        max-width="426"
      >
        <v-overlay :value="isRedirecting || isProcessing || isFetching" absolute z-index="1" />
        <div class="d-flex flex-row align-start justify-space-between header app-bg">
          <div class="label">
            {{ isRedirecting ? 'Please wait..' : 'Sign Up' }}
          </div>
          <v-progress-circular
            v-if="isRedirecting || isProcessing || isFetching"
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
        <mfa-form
          v-if="mfaMode"
          :info="form"
          :do-update-data="doUpdateData"
          :do-cancel="doCancel"
          :do-call-action="doSendMFA"
          :scenario="mfaFrom"
        />
        <sign-up-visitor-form
          v-else
          :info="form"
          :do-call-action="doSignUp"
          :do-update-data="doUpdateData"
          :companies="companies"
          :show-companies="showCompanies"
        />
      </v-card>
      <base-snack-bars :objects.sync="snackBars" />
    </v-container>
  </v-app>
</template>

<script>
import { cloneDeep, isEmpty, get } from 'lodash'
import { initComponent } from '../../lib'
import { mapState, mapActions, mapMutations } from 'vuex'
import { REQUEST_COMPANY_LIST, REQUEST_MFA, REQUEST_SIGNUP, RESET_LOGIN_STATE, UPDATE_LOGIN_STATE } from '../../store/modules/login'
import { ROUTE_SIGNIN, ROUTE_SURVEY_FORM, SCENARIO_MFA_SIGNUP } from '../../constants'
import SignUpVisitorForm from './components/SignUpVisitorForm'
import MfaForm from './components/MfaForm'
import { RESET_SURVEY_STATE } from '../../store/modules/survey'

export default initComponent('Visitor', {
  isPage: true,
  components: {
    SignUpVisitorForm,
    MfaForm,
  },
  data: () => ({
    mfaFrom: SCENARIO_MFA_SIGNUP,
    showCompanies: false,
    isRedirecting: false,
  }),
  computed: {
    ...mapState({
      isFetching: (state) => state.login.isFetching,
      companies: (state) => state.login.companies,
      isProcessing: (state) => state.login.isProcessing,
      mfaMode: (state) => state.login.isMFA,
      form: (state) => state.login.form,
    }),
  },
  methods: {
    async onSignUpSuccess () {
      const { params } = this.$route
      this.$router.push({ name: ROUTE_SIGNIN, query: { ...params, role: 'visitor' } })
    },
    async onReady () {
      const { commit, dispatch, state } = this.$store
      const { company } = this.$route.params

      // check if the user is already logged in
      const user = get(state, 'app.user')
      if (!isEmpty(user)) {
        const { query = {} } = this.$route
        this.isRedirecting = true
        return this.$router.push({ name: ROUTE_SURVEY_FORM, query })
      }

      await commit(RESET_LOGIN_STATE)

      if (isEmpty(company)) {
        await dispatch(REQUEST_COMPANY_LIST)
        this.showCompanies = true
      } else {
        await this.doUpdateData(company, 'company')
      }

      return Promise.all([
        this.doUpdateData({
          ...(this.$store.state.login.form.scenario || {}),
          as: 'visitor',
          params: this.$route.params,
          mfa: SCENARIO_MFA_SIGNUP,
        }, 'scenario'),
        commit(RESET_SURVEY_STATE),
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
  .header
    height: $header
    padding: 16px 30px 0px
    .label
      @include font(400, 24px)
      color: #fff
</style>
