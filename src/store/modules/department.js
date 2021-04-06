import { cloneDeep, merge } from 'lodash'
import api from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'

export const UPDATE_DEPARTMENT_STATE = 'UPDATE_DEPARTMENT_STATE'
export const REQUEST_DEPARTMENT_LIST = 'REQUEST_DEPARTMENT_LIST'
export const REQUEST_DEPARTMENT_ADD = 'REQUEST_DEPARTMENT_ADD'
export const REQUEST_DEPARTMENT_UPDATE = 'REQUEST_DEPARTMENT_UPDATE'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormEdit: false,
  items: [],
  item: {},
  paging: defaultPaging(),
}

const actions = {
  async [REQUEST_DEPARTMENT_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_DEPARTMENT_STATE, { isFetching: true })

      const { paging } = state
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/department`, api.parseListingPayload(paging))
      await commit(UPDATE_DEPARTMENT_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_DEPARTMENT_STATE, { isFetching: false })
  },
  async [REQUEST_DEPARTMENT_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_DEPARTMENT_STATE, { isSaving: true })
      const { item } = state
      const { company } = this.state.app.appData
      await api.put(`/admin/company/${company}/department/${item.id}`, item)
      await commit(UPDATE_DEPARTMENT_STATE, {
        isFormAdd: false,
        isFormEdit: false,
        paging: { _page: 1, q: '' },
      })
      await dispatch(REQUEST_DEPARTMENT_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_DEPARTMENT_STATE, { isSaving: false })
  },
  async [REQUEST_DEPARTMENT_ADD] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_DEPARTMENT_STATE, { isSaving: true })
      const { item } = state
      const { company } = this.state.app.appData
      await api.post(`/admin/company/${company}/department`, item)
      await commit(UPDATE_DEPARTMENT_STATE, {
        isFormAdd: false,
        isFormEdit: false,
        paging: { _page: 1, q: '' },
      })
      await dispatch(REQUEST_DEPARTMENT_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_DEPARTMENT_STATE, { isSaving: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_DEPARTMENT_STATE] (s, payload) {
    merge(s, payload)
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.items) s.items = [].concat(payload.items || [])
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
