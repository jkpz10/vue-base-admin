import { cloneDeep, merge } from 'lodash'

import api from '../../api'
import { APP_ERROR, EV_CURRENT_COMPANY_MODIFIED } from './app'
import { defaultPaging, updatePaging } from '..'

export const UPDATE_COMPANIES_STATE = 'UPDATE_COMPANIES_STATE'
export const REQUEST_COMPANIES_LIST = 'REQUEST_COMPANIES_LIST'
export const REQUEST_COMPANIES_ADD = 'REQUEST_COMPANIES_ADD'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  items: [],
  item: {},
  paging: defaultPaging(),
}

// actions
export const actions = {
  async [REQUEST_COMPANIES_ADD] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_COMPANIES_STATE, { isSaving: true })
      const { item } = state
      const res = await api.post('/admin/company', item)
      await commit(UPDATE_COMPANIES_STATE, {
        isFormAdd: false,
        paging: { _page: 1, q: api.parseItem(res).id },
      })
      await dispatch(REQUEST_COMPANIES_LIST)
      await dispatch(EV_CURRENT_COMPANY_MODIFIED)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANIES_STATE, { isSaving: false })
  },
  async [REQUEST_COMPANIES_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_COMPANIES_STATE, { isFetching: true })

      const { paging } = state
      const res = await api.get('/admin/company', api.parseListingPayload(paging))
      await commit(UPDATE_COMPANIES_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANIES_STATE, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_COMPANIES_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items || [])
    if (payload.item) s.item = cloneDeep(payload.item)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
