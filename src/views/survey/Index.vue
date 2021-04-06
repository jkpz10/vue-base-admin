<template>
  <v-app class="main-container app-bg">
    <v-container>
      <v-card color="white" class="mx-auto mt-sm-16" max-width="426">
        <v-overlay :value="isProcessing" absolute z-index="1" />
        <div class="d-flex flex-row align-start justify-space-between header app-bg">
          <div class="label">
            Survey
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

        <div v-if="passOrFail">
          <result-passed
            v-if="passOrFail === 1"
            :info="info"
          />
          <result-failed
            v-if="passOrFail === 2"
            :info="info"
          />
        </div>
        <questionaire-form
          v-else
          :info="info"
          :company-name="company.name"
          :is-saving="isProcessing"
          :do-call-action="doSubmit"
          :do-update-data="doUpdateData"
        />
      </v-card>
      <base-snack-bars :objects.sync="snackBars" />
    </v-container>
  </v-app>
</template>

<script>
import { isEmpty, get } from 'lodash'
import { initComponent } from '../../lib'
import { mapActions, mapState } from 'vuex'
import { REQUEST_SEND_ANSWERS, REQUEST_SURVEY_COMPANY_INFO, REQUEST_SURVEY_LIST, UPDATE_SURVEY_STATE } from '../../store/modules/survey'
import QuestionaireForm from './components/QuestionaireForm'
import ResultPassed from './components/ResultPassed'
import ResultFailed from './components/ResultFailed'
import { ROUTE_SURVEY_FORM, ROUTE_USER_AGREEMENT } from '../../constants'

export default initComponent('Survey', {
  isPage: true,
  components: {
    QuestionaireForm,
    ResultPassed,
    ResultFailed,
  },
  data: () => ({}),
  computed: {
    ...mapState({
      info: (state) => {
        const { items, answers, company, contact, result } = state.survey
        return { items, answers, company, contact, result }
      },
      company: (state) => state.survey.company,
      passOrFail: (state) => state.survey.passOrFail,
      isProcessing: (state) => {
        const { isFetching, isSaving } = state.survey
        return isFetching || isSaving
      },
    }),
  },
  methods: {
    async onUserRequiresToAgree () {
      const { query = {} } = this.$route
      this.$router.push({ name: ROUTE_USER_AGREEMENT, query: { ...query, redirect: ROUTE_SURVEY_FORM } })
    },
    async onReady () {
      let { company } = this.$route.params
      const { dispatch, state } = this.$store

      if (isEmpty(company)) {
        company = get(state, 'app.user.company_id')
      }

      await Promise.all([
        dispatch(REQUEST_SURVEY_COMPANY_INFO, { company }),
        dispatch(REQUEST_SURVEY_LIST, { company }),
      ])
    },
    async doUpdateData (value, key) {
      const { state, commit } = this.$store
      const answers = [].concat(state.survey.answers || [])
      answers[key] = value
      return commit(UPDATE_SURVEY_STATE, { answers })
    },
    ...mapActions({
      doSubmit (dispatch) {
        return dispatch(REQUEST_SEND_ANSWERS)
      },
    }),
  },
})
</script>

<style lang="sass" scoped>
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
