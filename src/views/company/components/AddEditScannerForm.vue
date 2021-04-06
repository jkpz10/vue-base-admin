<template>
  <v-card class="wp wp--overflow__hidden">
    <div class="px-3 pt-3 text-h5">
      {{ info.id ? 'Edit Scanner' : 'Add Scanner' }}
    </div>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <v-overlay :value="isSaving" absolute z-index="1">
        <v-progress-circular indeterminate size="36" />
      </v-overlay>
      <div class="py-2 px-4 mt-n2 d-flex flex-column">
        <validation-provider v-slot="{ errors }" name="Scanner Name" rules="required">
          <v-text-field
            label="Scanner Name"
            :value="info.scanner_name"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'scanner_name')"
          />
        </validation-provider>
        <validation-provider v-slot="{ errors }" name="Scanner ID" rules="required">
          <v-text-field
            label="Scanner ID"
            :value="info.scanner_id"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'scanner_id')"
          />
        </validation-provider>
        <validation-provider v-slot="{ errors }" name="Failure Message" rules="required">
          <v-textarea
            label="Failure Message"
            :value="info.failed_message"
            :error-messages="errors"
            hide-details
            auto-grow
            rows="1"
            no-resize
            class="ma-0"
            @input="(x) => doUpdateData(x, 'failed_message')"
          />
        </validation-provider>
        <validation-provider v-slot="{ errors }" name="Department" rules="required">
          <v-combobox
            v-model="facility"
            label="Facility"
            :error-messages="errors"
            item-value="id"
            item-text="name"
            :items="facilities"
            hide-details="auto"
          />
        </validation-provider>
        <div class="d-flex justify-end pt-4">
          <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
            Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
          </v-btn>
          <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
            Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
          </v-btn>
        </div>
      </div>
    </validation-observer>
  </v-card>
</template>

<script>
import { initComponent } from '../../../lib'
export default initComponent('AddEditScannerForm', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.input
  &--is_correct, &--minus
    cursor: pointer
  &--is_correct:hover
    color: #43A047
  &--minus
    color: #E53935
</style>
