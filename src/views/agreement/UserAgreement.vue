<template>
  <v-app class="main-container app-bg">
    <v-container>
      <v-card
        color="white"
        class="mx-auto mt-sm-16"
        max-width="526"
      >
        <v-overlay :value="isSaving" absolute z-index="1" />
        <div class="d-flex flex-row align-start justify-space-between header app-bg">
          <div class="label">
            HIPAA
          </div>
          <v-progress-circular
            v-if="isSaving"
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
          <hipaa-form :do-call-action="doRecordAgreement" />
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
import { chain, omit, get, remove, isEmpty } from 'lodash'
import { initComponent } from '../../lib'
import { mapState, mapActions } from 'vuex'
import HipaaForm from './components/HipaaForm'
import { REQUEST_RECORD_AGREEMENT } from '../../store/modules/user'
import { CONSENT_HIPAA_VC, CONSENT_USER_AGREEMENT } from '../../constants'

export default initComponent('UserAgreement', {
  isPage: true,
  components: {
    HipaaForm,
  },
  data: () => ({
    success: false,
  }),
  computed: {
    ...mapState({
      isSaving: (state) => state.user.isSaving,
    }),
  },
  methods: {
    async onRecordAgreementSuccess () {
      const { query = {} } = this.$route
      this.success = true
      this.$router.push({ name: query.redirect, query: { ...omit(query, ['redirect']) } })
    },
    async onReady () {
      const { app } = this.$store.state
      let consents = get(app, 'user.consents', [])
      consents = chain(consents).filter({ acknowledge: true }).map('name').value()
      const required = [
        CONSENT_USER_AGREEMENT,
        CONSENT_HIPAA_VC,
      ]
      remove(required, (x) => consents.includes(x))
      if (isEmpty(required)) {
        return this.onRecordAgreementSuccess()
      }
    },
    ...mapActions({
      async doRecordAgreement (dispatch) {
        await dispatch(REQUEST_RECORD_AGREEMENT)
      },
    }),
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
