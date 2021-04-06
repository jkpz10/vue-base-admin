<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col class="pos-relative pt-4 py-2 px-4" cols="12" :md="isShowForm ? 6 : 12">
        <v-overlay :value="isFetching" absolute z-index="1">
          <v-progress-circular indeterminate size="36" />
        </v-overlay>
        <div class="d-flex justify-space-between align-center ml-2">
          <div class="d-flex flex-column flex-fill align-start justify-end">
            <h4 class="text--card text--card__title flex-fill">
              Entry Scanners
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
            />
            <v-btn elevation="0" class="mr-1 inde btn btn--add" @click="doAdd">
              Add New <v-icon color="white" right v-text="'mdi-plus'" />
            </v-btn>
          </div>
        </div>
        <v-data-table
          :headers="headers"
          :items="items"
          :search="search"
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
      <v-col v-if="isShowForm" cols="12" :md="isShowForm ? 6 : 6">
        <add-edit-scanner-form
          :class="`${isEditMode ? 'ml-7' : 'ml-1'} mr-4 my-4`"
          :info="item"
          :is-saving="isSaving"
          :do-update-data="doUpdateData"
          :do-save="doAddUpdate"
          :do-cancel="doCancel"
          :facilities="facilities"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { merge, has } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../../lib'
import { REQUEST_SCANNER_ADD, REQUEST_SCANNER_FACILITY_LIST, REQUEST_SCANNER_LIST, REQUEST_SCANNER_UPDATE, RESET_SCANNER_STATE, UPDATE_SCANNER_STATE } from '../../../store/modules/scanner'
import AddEditScannerForm from './AddEditScannerForm'

export default initComponent('Scanner', {
  components: {
    AddEditScannerForm,
  },
  data () {
    return {
      search: '',
      headers: [
        {
          text: 'Name',
          value: 'scanner_name',
        },
        {
          text: 'ID',
          value: 'scanner_id',
        },
        {
          text: 'Facility',
          value: 'facility_name',
        },
        {
          text: 'Failure Message',
          value: 'failed_message',
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
    ...mapState({
      items: (state) => state.scanner.items,
      item: (state) => state.scanner.item,
      facilities: (state) => state.scanner.facilities,
      isFetching: (state) => state.scanner.isFetching,
      isAddMode: (state) => state.scanner.isFormAdd,
      isEditMode: (state) => state.scanner.isFormEdit,
      isSaving: (state) => state.scanner.isSaving,
      isShowForm: (state) => state.scanner.isFormEdit || state.scanner.isFormAdd,
    }),
  },
  methods: {
    async onReady () {
      const { $store: { dispatch, commit } } = this
      await commit(RESET_SCANNER_STATE)
      return Promise.all([
        dispatch(REQUEST_SCANNER_FACILITY_LIST),
        dispatch(REQUEST_SCANNER_LIST),
      ])
    },
    ...mapActions({
      async doUpdateSearch (dispatch, q) {
        const { commit } = this.$store
        await commit(UPDATE_SCANNER_STATE, { paging: { _page: 1 } })
        await dispatch(REQUEST_SCANNER_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_SCANNER_LIST)
      },
      async doAddUpdate (dispatch) {
        const { item } = this.$store.state.scanner
        await dispatch(has(item, 'id') ? REQUEST_SCANNER_UPDATE : REQUEST_SCANNER_ADD)
      },
    }),
    async doEdit (item) {
      const { commit } = this.$store
      return commit(UPDATE_SCANNER_STATE, { item, isFormAdd: false, isFormEdit: true })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_SCANNER_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doAdd () {
      const { commit } = this.$store
      const item = {
        facility_id: null,
        failed_message: 'Please contact company admin for support.',
        scanner_id: null,
        scanner_name: 'Main Gate Scanner',
      }
      return commit(UPDATE_SCANNER_STATE, { item, isFormAdd: true, isFormEdit: false })
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.scanner
      return commit(UPDATE_SCANNER_STATE, { item: merge({}, item, { [key]: val }) })
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
