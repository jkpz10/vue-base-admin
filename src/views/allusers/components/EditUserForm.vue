<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="addedit--avatar d-flex justify-center">
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
          x-large
          v-text="'mdi-account'"
        />
      </v-avatar>
    </div>
    <base-upload-avatar
      class="pa-2 mt-3"
      color="amber lighten-5"
      rounded="md"
      :info="info"
      :on-avatar-change="onAvatarChange"
    />
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
    <v-switch
      v-model="status"
      :label="$t(`user_status.${statusText}`)"
    />
    <div class="d-flex justify-end pt-2">
      <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
        Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
      </v-btn>
      <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
        Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
      </v-btn>
    </div>
  </validation-observer>
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
  computed: {
    company_id () {
      return this.info.company_id || 'none'
    },
  },
})
</script>

<style lang="sass" scoped></style>
