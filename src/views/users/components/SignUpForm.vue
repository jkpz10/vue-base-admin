<template>
  <validation-observer ref="observer" v-slot="{ invalid }">
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="text-h5">
      Signup User Manually
    </div>
    <div class="text-subtitle">
      This will register the user manually and they need to sign in using the given
      temporary password {{ info.password }}.
    </div>
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
      <v-text-field
        :value="info.password"
        label="Password"
        disabled
      />
    </validation-provider>
    <div class="d-flex justify-end pt-2">
      <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
        Cancel <v-icon color="white" right>
          mdi-close-circle-outline
        </v-icon>
      </v-btn>
      <v-btn elevation="0" class="inde btn btn--save mr-0" :disabled="invalid" @click="doSave">
        Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
      </v-btn>
    </div>
  </validation-observer>
</template>

<script>
import { initComponent } from '../../../lib'
export default initComponent('SignUpForm', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text-subtitle
  @include font(300, 11px)
</style>
