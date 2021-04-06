<template>
  <div class="pos-relative">
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <validation-observer ref="observer" v-slot="{ invalid }">
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
      <validation-provider
        v-slot="{ errors }"
        name="User Group"
        rules="required"
      >
        <v-select
          v-if="!$api.isSuperuser(info.group)"
          label="User Group"
          :value="info.group"
          :error-messages="errors"
          hide-details="auto"
          :items="groups"
          :item-text="(x) => $t(`user_group.${x.id}`)"
          item-value="id"
          @input="(x) => doUpdateData(x, 'group')"
        />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Company"
        rules="required"
      >
        <v-select
          label="Company"
          :value="company_id"
          :error-messages="errors"
          hide-details="auto"
          :items="companies"
          item-text="name"
          item-value="id"
          @input="(x) => doUpdateData(x, 'company_id')"
        />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Supervisor"
        rules="required|email"
      >
        <v-text-field
          label="Supervisor"
          :value="info.reporting_mgr_email"
          :error-messages="errors"
          hide-details="auto"
          @input="(x) => doUpdateData(x, 'reporting_mgr_email')"
        />
      </validation-provider>
      <v-switch
        v-model="status"
        :label="$t(`user_status.${statusText}`)"
      />
      <div class="d-flex justify-end pt-2">
        <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
          Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
        </v-btn>
      </div>
    </validation-observer>
  </div>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('EditUserForm', {
  props: {
    onAvatarChange: {
      type: Function,
      default: () => ({}),
    },
  },
  data: () => ({}),
  computed: {
    company_id () {
      return this.info.company_id || 'none'
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
</style>
