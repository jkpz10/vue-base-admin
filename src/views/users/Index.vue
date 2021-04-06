<template>
  <v-container id="users" tag="section">
    <v-row no-gutters>
      <v-col :cols="isShowForm ? 8 : 12">
        <div class="pos-relative d-flex justify-space-between align-center">
          <div class="text-h3">
            {{ companyName }}
          </div>
          <div v-if="!isShowForm" class="pos-relative d-flex flex-row-reverse">
            <v-btn elevation="0" class="mr-1 inde btn btn--save" @click="doAdd">
              Add <v-icon color="white" right v-text="'mdi-account-plus'" />
            </v-btn>
            <v-btn class="inde btn btn--export mr-2" elevation="0" @click="doExport">
              Export <v-icon color="white" right v-text="'mdi-export-variant'" />
            </v-btn>
          </div>
        </div>
        <v-card class="wp wp--table pa-2 mr-1" outlined rounded="md">
          <v-overlay :value="isFetching" absolute z-index="1">
            <v-progress-circular indeterminate size="36" />
          </v-overlay>
          <div class="d-flex justify-space-between align-center ml-2">
            <div class="d-flex flex-column">
              <h4 class="text--card text--card__title">
                Company Users
              </h4>
              <h3 class="text--card text--card__subtitle">
                All registered users
              </h3>
            </div>
            <div class="d-flex align-center">
              <v-text-field
                v-model="search"
                hint="Hit enter for result. Case sensitive."
                label="Search"
                prepend-inner-icon="mdi-magnify"
                class="input--search pr-4"
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
          >
            <template v-slot:item.status="{ item }">
              <div style="width: 120px">
                {{ $t(`user_status.${item.status || "inactive"}`) }}
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <div style="width: 80px">
                <v-btn
                  tile
                  icon
                  x-small
                  class="btn--row_edit mr-2"
                  :to="`/user/${item.id}`"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </template>
            <template v-slot:item.group="{ item }">
              <div style="width: 120px">
                {{ $t(`user_group.${item.group}`) }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col v-show="isAddMode" cols="4">
        <v-card class="wp wp--form px-4 py-2 mt-10">
          <sign-up-form
            :info="item"
            :is-saving="isSaving"
            :do-update-data="doUpdateData"
            :do-cancel="doCancel"
            :do-save="doAddItem"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { merge, isEqual, pick } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { REQUEST_USER_LIST, REQUEST_USER_SIGNUP_MANUALLY, RESET_USER_STATE, UPDATE_USER_STATE } from '../../store/modules/user'
import { initComponent } from '../../lib'
import SignUpForm from './components/SignUpForm'
import { RESET_UE_STATE } from '../../store/modules/user-events'
import { TEMPORARY_PASSWORD } from '../../constants'

export default initComponent('Users', {
  isPage: true,
  components: {
    SignUpForm,
  },
  data () {
    return {
      headers: [
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
        return state.user.paging.q
      },
      async set (q) {
        const { commit } = this.$store
        return commit(UPDATE_USER_STATE, { paging: { q } })
      },
    },
    options: {
      get () {
        const { state } = this.$store
        const { paging } = state.user
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { commit, dispatch, state: { user } } = this.$store
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }

        if (!isEqual(paging, pick(user.paging, '_limit,_page,sort'.split(',')))) {
          await commit(UPDATE_USER_STATE, { paging })
          await dispatch(REQUEST_USER_LIST)
        }
      },
    },
    formClass () {
      const { user } = this.$store.state
      if (user.parentId) {
        return 'form--child'
      }
      if (user.item) {
        return 'form--addedit'
      }
      return ''
    },
    ...mapState({
      q: (state) => state.user.paging.q,
      items: (state) => state.user.items,
      item: (state) => state.user.item,
      paging: (state) => state.user.paging,
      isFetching: (state) => state.user.isFetching,
      isAddMode: (state) => state.user.isFormAdd,
      isSaving: (state) => state.user.isSaving,
      isShowForm: (state) => {
        const { isFormAdd, isFormEdit } = state.user
        return isFormAdd || isFormEdit
      },
    }),
  },
  methods: {
    async onReady () {
      const { $store: { dispatch, commit } } = this
      await commit(RESET_USER_STATE)
      await Promise.all([
        commit(RESET_UE_STATE),
        commit(UPDATE_USER_STATE, { isFormAdd: false, isFormEdit: false }),
        dispatch(REQUEST_USER_LIST),
      ])
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    ...mapActions({
      async doUpdateSearch (dispatch) {
        const { commit } = this.$store
        await commit(UPDATE_USER_STATE, { paging: { _page: 1 } })
        return dispatch(REQUEST_USER_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_USER_LIST)
      },
      async doAddItem (dispatch) {
        return dispatch(REQUEST_USER_SIGNUP_MANUALLY)
      },
    }),
    doExport () {},
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_USER_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doAdd () {
      const { commit } = this.$store
      const item = {
        name: '',
        phone: '',
        email: '',
        password: TEMPORARY_PASSWORD,
      }
      return commit(UPDATE_USER_STATE, { item, isSaving: false, isFormAdd: true, isFormEdit: false })
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.user
      return commit(UPDATE_USER_STATE, { item: merge({}, item, { [key]: val }) })
    },
  },
})
</script>
<style lang="sass" scoped>
.form--addedit
  margin-top: 66px

.wp
  &--table
    .input--search
      width: 250px
</style>
