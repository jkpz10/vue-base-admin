import Vue from 'vue'
import Vuex from 'vuex'

import appModule from './modules/app'


Vue.use(Vuex)

export const STATE_STALE = 'STATE_STALE'

export default new Vuex.Store({
  strict: true,
  state: {
    state: STATE_STALE,
  },
  actions: {

  },
  mutations: {
    
  },
  modules: {
    app: appModule,
  }
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
