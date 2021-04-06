<template>
  <v-sheet rounded class="wp wp--form wp--form__right mt-10 px-4 py-2 elevation-1">
    <v-overlay :value="isSaving" absolute z-index="2">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-card-title class="d-flex justify-start pa-0">
      <div class="txt--title d-flex justify-center align-center">
        Enter Facility
      </div>
    </v-card-title>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <validation-provider
        v-slot="{ errors }"
        name="Facility"
        rules="required"
      >
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
      <div class="d-flex justify-end py-4 mr-3">
        <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
          Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
        </v-btn>
        <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
          Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
        </v-btn>
      </div>
    </validation-observer>
  </v-sheet>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('EnterFacilityForm', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--form
    &__right
      width: auto
</style>
