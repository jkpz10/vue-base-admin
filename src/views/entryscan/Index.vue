<template>
  <v-app class="main-container app-bg">
    <v-container class="fill-height" fluid>
      <div v-if="showScanner" class="d-flex flex-column align-center justify-stretch flex-fill">
        <v-img src="@/assets/company-logo.png" height="60" contain />
        <h4 class="white--text mt-3 mt-0 pb-0">
          Hold your Work Pass QR up to the camera for entry.
        </h4>
        <v-card class="elevation-12 mt-3">
          <v-card-text>
            <qrcode-stream @decode="onDecode" />
          </v-card-text>
        </v-card>
        <v-progress-circular v-if="isSaving" indeterminate color="white" class="my-3 mr-3" />
        <div v-else>
          <div v-if="message" class="d-flex justify-center align-center">
            <v-alert border="left" class="message mt-2 pb-2 pt-3 px-2" :class="messageColor">
              <div class="mr-2">
                {{ message }}
              </div>
              <template v-slot:prepend>
                <v-icon class="alert_icon pa-1 mx-1" v-text="'mdi-exclamation-thick'" />
              </template>
            </v-alert>
            <v-btn v-if="isSuccess === false" fab dark small color="primary" class="ml-2" @click="doToggleScanner()">
              <v-icon v-text="'mdi-refresh'" />
            </v-btn>
          </div>
          <v-btn v-else icon color="white" @click="doToggleScanner()">
            <v-icon v-text="'mdi-arrow-left'" />
          </v-btn>
        </div>
      </div>
      <v-card v-else elevation="12" tile class="mx-auto">
        <div class="d-flex flex-row align-start justify-space-between header app-bg">
          <div class="label mr-4">
            Select Facility
          </div>
          <v-img
            class="white--text"
            contain
            max-width="130"
            src="@/assets/company-logo.png"
          />
        </div>
        <validation-observer ref="observer" v-slot="{ invalid }">
          <v-card-text class="px-4">
            <validation-provider
              v-slot="{ errors }"
              name="Facility"
              rules="required"
            >
              <v-combobox
                v-model="facility"
                label="Facility"
                :error-messages="errors"
                :items="facilities"
                item-text="name"
                item-value="id"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'facility')"
              />
            </validation-provider>
          </v-card-text>
          <v-card-actions class="px-4 pt-2 pb-4 d-flex justify-end">
            <v-progress-circular v-if="isFetching" indeterminate color="primary" class="mr-3" />
            <v-btn
              v-else
              color="primary"
              :disabled="invalid"
              class="inde btn btn--back mr-0"
              @click="doToggleScanner()"
            >
              Select <v-icon right color="white" v-text="'mdi-send'" />
            </v-btn>
          </v-card-actions>
        </validation-observer>
      </v-card>
    </v-container>
    <base-snack-bars :objects.sync="snackBars" />
  </v-app>
</template>

<script>
import { merge, find } from 'lodash'
import { initComponent } from '../../lib'
import MobileQrView from './components/MobileQrView'
import { mapState, mapActions } from 'vuex'
import { UPDATE_SCAN_STATE, REQUEST_SCAN_FACILITY_LIST, REQUEST_SCAN_USER_ENTER } from '../../store/modules/entry-scan' // REQUEST_SCAN_FACILITY_LIST, REQUEST_SCAN_FACILITY_SELECTED

export default initComponent('EntryScan', {
  isPage: true,
  components: {
    MobileQrView,
  },
  computed: {
    messageColor () {
      return this.isSuccess ? 'alert__success light-green accent-2 black--text' : 'alert__error red lighten-2 white--text'
    },
    facility: {
      get () {
        const { facilities, item: { facility_id: id } } = this
        return (find(facilities, { id }) || {}).name || id
      },
      async set (v) {
        return this.doUpdateData(v.id, 'facility_id')
      },
    },
    ...mapState({
      item: (state) => state.entryScan.item,
      message: (state) => state.entryScan.message,
      facilities: (state) => state.entryScan.facilities,
      isSuccess: (state) => state.entryScan.isSuccess,
      isFetching: (state) => state.entryScan.isFetching,
      isSaving: (state) => state.entryScan.isSaving,
      showScanner: (state) => state.entryScan.showScanner,
    }),
  },
  methods: {
    ...mapActions({
      async doEnterUser (dispatch) {
        return dispatch(REQUEST_SCAN_USER_ENTER)
      },
    }),
    async onReady () {
      const { dispatch, commit, state: { entryScan, app: { user } } } = this.$store
      const item = {
        ...entryScan.item,
        approver_id: user.id,
        facility_id: null,
      }
      await Promise.all([
        commit(UPDATE_SCAN_STATE, { isFetching: false, item }),
        dispatch(REQUEST_SCAN_FACILITY_LIST),
      ])
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      return commit(UPDATE_SCAN_STATE, { item: merge({}, state.entryScan.item, { [key]: val }) })
    },
    async doToggleScanner () {
      const { commit, state: { entryScan } } = this.$store
      return commit(UPDATE_SCAN_STATE, { showScanner: !entryScan.showScanner, isSuccess: null, message: null })
    },
    async onDecode (decodedString) {
      const { commit, dispatch, state: { entryScan } } = this.$store // dispatch
      let res = {}
      try {
        res = JSON.parse(decodedString)
      } catch (err) {
        return commit(UPDATE_SCAN_STATE, { isSuccess: false, message: 'Invalid QRCode. Please try again.' })
      }

      const { id, company_id: company, capture_id: capture } = res
      if (!id || !company || !capture) {
        return commit(UPDATE_SCAN_STATE, { isSuccess: false, message: 'Invalid QRCode Content. Please try again.' })
      }

      const item = {
        id,
        ...entryScan.item,
        company_id: company,
      }
      await commit(UPDATE_SCAN_STATE, { item })
      await dispatch(REQUEST_SCAN_USER_ENTER)
    },
  },
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
$header: 66px
.v-card
  .header
    height: $header
    padding: 16px 18px 0px
    .label
      @include font(400, 24px)
      color: #fff
.alert__error .alert_icon
  color: white
</style>
