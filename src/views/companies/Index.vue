<template>
  <v-container
    id="companies"
    tag="section"
  >
    <v-row no-gutters>
      <v-col :cols="isAddMode ? 8 : 12">
        <div class="pos-relative d-flex flex-row-reverse">
          <v-btn elevation="0" class="mr-1 inde btn btn--save" @click="doAdd">
            Add <v-icon color="white" right v-text="'mdi-account-plus'" />
          </v-btn>
          <v-btn class="inde btn btn--export mr-2" elevation="0" @click="doExport">
            Export <v-icon color="white" right v-text="'mdi-export-variant'" />
          </v-btn>
        </div>
        <v-card class="wp wp--table pa-2 mr-1" outlined rounded="md">
          <v-overlay :value="isFetching" absolute z-index="1">
            <v-progress-circular indeterminate size="36" />
          </v-overlay>
          <div class="d-flex justify-space-between">
            <div class="pl-2 pt-2 d-flex flex-column">
              <h4 class="text--card text--card__title">
                Company Management
              </h4>
              <h3 class="text--card text--card__subtitle">
                All companies registered
              </h3>
            </div>
            <div class="pb-6">
              <v-text-field
                v-model="search"
                hint="Hit enter for result. Case sensitive."
                label="Search"
                prepend-inner-icon="mdi-magnify"
                class="input--search mr-3 mb-n7"
                clearable
                @keyup.enter="doUpdateSearch"
                @click:clear="doClearSearch"
              />
            </div>
          </div>

          <v-data-table
            :headers="headers"
            :items="items"
            :options.sync="options"
            :footer-props="footerProps"
            :server-items-length="paging._total"
            class="tablelist tablelist--companies"
          >
            <template v-slot:item.status="{ item }">
              <div style="width: 100px;">
                {{ $t(`user_status.${item.status || 'inactive'}`) }}
              </div>
            </template>
            <template v-slot:item.is_public="{ item }">
              <div style="width: 100px;">
                {{ $t(`yes_or_no.${item.is_public}`) }}
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <div
                class="row--action"
                style="width: 80px;"
              >
                <v-btn tile icon x-small class="inde btn--row_edit mr-2" @click="doSelect(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-fade-transition leave-absolute hide-on-leave>
          <v-card v-if="isAddMode" class="wp wp--form px-4 py-2 mt-0">
            <add-company-form
              :info="item"
              :is-saving="isSaving"
              :do-update-data="doUpdateData"
              :do-cancel="doCancel"
              :do-save="doAddItem"
            />
          </v-card>
        </v-fade-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { merge, isEqual, pick } from 'lodash'
import { REQUEST_COMPANIES_ADD, REQUEST_COMPANIES_LIST, UPDATE_COMPANIES_STATE } from '../../store/modules/companies'
import { initComponent } from '../../lib'
import { EV_CHANGE_SELECTED_COMPANY, UPDATE_APP_DATA } from '../../store/modules/app'
import { ROUTE_COMPANY } from '../../constants'
import AddCompanyForm from './components/AddCompanyForm'

export default initComponent('Companies', {
  isPage: true,
  components: {
    AddCompanyForm,
  },
  data () {
    return {
      headers: [
        {
          text: 'Is Public',
          value: 'is_public',
        },
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Address',
          value: 'addr',
        },
        {
          text: 'City',
          value: 'city',
        },
        {
          text: 'State',
          value: 'state',
        },
        {
          text: 'Zip',
          value: 'zip',
        },
        {
          text: 'Status',
          value: 'status',
        },
        {
          text: 'Action',
          value: 'actions',
          sortable: false,
        },
      ],
    }
  },
  computed: {
    search: {
      get () {
        const { state } = this.$store
        return state.companies.paging.q
      },
      async set (q) {
        const { commit } = this.$store
        return commit(UPDATE_COMPANIES_STATE, { paging: { q } })
      },
    },
    options: {
      get () {
        const { state } = this.$store
        const { paging } = state.companies
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { commit, dispatch, state: { companies } } = this.$store
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }
        if (!isEqual(paging, pick(companies.paging, '_limit,_page,sort'.split(',')))) {
          await commit(UPDATE_COMPANIES_STATE, { paging })
          await dispatch(REQUEST_COMPANIES_LIST)
        }
      },
    },
    ...mapState({
      q: (state) => state.companies.paging.q,
      items: (state) => state.companies.items,
      item: (state) => state.companies.item,
      paging: (state) => state.companies.paging,
      isFetching: (state) => state.companies.isFetching,
      isSaving: (state) => state.companies.isSaving,
      isAddMode: (state) => state.companies.isFormAdd,
    }),
  },
  methods: {
    async onReady () {
      const { dispatch } = this.$store
      return dispatch(REQUEST_COMPANIES_LIST)
    },
    ...mapActions({
      async doUpdateSearch (dispatch, q) {
        const { commit } = this.$store
        await commit(UPDATE_COMPANIES_STATE, { paging: { _page: 1 } })
        return dispatch(REQUEST_COMPANIES_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_COMPANIES_LIST)
      },
      async doAddItem (dispatch) {
        return dispatch(REQUEST_COMPANIES_ADD)
      },
    }),
    doExport () {},
    async doAdd () {
      const { commit } = this.$store
      return commit(UPDATE_COMPANIES_STATE, { item: {}, isFormUpload: false, isFormAdd: true, isFormEdit: false })
    },
    async doSelect (item) {
      const { dispatch } = this.$store
      await dispatch(UPDATE_APP_DATA, { company: item.id, companyName: item.name })
      await dispatch(EV_CHANGE_SELECTED_COMPANY)
      await this.$router.push({ name: ROUTE_COMPANY })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_COMPANIES_STATE, { item: {}, isFormUpload: false, isFormAdd: false, isFormEdit: false })
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.companies
      return commit(UPDATE_COMPANIES_STATE, { item: merge({}, item, { [key]: val }) })
    },
  },
})
</script>
<style lang="sass" scoped></style>
