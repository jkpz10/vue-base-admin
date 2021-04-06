import { cloneDeep, merge } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'

export const UPDATE_READINESS_STATE = 'UPDATE_READINESS_STATE'
export const REQUEST_QUESTION_LIST = 'REQUEST_QUESTION_LIST'
export const REQUEST_QUESTION_ADD = 'REQUEST_QUESTION_ADD'
export const REQUEST_QUESTION_UPDATE = 'REQUEST_QUESTION_UPDATE'
export const REQUEST_READINESS_GET = 'REQUEST_READINESS_GET'
export const REQUEST_READINESS_UPDATE = 'REQUEST_READINESS_UPDATE'

export const TAB_ACTIVE = 'active'
export const TAB_SAVED = 'saved'

// state
const moduleState = {
  company: null,
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormEdit: false,
  activeTab: TAB_ACTIVE,
  items: [],
  item: {},
  readiness: {},
}

// actions
export const actions = {
  async [REQUEST_READINESS_GET] ({ commit, dispatch, state }) {
    await commit(UPDATE_READINESS_STATE, { isFetching: true })
    try {
      const { company } = state
      const res = await api.get(`/admin/workspace/${company.id}/readiness`)
      await commit(UPDATE_READINESS_STATE, {
        readiness: api.parseItem(res),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_READINESS_STATE, { isFetching: false })
  },
  async [REQUEST_READINESS_UPDATE] ({ commit, dispatch, state }) {
    await commit(UPDATE_READINESS_STATE, { isSaving: true })
    try {
      const { company, readiness } = state
      await api.put(`/admin/workspace/${company.id}/readiness`, readiness)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_READINESS_STATE, { isSaving: false })
  },
  async [REQUEST_QUESTION_ADD] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_READINESS_STATE, { isSaving: true })
      const { company, item } = state
      await api.post(`/admin/workspace/${company.id}/survey`, item)
      await commit(UPDATE_READINESS_STATE, {
        isFormAdd: false,
        isFormEdit: false,
        paging: { _page: 1, q: item.name },
      })
      await dispatch(REQUEST_QUESTION_LIST)
      await commit(UPDATE_READINESS_STATE, { activeTab: item.is_active ? TAB_ACTIVE : TAB_SAVED })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_READINESS_STATE, { isSaving: false })
  },
  async [REQUEST_QUESTION_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_READINESS_STATE, { isSaving: true })
      const { company, item } = state
      await api.put(`/admin/workspace/${company.id}/survey/${item.id}`, item)
      await dispatch(REQUEST_QUESTION_LIST)
      await commit(UPDATE_READINESS_STATE, { activeTab: item.is_active ? TAB_ACTIVE : TAB_SAVED, item })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_READINESS_STATE, { isSaving: false })
  },
  async [REQUEST_QUESTION_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_READINESS_STATE, { isFetching: true })

      const { company } = state
      const res = await api.get(`/admin/workspace/${company.id}/survey`, { no_paging: 1 })
      await commit(UPDATE_READINESS_STATE, { items: api.parseItems(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_READINESS_STATE, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_READINESS_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items || [])
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.readiness) s.readiness = cloneDeep(payload.readiness)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
