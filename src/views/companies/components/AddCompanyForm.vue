<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="text-h5">
      Add New Company
    </div>
    <div class="text-subtitle">
      Fill out the minimum details required for a company.
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
      {{ statusText }}
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
      <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
        Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
      </v-btn>
      <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
        Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
      </v-btn>
    </div>
  </validation-observer>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('AddCompanyForm', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text-subtitle
  @include font(300, 11px)
</style>
