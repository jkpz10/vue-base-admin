<template>
  <v-container id="entries" tag="section">
    <v-row no-gutters>
      <v-col :cols="isAddMode ? 8 : 12">
        <div class="pos-relative d-flex justify-space-between align-center">
          <div class="text-h3">
            {{ companyName }}
          </div>
        </div>
        <v-card class="wp wp--table pa-2 mr-1" outlined rounded="md">
          <v-overlay :value="isFetching" absolute z-index="1">
            <v-progress-circular indeterminate size="36" />
          </v-overlay>
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex flex-column ml-2 mt-2">
              <h4 class="text--card text--card__title">
                Entry List
              </h4>
              <h3 class="text--card text--card__subtitle">
                List of verified capture ready for entry
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
              <div class="pos-relative d-flex flex-row-reverse">
                <v-btn class="inde btn btn--export mr-2" elevation="0" @click="doExport">
                  Export <v-icon color="white" right v-text="'mdi-export-variant'" />
                </v-btn>
              </div>
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
            <template v-slot:item.user_avatar_url="{ item }">
              <div style="width: 120px;">
                <router-link :to="{ name: ROUTE_USER, params: { id: item.user_id } }">
                  <v-avatar color="white" size="42">
                    <img v-if="item.user_avatar_url" :src="item.user_avatar_url" alt="Avatar">
                    <v-icon v-else color="black" v-text="getUserInitial(item.user_name)" />
                  </v-avatar>
                </router-link>
              </div>
            </template>
            <template v-slot:item.readiness_approved="{ item }">
              <div style="width: 120px;">
                <v-icon v-if="item.readiness_approved" class="wp--icon wp--icon__green" v-text="'mdi-check'" />
                <v-icon v-else class="wp--icon wp--icon__red" v-text="'mdi-close'" />
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <div style="width: 100px;">
                <v-btn class="inde wp--btn__enter" @click="doEnterUserMode(item)">
                  Enter Facility <v-icon right v-text="'mdi-walk'" />
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="4">
        <enter-facility-form
          v-show="isAddMode"
          :info="item"
          :is-saving="isSaving"
          :do-update-data="doUpdateData"
          :do-cancel="doCancel"
          :do-save="doEnterUser"
          :facilities="facilities"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { merge, isEqual, pick } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { UPDATE_ENTRY_STATE, REQUEST_ENTRY_FACILITY_LIST, REQUEST_ENTRY_LIST, REQUEST_ENTRY_USER_ENTER, RESET_ENTRY_STATE } from '../../store/modules/entry'
import { initComponent } from '../../lib'
import EnterFacilityForm from './components/EnterFacilityForm'

export default initComponent('Entry', {
  isPage: true,
  components: {
    EnterFacilityForm,
  },
  data () {
    return {
      headers: [
        {
          text: 'Image',
          value: 'user_avatar_url',
        },
        {
          text: 'Name',
          value: 'user_name',
        },
        {
          text: 'Readiness',
          value: 'readiness_approved',
        },
        {
          text: 'Reporting Manager',
          value: 'user_reporting_mgr',
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
        return state.entry.paging.q
      },
      async set (q) {
        const { commit } = this.$store
        return commit(UPDATE_ENTRY_STATE, { paging: { q } })
      },
    },
    options: {
      get () {
        const { state } = this.$store
        const { paging } = state.entry
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { commit, dispatch, state: { entry } } = this.$store
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }
        if (!isEqual(paging, pick(entry.paging, '_limit,_page,sort'.split(',')))) {
          await commit(UPDATE_ENTRY_STATE, { paging })
          await dispatch(REQUEST_ENTRY_LIST)
        }
      },
    },
    ...mapState({
      q: (state) => state.entry.paging.q,
      items: (state) => state.entry.items,
      item: (state) => state.entry.item,
      facilities: (state) => state.entry.facilities,
      paging: (state) => state.entry.paging,
      isFetching: (state) => state.entry.isFetching,
      isSaving: (state) => state.entry.isSaving,
      isAddMode: (state) => state.entry.isFormAdd,
    }),
  },
  methods: {
    async onReady () {
      const { $store: { dispatch, commit } } = this
      await commit(RESET_ENTRY_STATE)
      await Promise.all([
        dispatch(REQUEST_ENTRY_FACILITY_LIST),
        commit(UPDATE_ENTRY_STATE, { isFormAdd: false, item: {} }),
        dispatch(REQUEST_ENTRY_LIST),
      ])
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    ...mapActions({
      async doUpdateSearch (dispatch, q) {
        const { commit } = this.$store
        await commit(UPDATE_ENTRY_STATE, { paging: { _page: 1 } })
        return dispatch(REQUEST_ENTRY_LIST)
      },
      async doClearSearch (dispatch) {
        this.search = ''
        return dispatch(REQUEST_ENTRY_LIST)
      },
      async doEnterUser (dispatch) {
        return dispatch(REQUEST_ENTRY_USER_ENTER)
      },
    }),
    doExport () {},
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_ENTRY_STATE, { item: {}, isFormAdd: false })
    },
    async doEnterUserMode (send) {
      const { commit, state } = this.$store
      const { user, appData } = state.app
      const item = {
        company_id: appData.company,
        approver_id: user.id,
        send_id: send.id,
        facility: null,
      }
      return commit(UPDATE_ENTRY_STATE, { item, isSaving: false, isFormAdd: true })
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      return commit(UPDATE_ENTRY_STATE, { item: merge({}, state.entry.item, { [key]: val }) })
    },
  },
})
</script>
<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--table
    .input--search
      width: 250px
  &--icon
    border-radius: 20px
    padding: 5px
    color: white
    &__green
      background: #42D486
    &__red
      background: #ED3D3A
  &--btn
    &__enter
      background: #2A8BD9 !important
      @include font(400, 11px)
      color: #fff
      height: 32px !important
</style>
