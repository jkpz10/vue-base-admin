import { cloneDeep, merge, has } from 'lodash'

import api, { formatPhone } from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'

export const UPDATE_BILLING_STATE = 'UPDATE_BILLING_STATE'
export const REQUEST_BILLING_LIST = 'REQUEST_BILLING_LIST'
export const REQUEST_BILLING_INFO = 'REQUEST_BILLING_INFO'
export const REQUEST_BILLING_CONTACT_INFO = 'REQUEST_BILLING_CONTACT_INFO'
export const REQUEST_BILLING_UPDATE = 'REQUEST_BILLING_UPDATE'
export const REQUEST_BILLING_CONTACT_UPDATE = 'REQUEST_BILLING_CONTACT_UPDATE'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  items: [],
  paging: defaultPaging(),
  billing: {},
  contact: {},
}

const actions = {
  async [REQUEST_BILLING_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_BILLING_STATE, { isFetching: true })

      const { paging } = state
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/company/${company}/user-summary`, api.parseListingPayload(paging))
      await commit(UPDATE_BILLING_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_BILLING_STATE, { isFetching: false })
  },
  async [REQUEST_BILLING_INFO] ({ commit, dispatch, state }) {
    const { company } = this.state.app.appData
    await commit(UPDATE_BILLING_STATE, { isFetching: true })
    try {
      const res = await api.get(`/admin/company/${company}/billing-info`)
      await commit(UPDATE_BILLING_STATE, { billingInfo: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_BILLING_STATE, { isFetching: false })
  },
  async [REQUEST_BILLING_CONTACT_INFO] ({ commit, dispatch, state }) {
    const { company } = this.state.app.appData
    await commit(UPDATE_BILLING_STATE, { isFetching: true })
    try {
      const res = await api.get(`/admin/company/${company}/billing-contact`)
      await commit(UPDATE_BILLING_STATE, { billingContact: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_BILLING_STATE, { isFetching: false })
  },
  async [REQUEST_BILLING_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_BILLING_STATE, { isSaving: true })
      const { company } = this.state.app.appData
      const { billingInfo } = state
      await api.put(`/admin/company/${company}/billing-info`, billingInfo)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_BILLING_STATE, { isSaving: false })
  },
  async [REQUEST_BILLING_CONTACT_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_BILLING_STATE, { isSaving: true })
      const { company } = this.state.app.appData
      const { billingContact } = state
      await api.put(`/admin/company/${company}/billing-contact`, {
        ...billingContact,
        ...(has(billingContact, 'phone') ? { phone: formatPhone(billingContact.phone) } : {}),
        ...(has(billingContact, 'reporting_mgr_email') ? { reporting_mgr: billingContact.reporting_mgr_email } : {}),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_BILLING_STATE, { isSaving: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_BILLING_STATE] (s, payload) {
    merge(s, payload)
    if (payload.billingInfo) s.billingInfo = cloneDeep(payload.billingInfo)
    if (payload.billingContact) s.billingContact = cloneDeep(payload.billingContact)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
