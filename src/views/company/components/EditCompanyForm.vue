<template>
  <v-card class="wp wp--overflow__hidden">
    <v-overlay :value="isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-img height="152" :src="info.url" class="pos-relative">
      <upload-company-image
        class="pa-2 uploader--avatar pos-absolute"
        :info="imageInfo"
        type="companyLogo"
        label="Drag n drop avatar here"
        :on-avatar-change="onAvatarChange"
      />
    </v-img>
    <!-- to implement drag and drop -->
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
          <v-col cols="12" md="12" class="py-1">
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
        </v-row>
        <v-row>
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
          <v-col cols="12" md="3" class="py-1">
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
          <v-col cols="12" md="3" class="py-1">
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
      </div>
      <v-card-actions class="px-4 pt-4 d-flex justify-space-between">
        <v-switch
          v-model="status"
          hide-details
          :label="$t(`user_status.${statusText}`)"
          class="mt-0"
        />
        <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
          Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
        </v-btn>
      </v-card-actions>
    </validation-observer>
  </v-card>
</template>

<script>
import { initComponent } from '../../../lib'
import UploadCompanyImage from './UploadCompanyImage'
export default initComponent('EditCompanyForm', {
  components: {
    UploadCompanyImage,
  },
  computed: {
    imageInfo () {
      const { url, id, type } = this.info
      return { url, id, type }
    },
  },
  methods: {
    async onAvatarChange (item) {
      if (item && item.url) {
        return this.doUpdateData(item.url, 'url')
      }
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
</style>
