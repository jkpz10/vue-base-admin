<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col v-if="!isEditMode" class="pos-relative pt-4 py-2 px-4" cols="12" :md="isAddMode ? 6 : 12">
        <v-overlay :value="isFetching" absolute z-index="1">
          <v-progress-circular indeterminate size="36" />
        </v-overlay>
        <div class="d-flex justify-space-between align-center ml-2">
          <div class="d-flex flex-column flex-fill align-start justify-end">
            <h4 class="text--card text--card__title flex-fill">
              Facility
            </h4>
          </div>
          <div class="mr-2 d-flex align-center justify-end">
            <v-text-field
              v-model="search"
              hint="Hit enter for result. Case sensitive."
              label="Search"
              prepend-inner-icon="mdi-magnify"
              class="inde input--search mt-n2 mr-4"
              clearable
              hide-details="auto"
              @keyup.enter="doUpdateSearch"
              @click:clear="doClearSearch"
            />
            <v-btn elevation="0" class="mr-1 inde btn btn--add" @click="doAdd">
              Add New <v-icon color="white" right v-text="'mdi-plus'" />
            </v-btn>
          </div>
        </div>
        <v-data-table
          :headers="headers"
          :items="items"
          :options.sync="options"
          :footer-props="footerProps"
          :server-items-length="paging._total"
          class="tablelist pt-4"
        >
          <template v-slot:item.actions="{ item }">
            <div style="width: 80px;">
              <v-btn tile icon x-small class="inde btn--row_edit mr-2" @click="doEdit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
      <v-col v-if="isEditMode" cols="12">
        <v-btn class="inde mt-2 ml-2" text @click="doCancel">
          <v-icon left v-text="'mdi-arrow-left'" />  Back
        </v-btn>
      </v-col>
      <v-col v-if="isShowForm" cols="12" :md="isAddMode ? 6 : 6">
        <add-edit-facility-form
          :class="`${isEditMode ? 'ml-7' : 'ml-1'} mr-2 my-4`"
          :info="item"
          :is-saving="isSaving"
          :do-update-data="doUpdateFacilityData"
          :do-save="doAddUpdate"
          :do-cancel="doCancel"
        />
      </v-col>
      <v-col v-if="isEditMode" cols="12" md="6">
        <edit-contact-form
          class="my-4 mr-8"
          :info="contact"
          :is-saving="isSaving"
          :do-update-data="doUpdateContactData"
          :do-save="doSaveContact"
          :departments="departments"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { merge, isEqual, pick, has } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../../lib'
import { REQUEST_FACILITY_ADD, REQUEST_FACILITY_CONTACT_UPDATE, REQUEST_FACILITY_LIST, REQUEST_FACILITY_UPDATE, UPDATE_FACILITY_STATE } from '../../../store/modules/facility'
import AddEditFacilityForm from './AddEditFacilityForm'
import EditContactForm from './EditContactForm'

export default initComponent('Facility', {
  components: {
    AddEditFacilityForm,
    EditContactForm,
  },
  data () {
    return {
      headers: [
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
          text: 'Actions',
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
        return state.facility.paging.q
      },
      async set (q) {
        const { commit } = this.$store
        return commit(UPDATE_FACILITY_STATE, { paging: { q } })
      },
    },
    options: {
      get () {
        const { state } = this.$store
        const { paging } = state.facility
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { commit, dispatch, state: { facility } } = this.$store
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }
        if (!isEqual(paging, pick(facility.paging, '_limit,_page,sort'.split(',')))) {
          await commit(UPDATE_FACILITY_STATE, { paging })
          await dispatch(REQUEST_FACILITY_LIST)
        }
      },
    },
    ...mapState({
      q: (state) => state.facility.paging.q,
      items: (state) => state.facility.items,
      item: (state) => state.facility.item,
      contact: (state) => state.facility.contact,
      paging: (state) => state.facility.paging,
      isFetching: (state) => state.facility.isFetching,
      isAddMode: (state) => state.facility.isFormAdd,
      isEditMode: (state) => state.facility.isFormEdit,
      isSaving: (state) => state.facility.isSaving,
      isShowForm: (state) => state.facility.isFormEdit || state.facility.isFormAdd,
    }),
  },
  methods: {
    async onReady () {
      const { $store: { dispatch } } = this
      return dispatch(REQUEST_FACILITY_LIST)
    },
    ...mapActions({
      async doUpdateSearch (dispatch, q) {
        const { commit } = this.$store
        await commit(UPDATE_FACILITY_STATE, { paging: { _page: 1 } })
        await dispatch(REQUEST_FACILITY_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_FACILITY_LIST)
      },
      async doAddUpdate (dispatch) {
        const { item } = this.$store.state.facility
        await dispatch(has(item, 'id') ? REQUEST_FACILITY_UPDATE : REQUEST_FACILITY_ADD)
      },
      async doSaveContact (dispatch) {
        await dispatch(REQUEST_FACILITY_CONTACT_UPDATE)
      },
    }),
    async doEdit (item) {
      const { commit } = this.$store
      return commit(UPDATE_FACILITY_STATE, { item, isFormAdd: false, isFormEdit: true })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_FACILITY_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doAdd () {
      const { commit } = this.$store
      const item = {
        name: '',
        addr: '',
        city: '',
        state: '',
        zip: '',
      }
      return commit(UPDATE_FACILITY_STATE, { item, isFormAdd: true, isFormEdit: false })
    },
    async doUpdateFacilityData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.facility
      return commit(UPDATE_FACILITY_STATE, { item: merge({}, item, { [key]: val }) })
    },
    async doUpdateContactData (val, key) {
      const { commit, state } = this.$store
      const { contact } = state.facility
      return commit(UPDATE_FACILITY_STATE, { contact: merge({}, contact, { [key]: val }) })
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text--title
  background-color: #2F96DE
  color: white
</style>
