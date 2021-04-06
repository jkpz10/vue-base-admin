import { filter, isArray } from 'lodash'
import Vue from 'vue'
import Vuex, { createLogger } from 'vuex'
// import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import localforage from 'localforage'

import api from '../api'
import appModule from './modules/app'
import allUsersListModule from './modules/all-users'
import dashboardModule from './modules/dashboard'
import companiesModule from './modules/companies'
import companyModule from './modules/company'
import billingModule from './modules/billing'
import readinessModule from './modules/readiness'
import userModule from './modules/user'
import userEventModule from './modules/user-events'
import userFieldsModule from './modules/user-fields'
import profileModule from './modules/profile'
import loginModule from './modules/login'
import forRegistrationModule from './modules/for-registration'
import facilityModule from './modules/facility'
import surveyModule from './modules/survey'
import entryModule from './modules/entry'
import scannerModule from './modules/scanner'
import entryScanModule from './modules/entry-scan'
import notificationModule from './modules/notification'
import departmentModule from './modules/department'

const dv = localforage.supports(localforage.INDEXEDDB) ? localforage.INDEXEDDB : localforage.WEBSQL

Vue.use(Vuex)

const key = `${process.env.VUE_APP_APP_NAME}${process.env.VUE_APP_STORE_VERSION}`
localforage.config({
  driver: dv, // Force WebSQL; same as using setDriver()
  name: process.env.VUE_APP_APP_NAME,
  version: process.env.VUE_APP_STORE_VERSION,
  size: 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName: `app_${key}`, // Should be alphanumeric, with underscores.
})

console.log(`STORAGE VERSION: ${process.env.VUE_APP_STORE_VERSION}`)

const vuexLocal = new VuexPersistence({
  strict: true,
  storage: localforage,
  asyncStorage: true,
  key,
})

export const STATE_STALE = 'STATE_STALE'
export const SNACKBAR_ADD = 'SNACKBAR_ADD'
export const SNACKBAR_REMOVE = 'SNACKBAR_REMOVE'
export const RESTORE_MUTATION = 'RESTORE_MUTATION'
export const RESET_STATE = 'RESET_STATE'

export const COLOR_WARNING = 'pink lighten-1'
export const COLOR_ERROR = 'red darken-1'
export const COLOR_INFO = 'blue darken-2'
export const COLOR_SUCCESS = 'green darken-1'

const defaultSnackbarOpts = {
  color: 'success',
  timeout: 5000,
  model: true,
}

const plugins = [
  vuexLocal.plugin,
]

if (api.isStage) {
  plugins.push(createLogger())
}

export default new Vuex.Store({
  strict: true,
  state: {
    state: STATE_STALE,
    snackBars: [],
  },
  actions: {
    async [SNACKBAR_ADD] ({ commit }, payload) {
      const id = +(new Date())
      const opts = {
        ...defaultSnackbarOpts,
        ...payload,
        id,
      }
      await commit(SNACKBAR_ADD, opts)
    },
  },
  mutations: {
    async [RESTORE_MUTATION] (s) {
      s.app.isRestored = true
    },
    async [SNACKBAR_ADD] (s, payload) {
      if (!s.snackBars) {
        s.snackBars = []
      }
      s.snackBars.push(payload)
    },
    async [SNACKBAR_REMOVE] (s, id) {
      if (id === 0) {
        s.snackBars = []
      } else if (isArray(id)) {
        s.snackBars = id
      } else {
        s.snackBars = filter(s.snackBars, { id })
      }
    },
  },
  plugins,
  modules: {
    app: appModule,
    login: loginModule,
    dashboard: dashboardModule,
    allUsers: allUsersListModule,
    companies: companiesModule,
    billing: billingModule,
    readiness: readinessModule,
    user: userModule,
    userFields: userFieldsModule,
    profile: profileModule,
    forRegistration: forRegistrationModule,
    facility: facilityModule,
    company: companyModule,
    userEvent: userEventModule,
    survey: surveyModule,
    entry: entryModule,
    scanner: scannerModule,
    entryScan: entryScanModule,
    notification: notificationModule,
    department: departmentModule,
  },
})

export function defaultPaging () {
  return {
    q: null,
    _page: 1,
    _limit: 10,
  }
}

export function updatePaging ({ page, limit, pages, total }) {
  return {
    _page: page,
    _limit: limit,
    _pages: pages,
    _total: total,
  }
}
