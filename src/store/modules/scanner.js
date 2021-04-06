import { cloneDeep, merge } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'

export const RESET_SCANNER_STATE = 'RESET_SCANNER_STATE'
export const REQUEST_SCANNER_FACILITY_LIST = 'REQUEST_SCANNER_FACILITY_LIST'
export const UPDATE_SCANNER_STATE = 'UPDATE_SCANNER_STATE'
export const REQUEST_SCANNER_LIST = 'REQUEST_SCANNER_LIST'
export const REQUEST_SCANNER_ADD = 'REQUEST_SCANNER_ADD'
export const REQUEST_SCANNER_UPDATE = 'REQUEST_SCANNER_UPDATE'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormEdit: false,
  items: [],
  item: {},
  facilities: [],
}

// actions
export const actions = {
  async [REQUEST_SCANNER_FACILITY_LIST] ({ commit, dispatch }) {
    try {
      await commit(UPDATE_SCANNER_STATE, { isFetching: true })
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/facility`, { no_paging: 1 })
      await commit(UPDATE_SCANNER_STATE, { facilities: api.parseSelect(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SCANNER_STATE, { isFetching: false })
  },
  async [REQUEST_SCANNER_ADD] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_SCANNER_STATE, { isSaving: true })
      const { company } = this.state.app.appData
      const res = await api.post(`/admin/company/${company}/scanner`, {
        ...state.item,
      })
      await commit(UPDATE_SCANNER_STATE, { isFormAdd: false, isFormEdit: false, paging: { _page: 1, id: api.parseItem(res) } })
      await dispatch(REQUEST_SCANNER_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SCANNER_STATE, { isSaving: false })
  },
  async [REQUEST_SCANNER_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_SCANNER_STATE, { isSaving: true })
      const { item } = state
      await api.put(`/admin/company/${item.company_id}/scanner/${item.id}`, {
        ...item,
      })
      await commit(UPDATE_SCANNER_STATE, { isFormAdd: false, isFormEdit: false, paging: { _page: 1, q: item.id } })
      await dispatch(REQUEST_SCANNER_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SCANNER_STATE, { isSaving: false })
  },
  async [REQUEST_SCANNER_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_SCANNER_STATE, { isFetching: true })

      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/scanner`, { no_paging: 1 })
      await commit(UPDATE_SCANNER_STATE, {
        items: api.parseItems(res),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SCANNER_STATE, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_SCANNER_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items || [])
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.facilities) s.facilities = [].concat(payload.facilities || [])
  },
  async [RESET_SCANNER_STATE] (s) {
    merge(s, cloneDeep(moduleState))
    s.items = []
    s.item = {}
    s.facilities = []
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
