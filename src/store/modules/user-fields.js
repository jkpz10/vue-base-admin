import { cloneDeep, merge, indexOf, find, camelCase } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'

export const UPDATE_CM_STATE = 'UPDATE_CM_STATE'
export const REQUEST_CM_INFO = 'REQUEST_CM_INFO'
export const REQUEST_CM_UPDATE = 'REQUEST_CM_UPDATE'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormEdit: false,
  items: [],
  item: {},
}

const actions = {
  async [REQUEST_CM_INFO] ({ dispatch, commit }) {
    await commit(UPDATE_CM_STATE, { isFetching: true })
    try {
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/metadata`)
      await commit(UPDATE_CM_STATE, { items: api.parseCompanyMeta(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_CM_STATE, { isFetching: false })
  },
  async [REQUEST_CM_UPDATE] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_CM_STATE, { isSaving: true })
      const item = cloneDeep(state.item)
      const items = [].concat(state.items)
      const meta = {}
      if (item.id) {
        const i = indexOf(items, find(items, { id: item.id }))
        items[i] = item
      } else {
        items.push(item)
      }
      items.forEach((x) => {
        meta[camelCase(x.label)] = {
          label: x.label,
          values: x.values,
          status: x.status,
        }
      })

      const { company } = this.state.app.appData
      const res = await api.put(`/admin/company/${company}/metadata`, { meta })
      await commit(UPDATE_CM_STATE, {
        isFormEdit: false,
        isFormAdd: false,
        item: {},
        items: api.parseCompanyMeta(res),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_CM_STATE, { isSaving: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_CM_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items)
    if (payload.item) s.item = cloneDeep(payload.item)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
