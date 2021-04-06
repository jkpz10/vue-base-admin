<template>
  <v-card class="wp wp--overflow__hidden">
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="py-2 px-4 pb-0">
      <h4 v-if="isAddMode" class="text--card text--card__title flex-fill">
        Add Department
      </h4>
      <h4 v-if="isEditMode" class="text--card text--card__title flex-fill">
        Edit Department
      </h4>
    </div>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <div class="py-2 px-4">
        <v-row>
          <v-col cols="12" class="py-2">
            <validation-provider
              v-slot="{ errors }"
              name="Name"
              rules="required"
            >
              <v-text-field
                label="Department Name"
                :value="info.name"
                :error-messages="errors"
                hide-details="auto"
                @input="(x) => doUpdateData(x, 'name')"
              />
            </validation-provider>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6" class="py-2">
            <v-select
              label="Status"
              :items="[{value:'active', text:'Active'}, {value:'inactive', text:'In Active'}]"
              :value="info.status"
              @input="(x) => doUpdateData(x, 'status')"
            />
          </v-col>
        </v-row>
        <div class="d-flex justify-end pt-8">
          <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
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
export default initComponent('AddEditDepartmentForm', {
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text-subtitle
  @include font(300, 11px)
</style>
