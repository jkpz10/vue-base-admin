import moment from 'moment'
import { cloneDeep, merge } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'

export const RESET_ENTRY_STATE = 'RESET_ENTRY_STATE'
export const UPDATE_ENTRY_STATE = 'UPDATE_ENTRY_STATE'
export const REQUEST_ENTRY_FACILITY_LIST = 'REQUEST_ENTRY_FACILITY_LIST'
export const REQUEST_ENTRY_LIST = 'REQUEST_ENTRY_LIST'
export const REQUEST_ENTRY_USER_ENTER = 'REQUEST_ENTRY_USER_ENTER'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  items: [],
  item: {},
  facilities: [],
  paging: defaultPaging(),
}

// actions
export const actions = {
  async [REQUEST_ENTRY_FACILITY_LIST] ({ commit, dispatch }) {
    try {
      await commit(UPDATE_ENTRY_STATE, { isFetching: true })
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/facility`, { no_paging: 1 })
      await commit(UPDATE_ENTRY_STATE, { facilities: api.parseSelect(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_ENTRY_STATE, { isFetching: false })
  },
  async [REQUEST_ENTRY_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_ENTRY_STATE, { isFetching: true })

      const { paging } = state
      const { company } = this.state.app.appData
      const today = moment().startOf('day').toISOString()
      const res = await api.get(`/admin/event/${company}/entry`, {
        ...api.parseListingPayload(paging),
        today,
      })
      await commit(UPDATE_ENTRY_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_ENTRY_STATE, { isFetching: false })
  },
  async [REQUEST_ENTRY_USER_ENTER] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_ENTRY_STATE, { isSaving: true })
      const res = await api.post(`/admin/event/entry/${state.item.send_id}`, {
        ...state.item,
      })
      const item = api.parseItem(res)
      await commit(UPDATE_ENTRY_STATE, {
        isFormAdd: false,
        item,
        paging: { _page: 1, q: item.id },
      })
      await dispatch(REQUEST_ENTRY_FACILITY_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_ENTRY_STATE, { isSaving: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_ENTRY_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items || [])
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.facilities) s.facilities = [].concat(payload.facilities || [])
  },
  async [RESET_ENTRY_STATE] (s) {
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
