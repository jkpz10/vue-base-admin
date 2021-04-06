// import moment from 'moment'
import { cloneDeep, merge, has, get } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'

export const UPDATE_SCAN_STATE = 'UPDATE_SCAN_STATE'
export const REQUEST_SCAN_FACILITY_LIST = 'REQUEST_SCAN_FACILITY_LIST'
export const REQUEST_SCAN_FACILITY_SELECTED = 'REQUEST_SCAN_FACILITY_SELECTED'
export const REQUEST_SCAN_USER_ENTER = 'REQUEST_SCAN_USER_ENTER'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isSuccess: null,
  item: {},
  facilities: [],
  showScanner: false,
  message: null,
}

// actions
export const actions = {
  async [REQUEST_SCAN_FACILITY_LIST] ({ commit, dispatch }) {
    try {
      await commit(UPDATE_SCAN_STATE, { isFetching: true })
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/facility`, { no_paging: 1 })
      await commit(UPDATE_SCAN_STATE, { facilities: api.parseSelect(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SCAN_STATE, { isFetching: false })
  },
  async [REQUEST_SCAN_USER_ENTER] ({ commit, dispatch, state }) {
    let message = null
    let isSuccess = null
    try {
      await commit(UPDATE_SCAN_STATE, { isSaving: true })
      const { item } = state
      const { id } = item
      await api.post(`/admin/event/entry/${id}`, {
        ...item,
        ...(has(item, 'facility') ? { facility_id: get(item, 'facility.id') } : {}),
      })
      message = 'Scan completed'
      isSuccess = true
    } catch (error) {
      message = 'Something went wrong'
      isSuccess = false
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SCAN_STATE, { isSaving: false, message, isSuccess })
  },
}

// mutations
const mutations = {
  async [UPDATE_SCAN_STATE] (s, payload) {
    merge(s, payload)
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.facilities) s.facilities = [].concat(payload.facilities || [])
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
