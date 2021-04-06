// =========================================================
// * Vuetify Material Dashboard - v2.1.0
// =========================================================
//
// * Product Page: https://www.creative-tim.com/product/vuetify-material-dashboard
// * Copyright 2019 Creative Tim (https://www.creative-tim.com)
//
// * Coded by Creative Tim
//
// =========================================================
//
// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

import Vue from 'vue'
import router from './router'
import './plugins/api'
import './plugins/base'
import './plugins/chartist'
import './plugins/vee-validate'
import './plugins/amplify'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import VueCookies from 'vue-cookies'
import VueQrcodeReader from 'vue-qrcode-reader'
import VueTelInputVuetify from 'vue-tel-input-vuetify/lib'
import { mapState } from 'vuex'
import VueMoment from 'vue-moment'
import App from './App.vue'

import store, { SNACKBAR_REMOVE } from './store/index'
import { get, find } from 'lodash'

Vue.use(VueCookies)
Vue.use(VueQrcodeReader)
Vue.use(VueMoment)
Vue.use(VueTelInputVuetify, { vuetify })

Vue.config.productionTip = false
Vue.$cookies.config('1d')

Vue.mixin({
  computed: {
    ...mapState({
      role: (state) => state.app.user.group,
    }),
    snackBars: {
      get () {
        return this.$store.state.snackBars
      },
      set (val) {
        this.$store.commit(SNACKBAR_REMOVE, val)
      },
    },
  },
  methods: {
    resetSnackBars () {
      this.$store.commit(SNACKBAR_REMOVE, 0)
    },
    getCompanyInfo (id) {
      const { app } = this.$store.state
      const companies = get(app, 'appData.companies', [])
      return find(companies, { id }) || {}
    },
    getUserInitial (name) {
      return name.split(' ').map((x) => ((x || '').split()[0] || '').toUpperCase()).join('')
    },
  },
})

Vue.component('IndexPage', {
  async mounted () {
    this.$root.$emit('app-ready')
  },
})

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
