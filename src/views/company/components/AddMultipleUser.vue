<template>
  <v-container class="pa-0 pos-relative">
    <v-overlay :value="isProcessing" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="d-flex justify-space-between align-center ml-2 pos-relative py-2 px-4 pt-4">
      <div class="d-flex flex-column flex-fill align-start justify-end">
        <h4 class="text--card text--card__title flex-fill">
          Company User Stats
        </h4>
      </div>
    </div>
    <v-row no-gutters class="ml-2 py-2 px-4">
      <v-col cols="6" md="2">
        <v-text-field
          label="Active Users"
          :value="stat.total_users || 0"
          type="number"
          hide-details
          readonly
        />
      </v-col>
      <v-col cols="6" md="2" class="ml-2">
        <validation-provider
          v-slot="{ errors }"
          name="Max Users"
          rules="required|numeric|max:1000|min:0"
        >
          <v-text-field
            :value="item.max_user_count || 0"
            label="Max Users"
            class="pos-relative"
            :error-messages="errors"
            hide-details="auto"
            type="number"
            @input="(x) => doUpdateCompanyData(x, 'max_user_count')"
          >
            <template v-if="$api.isSuperuser()" v-slot:append>
              <v-btn icon small class="cursor-pointer inde green--text mr-2" @click="doSaveMaxUserCount">
                <v-icon v-text="'mdi-content-save-outline'" />
              </v-btn>
            </template>
          </v-text-field>
        </validation-provider>
      </v-col>
    </v-row>
    <div class="d-flex justify-space-between align-center ml-2 pos-relative py-2 px-4 pt-4">
      <div class="d-flex flex-column flex-fill align-start justify-end">
        <h4 class="text--card text--card__title flex-fill">
          Import Users
        </h4>
        <h3 class="text--card text--card__subtitle">
          Upload a CSV file to add users to your companies account.
        </h3>
      </div>
    </div>
    <h4 class="text--card text--card__subtitle flex-fill px-4 pt-4">
      Example CSV Layout
    </h4>
    <v-card tile class="pa-1 mt-1">
      <excel-table class="pos-relative full-width" :link="registrationLink" :fields="fields" />
    </v-card>
    <div class="pos-relative mb-1">
      <v-list v-if="forRegistration.length" class="py-0">
        <v-list-item v-for="(item, i) in forRegistration" :key="i" class="py-0">
          <v-list-item-icon class="mr-1 pos-relative py-0">
            <v-progress-circular v-if="item.isProcessing" class="mt-1" color="teal" indeterminate width="2" size="16" />
            <v-icon v-else class="mt-1" :color="item.isError ? 'red' : 'green'" small v-text="item.isError ? 'mdi-close-circle' : 'mdi-check-circle'" />
          </v-list-item-icon>
          <v-list-item-content class="py-0">
            <v-list-item-title class="white--green" v-text="item.name" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <div v-if="messages.length">
        <v-list class="red lighten-5">
          <v-list-item v-for="(item, i) in messages" :key="i" class="my-n2">
            <v-list-item-icon class="mr-4">
              <v-chip class="red white--text" v-text="item.index" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.message" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div class="d-flex justify-end py-2">
          <v-btn small class="inde btn--back white--text mr-2" @click="doRefresh">
            <v-icon left v-text="'mdi-refresh'" /> Retry
          </v-btn>
        </div>
      </div>
      <upload-csv-form v-else :is-uploading="isUploading" :info="info" />
    </div>
  </v-container>
</template>

<script>
import { merge, keys } from 'lodash'
import { mapState } from 'vuex'
import { initComponent } from '../../../lib'
import { REQUEST_COMPANY_STAT, REQUEST_COMPANY_UPDATE, UPDATE_COMPANY_STATE } from '../../../store/modules/company'
import UploadCsvForm from './UploadCsvForm'
import ExcelTable from './ExcelTable'
import { TEMPORARY_PASSWORD } from '../../../constants'
import { COLOR_WARNING, SNACKBAR_ADD } from '../../../store'

export default initComponent('AddMultipleUser', {
  data () {
    return {
      password: TEMPORARY_PASSWORD,
    }
  },
  components: {
    UploadCsvForm,
    ExcelTable,
  },
  computed: {
    ...mapState({
      isSaving: (state) => state.company.isSaving,
      isFetching: (state) => state.company.isFetching,
      isUploading: (state) => state.company.isUploading,
      stat: (state) => state.company.stat,
      item: (state) => state.company.company,
      messages: (state) => state.company.uploadMessages || [],
      forRegistration: (state) => state.company.forRegistration || [],
      fields: (state) => {
        const { commonFields, company: { meta = {} } } = state.company
        return commonFields.concat(keys(meta).map((x) => (`meta_${x}`)))
      },
      info (state) {
        const { fields = [] } = this
        const { company, userFields, app: { appData } } = state
        return {
          fields,
          company: company.company,
          departments: appData.departments,
          users: appData.users,
          metaFields: userFields.items,
        }
      },
      registrationLink () {
        return `https://${this.$api.isStage ? 'staging.' : ''}admin.vitacorpo.com/confirm/<USER_EMAIL_HERE>/${this.password}`
      },
    }),
    isProcessing () {
      const { isSaving, isFetching } = this
      return isSaving || isFetching
    },
  },
  methods: {
    btnUploader () {
      this.$refs.uploader.$refs.input.click()
    },
    async onReady () {
      const { $store: { dispatch } } = this
      return dispatch(REQUEST_COMPANY_STAT)
    },
    async doUpdateCompanyData (val, key) {
      const { dispatch, commit, state } = this.$store
      if (!this.$api.isSuperuser()) {
        return dispatch(SNACKBAR_ADD, {
          message: 'You are not allowed to perform this task.',
          color: COLOR_WARNING,
        })
      }
      const { stat } = state.company
      return commit(UPDATE_COMPANY_STATE, { stat: merge({}, stat, { [key]: val }) })
    },
    async doSaveMaxUserCount () {
      const { dispatch, commit, state } = this.$store
      const { company, stat: { max_user_count: c } } = state.company
      await commit(UPDATE_COMPANY_STATE, { company: merge({}, company, { max_user_count: c }) })
      await dispatch(REQUEST_COMPANY_UPDATE)
    },
    async doRefresh () {
      const { commit } = this.$store
      await commit(UPDATE_COMPANY_STATE, { uploadMessages: [] })
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text
  @include font(500, 14px)
  &--link
    @include font(500, 14px)
    color: #592C85
</style>
