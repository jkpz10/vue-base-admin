import { cloneDeep, merge, has } from 'lodash'

import api, { formatPhone } from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'

export const UPDATE_FACILITY_STATE = 'UPDATE_FACILITY_STATE'
export const REQUEST_FACILITY_LIST = 'REQUEST_FACILITY_LIST'
export const REQUEST_FACILITY_CONTACT_INFO = 'REQUEST_FACILITY_CONTACT_INFO'
export const REQUEST_FACILITY_ADD = 'REQUEST_FACILITY_ADD'
export const REQUEST_FACILITY_UPDATE = 'REQUEST_FACILITY_UPDATE'
export const REQUEST_FACILITY_CONTACT_UPDATE = 'REQUEST_FACILITY_CONTACT_UPDATE'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormEdit: false,
  items: [],
  item: {},
  contact: {},
  paging: defaultPaging(),
}

const actions = {
  async [REQUEST_FACILITY_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_FACILITY_STATE, { isFetching: true })

      const { paging } = state
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/facility`, api.parseListingPayload(paging))
      await commit(UPDATE_FACILITY_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FACILITY_STATE, { isFetching: false })
  },
  async [REQUEST_FACILITY_CONTACT_INFO] ({ commit, dispatch, state }) {
    await commit(UPDATE_FACILITY_STATE, { isFetching: true })
    try {
      const { item } = state
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/facility/${item.id}/main-contact`)
      await commit(UPDATE_FACILITY_STATE, { contact: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FACILITY_STATE, { isFetching: false })
  },
  async [REQUEST_FACILITY_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_FACILITY_STATE, { isSaving: true })
      const { item } = state
      const { company } = this.state.app.appData
      await api.put(`/admin/company/${company}/facility/${item.id}`, item)
      await commit(UPDATE_FACILITY_STATE, {
        isFormAdd: false,
        isFormEdit: false,
        paging: { _page: 1, q: item.id },
      })
      await dispatch(REQUEST_FACILITY_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FACILITY_STATE, { isSaving: false })
  },
  async [REQUEST_FACILITY_ADD] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_FACILITY_STATE, { isSaving: true })
      const { item } = state
      const { company } = this.state.app.appData
      const res = await api.post(`/admin/company/${company}/facility`, item)
      await commit(UPDATE_FACILITY_STATE, {
        isFormAdd: false,
        isFormEdit: false,
        paging: { _page: 1, q: api.parseItem(res).id },
      })
      await dispatch(REQUEST_FACILITY_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FACILITY_STATE, { isSaving: false })
  },
  async [REQUEST_FACILITY_CONTACT_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_FACILITY_STATE, { isSaving: true })
      const { company } = this.state.app.appData
      const { item, contact } = state
      await api.put(`/admin/company/${company}/facility/${item.id}/main-contact`, {
        ...contact,
        ...(has(contact, 'phone') ? { phone: formatPhone(contact.phone) } : {}),
        ...(has(contact, 'reporting_mgr_email') ? { reporting_mgr: contact.reporting_mgr_email } : {}),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FACILITY_STATE, { isSaving: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_FACILITY_STATE] (s, payload) {
    merge(s, payload)
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.contact) s.contact = cloneDeep(payload.contact)
    if (payload.items) s.items = [].concat(payload.items || [])
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
