import { has, cloneDeep, merge, omit } from 'lodash'

import api, { formatPhone } from '../../api'
import { APP_ERROR, LOAD_USER_INFORMATION } from './app'

export const UPDATE_PROFILE_STATE = 'UPDATE_PROFILE_STATE'
export const REQUEST_PROFILE_UPDATE = 'REQUEST_PROFILE_UPDATE'
export const REQUEST_PROFILE_INFO = 'REQUEST_PROFILE_INFO'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  item: {},
}

const actions = {
  async [REQUEST_PROFILE_UPDATE] ({ commit, dispatch, state }) {
    await commit(UPDATE_PROFILE_STATE, { isSaving: true })
    try {
      const { item } = state
      await api.put(`/app/user/${item.id}`, {
        ...omit(item, 'group'),
        ...(has(item, 'phone') ? { phone: formatPhone(item.phone) } : {}),
      })
      await dispatch(LOAD_USER_INFORMATION)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_PROFILE_STATE, { isSaving: false })
  },
  async [REQUEST_PROFILE_INFO] ({ commit, dispatch, state }) {
    await commit(UPDATE_PROFILE_STATE, { isFetching: true })
    try {
      const { item } = state
      const res = await api.get(`/admin/user/${item.id}`)
      await commit(UPDATE_PROFILE_STATE, { item: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_PROFILE_STATE, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_PROFILE_STATE] (s, payload) {
    merge(s, payload)
    if (payload.item) s.item = cloneDeep(payload.item)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
