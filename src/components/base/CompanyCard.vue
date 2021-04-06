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
      <div class="pos-relative addedit--avatar d-flex justify-center">
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
          name="Address"
          rules="required"
        >
          <v-text-field
            label="Address"
            :value="info.addr"
            :error-messages="errors"
            @input="(x) => doUpdateData(x, 'addr')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="City"
          rules="required"
        >
          <v-text-field
            label="City"
            :value="info.city"
            :error-messages="errors"
            @input="(x) => doUpdateData(x, 'city')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="State"
          rules="required"
        >
          <v-text-field
            label="State"
            :value="info.state"
            :error-messages="errors"
            @input="(x) => doUpdateData(x, 'state')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Zip"
          rules="required"
        >
          <v-text-field
            label="Zip"
            :value="info.zip"
            :error-messages="errors"
            @input="(x) => doUpdateData(x, 'zip')"
          />
        </validation-provider>
        <v-switch
          v-model="status"
          :label="$t(`user_status.${statusText}`)"
        />
        <v-alert
          v-if="info.is_public"
          border="top"
          color="red lighten-1"
          dark
        >
          Public Company
        </v-alert>
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
export default {
  name: 'CompanyCard',

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
    statusText () {
      return this.info.status || 'inactive'
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
