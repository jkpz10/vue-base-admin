<template>
  <v-card
    v-bind="$attrs"
    class="addedit addedit--wrapper pos-relative pb-6"
  >
    <v-overlay
      :value="isSaving"
      absolute
      z-index="1"
    >
      <v-progress-circular
        indeterminate
        size="36"
      />
    </v-overlay>
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <div
        v-if="info.id"
        class="pos-relative addedit--avatar d-flex justify-center"
      >
        <v-avatar
          color="indigo"
          size="100"
          class="elevation-3"
        >
          <img
            v-if="info.url"
            :src="info.url"
            alt="Avatar"
          >
          <v-icon
            v-else
            color="black"
            v-text="'mdi-account'"
          />
        </v-avatar>
      </div>
      <div class="pos-relative addedit--form">
        <div
          v-if="!info.id"
        >
          <div class="text-h3 mt-4">
            New Sub Account
          </div>
          <div class="font-weight-light text-body-2 red lighten-1 white--text py-1 px-2">
            Note: For adding company user, use the sign up page
          </div>
        </div>
        <validation-provider
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <v-text-field
            label="Name"
            :value="info.name"
            :error-messages="errors"
            @input="(x) => doUpdateData(x, 'name')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Email"
          rules="required|email"
        >
          <v-text-field
            label="Email"
            :value="info.email"
            :error-messages="errors"
            @input="(x) => doUpdateData(x, 'email')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Phone"
          rules="required"
        >
          <vue-tel-input-vuetify
            label="Phone"
            :value="info.phone"
            :error-messages="errors"
            default-country="US"
            disabled-fetching-country
            mode="international"
            :preferred-countries="['US', 'PH']"
            @input="(x) => doUpdateData(x, 'phone')"
          />
        </validation-provider>
        <v-switch
          v-model="status"
          :label="$t(`user_status.${statusText}`)"
        />
        <v-divider class="my-4" />
        <div
          v-if="info.company_id"
        >
          <div class="text-h4 mb-2">
            Company Details
          </div>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>Company Name</v-list-item-title>
              <v-list-item-subtitle>{{ company.name }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-for="(x, i) in companyDetails"
            :key="i"
            two-line
          >
            <v-list-item-content>
              <v-list-item-title v-text="x.label" />
              <v-list-item-subtitle v-text="info[x.key] || '--'" />
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-chip
          v-else
          color="red lighten-1"
          dark
        >
          non-company
        </v-chip>
      </div>
      <div class="addedit--action d-flex flex-row-reverse mt-4">
        <v-btn
          elevation="0"
          small
          color="pink darken-1"
          @click="doCancel"
        >
          Cancel <v-icon
            color="white"
            right
          >
            mdi-close-circle-outline
          </v-icon>
        </v-btn>
        <v-btn
          elevation="0"
          color="light-green lighten-1"
          small
          :disabled="invalid"
          @click="doSave"
        >
          Save <v-icon
            color="white"
            right
          >
            mdi-content-save-outline
          </v-icon>
        </v-btn>
      </div>
    </validation-observer>
  </v-card>
</template>

<script>
import { find, get } from 'lodash'

export default {
  name: 'AllUserCard',

  props: {
    isSaving: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    doSave: {
      type: Function,
      default: () => ({}),
    },
    doCancel: {
      type: Function,
      default: () => ({}),
    },
    doUpdateData: {
      type: Function,
      default: () => ({}),
    },
  },
  data: () => ({}),
  computed: {
    status: {
      get () {
        const { status } = this.info
        return status === 'active'
      },
      async set (v) {
        const value = v ? 'active' : 'inactive'
        return this.doUpdateData(value, 'status')
      },
    },
    company () {
      const { state } = this.$store
      return find(get(state, 'app.appData.companies', []), { id: this.info.company_id }) || {}
    },
    companyDetails () {
      return [
        { key: 'department_name', label: 'Department' },
        { key: 'reporting_mgr_name', label: 'Supervisor' },
        { key: 'reporting_mgr_email', label: 'Supervisor Email' },
      ]
    },
    statusText () {
      return this.info.status || 'inactive'
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
