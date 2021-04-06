<template>
  <v-card-text class="pt-10 px-8">
    <h3 class="text-center text--title">
      Welcome to VitaCorpo
    </h3>
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
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
          :value="info.username"
          :error-messages="errors"
          hide-details="auto"
          @input="(x) => doUpdateData(x, 'username')"
        />
      </validation-provider>
      <validation-provider
        v-if="showCompanies"
        v-slot="{ errors }"
        name="Company"
        rules="required"
      >
        <v-combobox
          v-model="company"
          label="Company"
          :error-messages="errors"
          item-value="id"
          item-text="name"
          :items="companies"
          hide-details="auto"
        />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Password"
        rules="required"
      >
        <v-text-field
          label="Password"
          :value="info.password"
          :error-messages="errors"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          hide-details="auto"
          @click:append="showPassword = !showPassword"
          @input="(x) => doUpdateData(x, 'password')"
        />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Phone"
        rules="required|phone"
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
        name="Hippa"
        rules="checked"
      >
        <v-checkbox
          v-model="accept"
          :error="errors.length > 0"
          :value="true"
          required
        >
          <template v-slot:label>
            <div class="d-flex flex-column">
              <div>I accept VitaCorpo's</div>
              <div>
                <a target="_blank" :href="toTermsOfService" @click.stop v-text="'Terms of Service '" />
                and
                <a target="_blank" :href="toPrivatePolicy" @click.stop v-text="' Privacy Policy'" />
              </div>
            </div>
          </template>
        </v-checkbox>
      </validation-provider>
      <div class="d-flex flex-column align-center justify-center pb-3">
        <v-btn
          block
          color="primary"
          class="mr-n1"
          :disabled="invalid"
          @click="doCallAction"
        >
          SIGN UP
          <v-icon
            right
            dark
          >
            mdi-send
          </v-icon>
        </v-btn>
        <router-link :to="toLogin" class="mt-2 label d-block">
          Already have an account? Log In
        </router-link>
      </div>
    </validation-observer>
  </v-card-text>
</template>

<script>
import { find } from 'lodash'
import { ROUTE_PRIVATEPOLICY, ROUTE_SIGNIN, ROUTE_TOS } from '../../../constants'
import { initComponent } from '../../../lib'
import { toUrl } from '../../../router'

export default initComponent('SignUpVisitorForm', {
  props: {
    companies: {
      type: Array,
      default: () => ([]),
    },
    showCompanies: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const { params } = this.$route
    return {
      showPassword: false,
      toLogin: { name: ROUTE_SIGNIN, query: { ...params, role: 'visitor' } },
      toTermsOfService: toUrl(ROUTE_TOS),
      toPrivatePolicy: toUrl(ROUTE_PRIVATEPOLICY),
    }
  },
  computed: {
    company: {
      get () {
        const { companies, info: { company } } = this
        return (find(companies, { id: company }) || {}).name || company
      },
      async set (v) {
        return this.doUpdateData(v.id, 'company')
      },
    },
    accept: {
      async set (accept) {
        return this.doUpdateData(accept, 'hipaa')
      },
      get () {
        if (!this.info.hipaa) return false
        return this.info.hipaa
      },
    },
  },
  methods: {},
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.text
  &--title
    @include font(400, 18px, 'Roboto')
a
  text-decoration: none
  @include font(600, 12px)
.v-label
  &.error--text a
    color: #ff5252
  a
    @include font(600, 11px)
.v-btn--disabled
  background-color: rgba(0,0,0,.12)!important
</style>
