<template>
  <v-card-text class="pt-6 px-4">
    <hipaa-content />
    <div class="px-4">
      <validation-observer
        ref="observer"
        v-slot="{ invalid }"
      >
        <validation-provider
          v-slot="{ errors }"
          name="Hippa"
          rules="checked"
        >
          <v-checkbox
            v-model="accept1"
            :error="errors.length > 0"
            :value="true"
            hide-details
            required
          >
            <template v-slot:label>
              <div>
                By checking this box I agree to the terms in the above VitaCorpo <strong>HIPAA Agreement</strong>
              </div>
            </template>
          </v-checkbox>
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Hippa"
          rules="checked"
        >
          <v-checkbox
            v-model="accept2"
            :error="errors.length > 0"
            :value="true"
            required
            hide-details
          >
            <template v-slot:label>
              <div>
                By checking this box I agree to the VitaCorpo <a target="_blank" :href="toPrivatePolicy" @click.stop v-text="' Privacy Policy'" /> and
                <a target="_blank" :href="toTermsOfService" @click.stop v-text="'Terms of Service '" />
              </div>
            </template>
          </v-checkbox>
        </validation-provider>
        <div class="d-flex flex-row justify-center align-center pt-4">
          <v-btn
            color="primary"
            class="mr-n1"
            :disabled="invalid"
            @click="doCallAction"
          >
            AGREE AND CONTINUE
          </v-btn>
        </div>
      </validation-observer>
    </div>
  </v-card-text>
</template>

<script>
import { ROUTE_PRIVATEPOLICY, ROUTE_TOS } from '../../../constants'
import { initComponent } from '../../../lib'
import { toUrl } from '../../../router'
import HipaaContent from './HipaaContent'

export default initComponent('HipaaForm', {
  components: {
    HipaaContent,
  },
  props: {
    isConfirm: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      accept1: false,
      accept2: false,
      toTermsOfService: toUrl(ROUTE_TOS),
      toPrivatePolicy: toUrl(ROUTE_PRIVATEPOLICY),
    }
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text
  &--content
    @include font(400, 10px)
    margin-bottom: 4px !important
a
  text-decoration: none
  @include font(600, 12px)
.v-btn--disabled
  background-color: rgba(0,0,0,.12)!important
</style>
