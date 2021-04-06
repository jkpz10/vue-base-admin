<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
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
      name="Birth Date"
      rules="required|date"
    >
      <v-text-field
        label="Birth Date"
        :value="birth_date"
        :error-messages="errors"
        hide-details="auto"
        @input="(x) => doUpdateData(x, 'birth_date')"
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
    <v-text-field
      :value="$t(`user_group.${info.group}`)"
      label="Group"
      hide-details
      readonly
    />
    <v-text-field
      :value="companyName"
      label="Company Name"
      hide-details
      readonly
    />
    <v-text-field
      v-if="!$api.isSuperuser(role) && !$api.isCompanySuperAdmin(role)"
      label="Supervisor"
      :value="info.reporting_mgr_email"
      hide-details
      readonly
    />
    <v-switch
      v-model="status"
      :label="$t(`user_status.${statusText}`)"
      readonly
    />
    <div class="d-flex justify-end pt-2">
      <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
        Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
      </v-btn>
    </div>
  </validation-observer>
</template>

<script>
import { find } from 'lodash'
import { initComponent } from '../../../lib'

export default initComponent('EditUserForm', {
  data: () => ({}),
  computed: {
    companyName () {
      const { info: { company_id: id }, companies } = this
      return (find(companies, { id }) || {}).name || '--'
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'

</style>
