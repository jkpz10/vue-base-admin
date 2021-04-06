<template>
  <v-card class="wp wp--overflow__hidden">
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-img v-if="info.id" height="150" src="https://cdn.vuetifyjs.com/images/cards/cooking.png" />
    <div v-else class="py-2 px-4 pb-0">
      <h4 class="text--card text--card__title flex-fill">
        Add Facility
      </h4>
    </div>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <div class="py-2 px-4">
        <v-row>
          <v-col cols="12" class="py-1 pb-0">
            <validation-provider
              v-slot="{ errors }"
              name="Name"
              rules="required"
            >
              <v-text-field
                label="Company Name"
                :value="info.name"
                :error-messages="errors"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'name')"
              />
            </validation-provider>
          </v-col>
          <v-col cols="12" md="6" class="py-1">
            <validation-provider
              v-slot="{ errors }"
              name="Address"
              rules="required"
            >
              <v-text-field
                label="Address"
                :value="info.addr"
                :error-messages="errors"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'addr')"
              />
            </validation-provider>
          </v-col>
          <v-col cols="12" md="6" class="py-1">
            <validation-provider
              v-slot="{ errors }"
              name="City"
              rules="required"
            >
              <v-text-field
                label="City"
                :value="info.city"
                :error-messages="errors"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'city')"
              />
            </validation-provider>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6" class="py-1">
            <validation-provider
              v-slot="{ errors }"
              name="State"
              rules="required"
            >
              <v-text-field
                label="State"
                :value="info.state"
                :error-messages="errors"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'state')"
              />
            </validation-provider>
          </v-col>
          <v-col cols="12" md="6" class="py-1">
            <validation-provider
              v-slot="{ errors }"
              name="Zip"
              rules="required"
            >
              <v-text-field
                label="Zip"
                :value="info.zip"
                :error-messages="errors"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'zip')"
              />
            </validation-provider>
          </v-col>
        </v-row>
        <div class="d-flex justify-end pt-8">
          <v-btn v-if="!info.id" elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
            Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
          </v-btn>
          <v-btn elevation="0" class="inde btn btn--save mr-0" :disabled="invalid" @click="doSave">
            Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
          </v-btn>
        </div>
      </div>
    </validation-observer>
  </v-card>
</template>

<script>
import { initComponent } from '../../../lib'
export default initComponent('AddEditFacilityForm', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text-subtitle
  @include font(300, 11px)
</style>
