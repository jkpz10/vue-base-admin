import { cloneDeep, has, merge, omit } from 'lodash'

import api, { formatPhone } from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'

export const UPDATE_AU_STATE = 'UPDATE_AU_STATE'
export const REQUEST_AU_LIST = 'REQUEST_AU_LIST'
export const REQUEST_AU_SIGNUP_MANUALLY = 'REQUEST_AU_SIGNUP_MANUALLY'
export const REQUEST_AU_UPDATE_USER = 'REQUEST_AU_UPDATE_USER'

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

// actions
export const actions = {
  async [REQUEST_AU_SIGNUP_MANUALLY] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_AU_STATE, { isSaving: true })
      const { item } = state
      await api.post('/admin/user/signup', {
        ...item,
        ...(has(item, 'phone') ? { phone: formatPhone(item.phone) } : {}),
      })
      await commit(UPDATE_AU_STATE, { isFormAdd: false, isFormEdit: false })
      await dispatch(REQUEST_AU_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_AU_STATE, { isSaving: false })
  },
  async [REQUEST_AU_UPDATE_USER] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_AU_STATE, { isSaving: true })
      const { item } = state
      await api.put(`/admin/user/${item.id}`, {
        ...omit(item, 'group'),
        ...(has(item, 'phone') ? { phone: formatPhone(item.phone) } : {}),
      })
      await commit(UPDATE_AU_STATE, { isFormAdd: false, isFormEdit: false, paging: { _page: 1, q: item.id } })
      await dispatch(REQUEST_AU_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_AU_STATE, { isSaving: false })
  },
  async [REQUEST_AU_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_AU_STATE, { isFetching: true })

      const { paging } = state
      const res = await api.get('/admin/user', api.parseListingPayload(paging))
      await commit(UPDATE_AU_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_AU_STATE, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_AU_STATE] (s, payload) {
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
