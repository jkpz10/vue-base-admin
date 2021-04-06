<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col class="pos-relative pt-4 py-2 px-4" cols="12" :md="isAddMode || isEditMode ? 6 : 12">
        <v-overlay :value="isFetching" absolute z-index="1">
          <v-progress-circular indeterminate size="36" />
        </v-overlay>
        <div class="d-flex justify-space-between align-center ml-2">
          <div class="d-flex flex-column flex-fill align-start justify-end">
            <h4 class="text--card text--card__title flex-fill">
              Department
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
          :server-items-length="paging._total"
          class="tablelist pt-4"
        >
          <!-- :footer-props="footerProps" -->
          <template v-slot:item.actions="{ item }">
            <div style="width: 80px;">
              <v-btn tile icon x-small class="inde btn--row_edit mr-2" @click="doEdit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
      <v-col v-if="isAddMode" cols="12" :md="isAddMode ? 6 : 6">
        <add-edit-department-form
          :class="`${isEditMode ? 'ml-7' : 'ml-1'} mr-2 my-4`"
          :info="item"
          :is-saving="isSaving"
          :is-add-mode="isAddMode"
          :do-update-data="doUpdateDepartmentData"
          :do-save="doAddUpdate"
          :do-cancel="doCancel"
        />
      </v-col>
      <v-col v-if="isEditMode" cols="12" :md="isEditMode ? 6 : 6">
        <add-edit-department-form
          :class="`${isEditMode ? 'ml-7' : 'ml-1'} mr-2 my-4`"
          :info="item"
          :is-saving="isSaving"
          :is-edit-mode="isEditMode"
          :do-update-data="doUpdateDepartmentData"
          :do-save="doAddUpdate"
          :do-cancel="doCancel"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { merge, isEqual, pick, has } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../../lib'
import { REQUEST_DEPARTMENT_ADD, REQUEST_DEPARTMENT_LIST, REQUEST_DEPARTMENT_UPDATE, UPDATE_DEPARTMENT_STATE } from '../../../store/modules/department'
import AddEditDepartmentForm from './AddEditDepartmentForm'
export default initComponent('Department', {
  components: {
    AddEditDepartmentForm,
  },
  data () {
    return {
      headers: [
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Status',
          value: 'status',
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
        return state.department.paging.q
      },
      async set (q) {
        const { commit } = this.$store
        return commit(UPDATE_DEPARTMENT_STATE, { paging: { q } })
      },
    },
    options: {
      get () {
        const { state } = this.$store
        const { paging } = state.department
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { commit, dispatch, state: { department } } = this.$store
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }
        if (!isEqual(paging, pick(department.paging, '_limit,_page,sort'.split(',')))) {
          await commit(UPDATE_DEPARTMENT_STATE, { paging })
          await dispatch(REQUEST_DEPARTMENT_LIST)
        }
      },
    },
    ...mapState({
      q: (state) => state.department.paging.q,
      items: (state) => state.department.items,
      item: (state) => state.department.item,
      paging: (state) => state.department.paging,
      isFetching: (state) => state.department.isFetching,
      isAddMode: (state) => state.department.isFormAdd,
      isEditMode: (state) => state.department.isFormEdit,
      isSaving: (state) => state.department.isSaving,
      isShowForm: (state) => state.department.isFormEdit || state.department.isFormAdd,
    }),
  },
  methods: {
    async onReady () {
      const { $store: { dispatch, commit } } = this
      return [dispatch(REQUEST_DEPARTMENT_LIST), commit(UPDATE_DEPARTMENT_STATE, { isFormAdd: false, isFormEdit: false })]
    },
    ...mapActions({
      async doUpdateSearch (dispatch, q) {
        const { commit } = this.$store
        await commit(UPDATE_DEPARTMENT_STATE, { paging: { _page: 1 } })
        await dispatch(REQUEST_DEPARTMENT_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_DEPARTMENT_LIST)
      },
      async doAddUpdate (dispatch) {
        const { item } = this.$store.state.department
        await dispatch(has(item, 'id') ? REQUEST_DEPARTMENT_UPDATE : REQUEST_DEPARTMENT_ADD)
      },
    }),
    async doEdit (item) {
      const { commit } = this.$store
      return commit(UPDATE_DEPARTMENT_STATE, { item, isFormAdd: false, isFormEdit: true })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_DEPARTMENT_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doAdd () {
      const { commit } = this.$store
      const item = {
        name: '',
        status: 'inactive',
      }
      return commit(UPDATE_DEPARTMENT_STATE, { item, isFormAdd: true, isFormEdit: false })
    },
    async doUpdateDepartmentData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.department
      return commit(UPDATE_DEPARTMENT_STATE, { item: merge({}, item, { [key]: val }) })
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
