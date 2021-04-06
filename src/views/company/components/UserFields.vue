<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col class="pos-relative pt-4 py-2 px-4" cols="12" :md="isShowForm ? 8 : 12">
        <v-overlay :value="isFetching" absolute z-index="1">
          <v-progress-circular indeterminate size="36" />
        </v-overlay>
        <div class="d-flex justify-space-between align-center ml-2">
          <div class="d-flex flex-column flex-fill align-start justify-end">
            <h4 class="text--card text--card__title flex-fill">
              Company Meta Fields
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
            <v-btn elevation="0" class="inde text-uppercase btn btn--add ma-0" @click="doAdd">
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
          <template v-slot:item.status="{ item }">
            <div style="width: 120px;">
              <div style="width: 120px;">
                {{ $t(`user_status.${item.status || 'inactive'}`) }}
              </div>
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
            <div style="width: 80px;">
              <v-btn tile icon x-small class="inde btn--row_edit mr-2" @click="doEdit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
      <v-col v-if="isShowForm" cols="12" md="4">
        <add-edit-user-field-form
          class="mr-4 ml-1 my-4"
          :info="item"
          :is-saving="isSaving"
          :do-update-data="doUpdateUserFieldData"
          :do-save="doAddUpdate"
          :do-cancel="doCancel"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { cloneDeep, set } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../../lib'
import { REQUEST_CM_INFO, REQUEST_CM_UPDATE, UPDATE_CM_STATE } from '../../../store/modules/user-fields'
import AddEditUserFieldForm from './AddEditUserFieldForm'

export default initComponent('UserFields', {
  components: {
    AddEditUserFieldForm,
  },
  data () {
    return {
      search: '',
      headers: [
        {
          text: 'ID',
          value: 'tag',
        },
        {
          text: 'Label',
          value: 'label',
        },
        {
          text: 'Values',
          value: 'values',
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
    ...mapState({
      items: (state) => state.userFields.items,
      item: (state) => state.userFields.item,
      isFetching: (state) => state.userFields.isFetching,
      isAddMode: (state) => state.userFields.isFormAdd,
      isEditMode: (state) => state.userFields.isFormEdit,
      isSaving: (state) => state.userFields.isSaving,
      isShowForm: (state) => state.userFields.isFormEdit || state.userFields.isFormAdd,
    }),
  },
  methods: {
    async onReady () {
      const { $store: { dispatch } } = this
      return dispatch(REQUEST_CM_INFO)
    },
    ...mapActions({
      async doAddUpdate (dispatch) {
        await dispatch(REQUEST_CM_UPDATE)
      },
    }),
    async doEdit (item) {
      const { commit } = this.$store
      return commit(UPDATE_CM_STATE, { item, isFormAdd: false, isFormEdit: true })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_CM_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doAdd () {
      const { commit } = this.$store
      const item = {
        tag: '',
        values: [],
        status: 'inactive',
      }
      return commit(UPDATE_CM_STATE, { item, isFormAdd: true, isFormEdit: false })
    },
    async doUpdateUserFieldData (val, key) {
      const { commit, state } = this.$store
      const item = cloneDeep(state.userFields.item)
      set(item, key, val)
      return commit(UPDATE_CM_STATE, { item })
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
</style>
