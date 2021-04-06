<template>
  <v-container
    v-cloak
    id="user"
    tag="section"
    class="wp--scrollable wp--scrollable__x px-5 ma-0"
  >
    <div class="wp wp--user px-4 py-2 mt-9">
      <v-overlay :value="isFetching" absolute z-index="2">
        <v-progress-circular indeterminate size="36" />
      </v-overlay>
      <div class="pos-relative d-flex justify-space-between">
        <div class="addedit--avatar d-flex justify-center">
          <v-avatar
            color="indigo"
            size="80"
            class="elevation-3 mb-4"
          >
            <img
              v-if="item.url"
              :src="item.url"
              alt="Avatar"
            >
            <v-icon
              v-else
              color="black"
              x-large
              v-text="'mdi-account'"
            />
          </v-avatar>
          <base-upload-avatar
            class="pa-2 uploader--avatar pos-absolute"
            rounded="md"
            :info="item"
            label="Drag n drop avatar here"
            :on-avatar-change="onAvatarChange"
          />
        </div>
        <div>
          <v-btn icon small class="inde btn--back white--text mr-2" @click="doRefreshUserInfo">
            <v-icon v-text="'mdi-refresh'" />
          </v-btn>
          <v-btn small class="inde btn btn--back mr-2" to="/users">
            Change User <v-icon right v-text="'mdi-account-supervisor'" />
          </v-btn>
        </div>
      </div>
      <div class="d-flex mt-n6">
        <div class="d-flex flex-column px-1 pt-1 mr-5 wp wp--p1 mt-0">
          <div class="wp wp--user_info">
            <div class="caption--title text-right">
              User Info
            </div>
            <v-sheet elevation="1" class="wp--user_form pa-0">
              <edit-user-form
                class="pa-2"
                :info="item"
                :is-saving="isSaving"
                :do-update-data="doUpdateData"
                :do-save="doUpdateItem"
                :on-avatar-change="onAvatarChange"
              />
            </v-sheet>
          </div>
          <div class="wp wp--signLink">
            <v-btn block class="btn full-width btn--back" @click="doResendSignUpLink">
              EMAIL SIGN IN LINK <v-icon class="ml-5" color="white" right v-text="'mdi-send'" />
            </v-btn>
          </div>
          <div v-if="meta.length > 0" class="wp wp--user_fields">
            <edit-user-fields
              :meta="meta"
              :is-saving="isSaving"
              :do-update-data="doUpdateUserMeta"
              :do-save="doSaveUserMeta"
            />
          </div>
          <div class="wp wp--wearables">
            <wearables :items="wearables" :is-fetching="isFetching" />
          </div>
          <div class="wp wp--dependents">
            <dependents
              :items="dependents"
              :is-fetching="isFetching"
            />
          </div>
        </div>
        <div class="d-flex flex-column pa-1 wp mt-0 full-height">
          <div class="d-flex flex-column align-stretch wp full-height">
            <div class="caption--title">
              User Workplace Health Story
            </div>
            <v-sheet elevation="1" class="wp wp--work_health_history mt-0 pa-2 pt-0">
              <work-place-health-story
                ref="userEH"
                :info="item"
                :is-fetching="isFetching"
              />
            </v-sheet>
          </div>
        </div>
        <div class="d-flex flex-fill">
          <div class="ml-4 d-flex flex-column pa-1 pt-8 wp mt-0 full-height">
            <line-form
              v-if="isAddingNewEvent"
              :info="eventItem"
              :is-saving="isSavingNewEvent"
              :do-update-data="doUpdateNewEventData"
              :do-cancel="doCancelNewEvent"
              :do-save="doAddUpdateNewEvent"
            />
            <line-view
              v-if="isViewingEvent"
              :info="eventItem"
              :do-update-data="doUpdateNewEventData"
            />
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { merge, indexOf, find } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../lib'
import { REQUEST_USER_INFO, REQUEST_USER_WEARABLE, REQUEST_USER_META_LIST, REQUEST_USER_UPDATE, REQUEST_USER_UPDATE_META, UPDATE_USER_STATE, REQUEST_RESEND_EMAIL, REQUEST_USER_COMPANY_META } from '../../store/modules/user'
import EditUserForm from './components/EditUserForm'
import EditUserFields from './components/EditUserFields'
import Wearables from './components/Wearables'
import Dependents from './components/Dependents'
import WorkPlaceHealthStory from './components/WorkPlaceHealthStory'
import LineView from './components/WPHS/LineView'
import LineForm from './components/WPHS/LineForm'
import { ROUTE_USERS } from '../../constants'
import { UPDATE_UE_STATE, REQUEST_UE_ADD_EVENT, REQUEST_UE_UPDATE_EVENT, RESET_UE_STATE } from '../../store/modules/user-events'

export default initComponent('User', {
  isPage: true,
  components: {
    EditUserForm,
    EditUserFields,
    Wearables,
    Dependents,
    WorkPlaceHealthStory,
    LineView,
    LineForm,
  },
  data () {
    return {}
  },
  computed: {
    ...mapState({
      companyName: (state) => state.app.appData.companyName,
      isSaving: (state) => state.user.isSaving,
      isFetching: (state) => state.user.isFetching,
      item: (state) => state.user.item,
      meta: (state) => state.user.meta,
      wearables: (state) => state.user.wearables,
      dependents: (state) => state.user.dependents,
      isAddingNewEvent: (state) => state.userEvent.isFormAdd,
      isViewingEvent: (state) => state.userEvent.isFormView,
      isSavingNewEvent: (state) => state.userEvent.isSaving,
      eventItem: (state) => state.userEvent.item,
    }),
  },
  methods: {
    ...mapActions({
      async doUpdateItem (dispatch) {
        return dispatch(REQUEST_USER_UPDATE)
      },
      async doSaveUserMeta (dispatch) {
        return dispatch(REQUEST_USER_UPDATE_META)
      },
      async doResendSignUpLink (dispatch) {
        return dispatch(REQUEST_RESEND_EMAIL)
      },
    }),
    async onReady () {
      const { params } = this.$route
      const { dispatch, commit, state } = this.$store

      await commit(UPDATE_USER_STATE, { item: { id: params.id } })
      await Promise.all([
        commit(RESET_UE_STATE),
        dispatch(REQUEST_USER_INFO),
      ])

      const { app, user } = state
      if (app.appData.company !== user.item.company_id) {
        return this.$router.push({ name: ROUTE_USERS })
      }

      await Promise.all([
        dispatch(REQUEST_USER_COMPANY_META),
        dispatch(REQUEST_USER_WEARABLE),
        dispatch(REQUEST_USER_META_LIST),
        this.$refs.userEH.onReady(),
      ])
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        this.$router.push({ name: ROUTE_USERS })
      }
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.user
      return commit(UPDATE_USER_STATE, { item: merge({}, item, { [key]: val }) })
    },
    async doUpdateUserMeta (item) {
      const { commit, state } = this.$store
      const meta = [].concat(state.user.meta)
      meta[indexOf(meta, find(meta, { id: item.id }))] = item
      return commit(UPDATE_USER_STATE, { meta })
    },
    async onAvatarChange (item) {
      const { commit } = this.$store
      await commit(UPDATE_USER_STATE, { item })
    },

    async doUpdateNewEventData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.userEvent
      return commit(UPDATE_UE_STATE, { item: merge({}, item, { [key]: val }) })
    },
    async doCancelNewEvent () {
      const { commit } = this.$store
      return commit(UPDATE_UE_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doAddUpdateNewEvent () {
      const { state, dispatch } = this.$store
      const { item } = state.userEvent
      await dispatch(item.id ? REQUEST_UE_UPDATE_EVENT : REQUEST_UE_ADD_EVENT)
    },
    async doRefreshUserInfo () {
      const { dispatch } = this.$store
      dispatch(REQUEST_USER_INFO)
    },
  },
})
</script>
<style lang="sass" scoped>
@import '@/sass/_mixins'
#user
  .caption
    &--title
      @include font(400, 13px, 'Roboto')
      padding-bottom: 4px
  .wp
    &--user
      background-color: white
      min-width: 920px
    &--p1
      padding-bottom: 2px
</style>
