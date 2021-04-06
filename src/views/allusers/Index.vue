<template>
  <v-container
    id="users"
    tag="section"
  >
    <v-row no-gutters>
      <v-col :cols="isShowForm ? 8 : 12">
        <div v-if="!isShowForm" class="pos-relative d-flex flex-row-reverse">
          <v-btn elevation="0" class="mr-1 inde btn btn--save" @click="doAdd">
            Add <v-icon color="white" right v-text="'mdi-account-plus'" />
          </v-btn>
          <v-btn class="inde btn btn--export mr-2" elevation="0" @click="doExport">
            Export <v-icon color="white" right v-text="'mdi-export-variant'" />
          </v-btn>
        </div>
        <v-card class="wp wp--table pa-2 mr-1" :class="isShowForm && 'mt-9'" outlined rounded="md">
          <v-overlay :value="isFetching" absolute z-index="1">
            <v-progress-circular indeterminate size="36" />
          </v-overlay>
          <div class="d-flex justify-space-between">
            <div class="pt-2 pl-2 d-flex flex-column">
              <h4 class="text--card text--card__title">
                All Users
              </h4>
              <h3 class="text--card text--card__subtitle">
                All registered users of all companies
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
            class="tablelist tablelist--users"
            @click:row="doEdit"
          >
            <template v-slot:item.status="{ item }">
              <div style="width: 120px;">
                {{ $t(`user_status.${item.status || 'inactive'}`) }}
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <div style="width: 80px;">
                <v-btn tile icon x-small class="inde btn--row_edit mr-2" @click="doEdit(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </template>
            <template v-slot:item.company_id="{ item }">
              {{ getCompanyInfo(item.company_id).name }}
            </template>
            <template v-slot:item.group="{ item }">
              <div style="width: 120px;">
                {{ $t(`user_group.${item.group}`) }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-fade-transition
          leave-absolute
          hide-on-leave
        >
          <v-card
            v-show="isEditMode"
            class="wp wp--form px-4 py-2 mt-9"
          >
            <edit-user-form
              :info="item"
              :is-saving="isSaving"
              :do-update-data="doUpdateData"
              :do-cancel="doCancel"
              :do-save="doUpdateItem"
              :on-avatar-change="onAvatarChange"
            />
          </v-card>
        </v-fade-transition>
        <v-fade-transition
          leave-absolute
          hide-on-leave
        >
          <v-card
            v-show="isAddMode"
            class="wp wp--form px-4 py-2 mt-9"
          >
            <sign-up-form
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
import { REQUEST_AU_SIGNUP_MANUALLY, REQUEST_AU_LIST, REQUEST_AU_UPDATE_USER, UPDATE_AU_STATE } from '../../store/modules/all-users'
import EditUserForm from './components/EditUserForm'
import SignUpForm from './components/SignUpForm'
import { initComponent } from '../../lib'
import { TEMPORARY_PASSWORD } from '../../constants'

export default initComponent('AllUsers', {
  isPage: true,
  components: {
    EditUserForm,
    SignUpForm,
  },
  data () {
    return {
      headers: [
        {
          text: 'Company',
          value: 'company_id',
        },
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Email',
          value: 'email',
        },
        {
          text: 'Phone',
          value: 'phone',
        },
        {
          text: 'Group',
          value: 'group',
        },
        {
          text: 'Department',
          value: 'department_name',
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
        return state.allUsers.paging.q
      },
      async set (q) {
        const { commit } = this.$store
        return commit(UPDATE_AU_STATE, { paging: { q } })
      },
    },
    options: {
      get () {
        const { state } = this.$store
        const { paging } = state.allUsers
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { commit, dispatch, state: { allUsers } } = this.$store
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }
        if (!isEqual(paging, pick(allUsers.paging, '_limit,_page,sort'.split(',')))) {
          await commit(UPDATE_AU_STATE, { paging })
          await dispatch(REQUEST_AU_LIST)
        }
      },
    },
    ...mapState({
      q: (state) => state.allUsers.paging.q,
      items: (state) => state.allUsers.items,
      item: (state) => state.allUsers.item,
      paging: (state) => state.allUsers.paging,
      isFetching: (state) => state.allUsers.isFetching,
      isSaving: (state) => state.allUsers.isSaving,
      isShowForm: (state) => {
        const { isFormAdd, isFormEdit } = state.allUsers
        return isFormAdd || isFormEdit
      },
      isAddMode: (state) => state.allUsers.isFormAdd,
      isEditMode: (state) => state.allUsers.isFormEdit,
    }),
  },
  methods: {
    async onReady () {
      const { dispatch } = this.$store
      return dispatch(REQUEST_AU_LIST)
    },
    ...mapActions({
      async doUpdateSearch (dispatch, q) {
        const { commit } = this.$store
        await commit(UPDATE_AU_STATE, { paging: { _page: 1 } })
        return dispatch(REQUEST_AU_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_AU_LIST)
      },
      async doUpdateItem (dispatch) {
        return dispatch(REQUEST_AU_UPDATE_USER)
      },
      async doAddItem (dispatch) {
        return dispatch(REQUEST_AU_SIGNUP_MANUALLY)
      },
    }),
    doExport () {},
    async doAdd () {
      const { commit } = this.$store
      const item = {
        name: '',
        phone: '',
        email: '',
        password: TEMPORARY_PASSWORD,
      }
      return commit(UPDATE_AU_STATE, { item, isFormAdd: true, isFormEdit: false })
    },
    async doEdit (item) {
      const { commit } = this.$store
      return commit(UPDATE_AU_STATE, { item, isFormAdd: false, isFormEdit: true })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_AU_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.allUsers
      return commit(UPDATE_AU_STATE, { item: merge({}, item, { [key]: val }) })
    },
    async onAvatarChange (item) {
      const { commit } = this.$store
      await commit(UPDATE_AU_STATE, { item })
    },
  },
})
</script>
<style lang="sass" scoped></style>
