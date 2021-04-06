<template>
  <v-card class="wp wp--overflow__hidden">
    <v-card-title class="pos-relative text--title text-h5 d-flex flex-row-reverse py-2 px-8">
      <h4 class="text--card text--card__title text-uppercase white--text">
        Main Contact
      </h4>
    </v-card-title>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <v-overlay :value="isSaving" absolute z-index="1">
        <v-progress-circular indeterminate size="36" />
      </v-overlay>
      <div class="py-2 px-4 mt-n2">
        <validation-provider
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <v-text-field
            label="Name"
            :value="info.name"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'name')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Reporting Manager"
          rules="required|email"
        >
          <v-text-field
            label="Reporting Manager"
            :value="info.reporting_mgr_email"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'reporting_mgr_email')"
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
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'email')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Department"
          rules="required"
        >
          <v-combobox
            v-model="department"
            label="Department"
            :error-messages="errors"
            :items="departments"
            hide-details="auto"
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
            class="mb-n2"
            @input="(x) => doUpdateData(x, 'phone')"
          />
        </validation-provider>
      </div>
      <v-card-actions class="px-4 pt-4 d-flex justify-end">
        <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
          Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
        </v-btn>
      </v-card-actions>
    </validation-observer>
  </v-card>
</template>

<script>
import { initComponent } from '../../../lib'
export default initComponent('EditContactForm', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text--title
  background-color: #2F96DE
</style>
