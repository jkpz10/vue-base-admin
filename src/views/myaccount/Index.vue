<template>
  <v-container class="d-flex justify-center pt-16">
    <v-sheet width="400" class="pos-relative">
      <v-overlay :value="isFetching" absolute z-index="1">
        <v-progress-circular indeterminate size="36" />
      </v-overlay>
      <div class="pos-relative mt-n8 ml-n3">
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
      <div class="px-4 py-4 pos-relative">
        <edit-user-form
          :info="item"
          :is-saving="isSaving"
          :do-update-data="doUpdateData"
          :do-save="doUpdateItem"
        />
      </div>
    </v-sheet>
  </v-container>
</template>

<script>
import { merge } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { ROUTE_MYACCOUNT, ROUTE_USER_AGREEMENT } from '../../constants'
import { initComponent } from '../../lib'
import { LOAD_USER_INFORMATION } from '../../store/modules/app'
import { REQUEST_PROFILE_INFO, REQUEST_PROFILE_UPDATE, UPDATE_PROFILE_STATE } from '../../store/modules/profile'
import EditUserForm from './components/EditUserForm'

export default initComponent('MyAccount', {
  isPage: true,
  components: {
    EditUserForm,
  },
  computed: {
    ...mapState({
      isSaving: (state) => state.profile.isSaving,
      isFetching: (state) => state.profile.isFetching,
      item: (state) => state.profile.item,
      companyName: (state) => state.app.appData.companyName,
    }),
  },
  methods: {
    async onUserRequiresToAgree () {
      const { query = {} } = this.$route
      this.$router.push({ name: ROUTE_USER_AGREEMENT, query: { ...query, redirect: ROUTE_MYACCOUNT } })
    },
    async onReady () {
      const { dispatch, commit, state } = this.$store
      const { id } = state.app.user
      await commit(UPDATE_PROFILE_STATE, { item: { id } })
      await Promise.all([
        dispatch(REQUEST_PROFILE_INFO),
      ])
    },
    ...mapActions({
      async doUpdateItem (dispatch) {
        return dispatch(REQUEST_PROFILE_UPDATE)
      },
    }),
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const { item } = state.profile
      return commit(UPDATE_PROFILE_STATE, { item: merge({}, item, { [key]: val }) })
    },
    async onAvatarChange (item) {
      const { commit, dispatch } = this.$store
      await Promise.all([
        dispatch(LOAD_USER_INFORMATION),
        commit(UPDATE_PROFILE_STATE, { item }),
      ])
    },
  },
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
.uploader--avatar
  top: 0px
.wp
  &--debug
    padding: 4px 8px
</style>
