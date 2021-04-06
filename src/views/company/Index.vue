<template>
  <v-container id="company" tag="section">
    <div class="d-flex flex-column ml-2 mt-2">
      <h4 class="text--card text--card__title">
        {{ companyName }}
      </h4>
      <h3 class="text--card text--card__subtitle">
        Account #{{ billing.account_number || ' no account number' }}
      </h3>
    </div>
    <v-container class="pa-0">
      <v-row no-gutters>
        <v-col cols="12" md="7">
          <edit-company-form
            class="mr-2"
            :info="company"
            :is-saving="isCompanyLoading"
            :do-update-data="doUpdateCompanyData"
            :do-save="doUpdateCompany"
          />
        </v-col>
        <v-col cols="12" md="5">
          <edit-contact-form
            :info="companyContact"
            :is-saving="isCompanyLoading"
            :do-update-data="doUpdateCompanyContactData"
            :do-save="doUpdateCompanyContact"
            :departments="departments"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-sheet rounded color="white" class="wp--overflow__hidden mt-2" max-width="1032">
      <facility ref="facility" />
    </v-sheet>
    <v-sheet rounded color="white" class="wp--overflow__hidden mt-2" max-width="1032">
      <department ref="department" />
    </v-sheet>
    <v-sheet rounded color="white" class="wp--overflow__hidden mt-2" max-width="1032">
      <scanner ref="scanner" />
    </v-sheet>
    <v-sheet rounded color="white" class="wp--overflow__hidden mt-2" max-width="820">
      <user-fields ref="userfields" />
    </v-sheet>
    <v-sheet rounded color="white" class="wp--overflow__hidden mt-2" max-width="820">
      <add-multiple-user ref="addmultipleuser" />
    </v-sheet>
  </v-container>
</template>

<script>
import { merge } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../lib'
import EditCompanyForm from './components/EditCompanyForm'
import EditContactForm from './components/EditContactForm'
import Facility from './components/Facility'
import Department from './components/Department'
import UserFields from './components/UserFields'
import Scanner from './components/Scanner'
import AddMultipleUser from './components/AddMultipleUser'
import { REQUEST_COMPANY_CONTACT_INFO, REQUEST_COMPANY_CONTACT_UPDATE, REQUEST_COMPANY_INFO, REQUEST_COMPANY_UPDATE, UPDATE_COMPANY_STATE } from '../../store/modules/company'
import { REQUEST_BILLING_INFO } from '../../store/modules/billing'

export default initComponent('Company', {
  isPage: true,
  components: {
    EditCompanyForm,
    EditContactForm,
    Facility,
    Department,
    UserFields,
    AddMultipleUser,
    Scanner,
  },
  computed: {
    ...mapState({
      company: (state) => state.company.company,
      companyContact: (state) => state.company.contact,
      isCompanyLoading: (state) => state.company.isSaving || state.company.isFetching,
      billing: (state) => state.billing.billing,
      isBillingSaving: (state) => state.billing.isSaving,
    }),
  },
  methods: {
    async onReady () {
      const { dispatch } = this.$store
      const promises = [
        // company info
        dispatch(REQUEST_COMPANY_INFO),
        dispatch(REQUEST_COMPANY_CONTACT_INFO),

        // billing
        dispatch(REQUEST_BILLING_INFO),

        // facility
        this.$refs.facility.onReady(),

        // department
        this.$refs.department.onReady(),

        // scanner
        this.$refs.scanner.onReady(),

        // user fields
        this.$refs.userfields.onReady(),

        // multiple user
        this.$refs.addmultipleuser.onReady(),
      ]
      await Promise.all(promises)
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    async onSelectedCompanyModified () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    ...mapActions({
      async doUpdateCompany (dispatch) {
        return dispatch(REQUEST_COMPANY_UPDATE)
      },
      async doUpdateCompanyContact (dispatch) {
        return dispatch(REQUEST_COMPANY_CONTACT_UPDATE)
      },
    }),
    async doUpdateCompanyData (val, key) {
      const { commit, state } = this.$store
      const { company } = state.company
      return commit(UPDATE_COMPANY_STATE, { company: merge({}, company, { [key]: val }) })
    },
    async doUpdateCompanyContactData (val, key) {
      const { commit, state } = this.$store
      const { contact } = state.company
      return commit(UPDATE_COMPANY_STATE, { contact: merge({}, contact, { [key]: val }) })
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
</style>
