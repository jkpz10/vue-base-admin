import moment from 'moment'
// import { v4 as uuidv4 } from 'uuid'
import { cloneDeep, find, has, merge, omit, get, chain, isEmpty, remove } from 'lodash'

import api, { formatPhone } from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'
import { CONSENT_HIPAA_VC, CONSENT_USER_AGREEMENT } from '../../constants'

export const RESET_USER_STATE = 'RESET_USER_STATE'

export const UPDATE_USER_STATE = 'UPDATE_USER_STATE'
export const REQUEST_RESEND_EMAIL = 'REQUEST_RESEND_EMAIL'
export const REQUEST_USER_LIST = 'REQUEST_USER_LIST'
export const REQUEST_USER_INFO = 'REQUEST_USER_INFO'
export const REQUEST_USER_ADD_USER = 'REQUEST_USER_ADD_USER'
export const REQUEST_USER_SIGNUP_MANUALLY = 'REQUEST_USER_SIGNUP_MANUALLY'
export const REQUEST_USER_UPDATE = 'REQUEST_USER_UPDATE'
export const REQUEST_USER_UPDATE_META = 'REQUEST_USER_UPDATE_META'
export const REQUEST_USER_META_LIST = 'REQUEST_USER_META_LIST'
export const REQUEST_USER_WEARABLE = 'REQUEST_USER_WEARABLE'
export const REQUEST_USER_COMPANY_META = 'REQUEST_USER_COMPANY_META'

export const REQUEST_RECORD_AGREEMENT = 'REQUEST_RECORD_AGREEMENT'
export const REQUEST_USER_AGREEMENT = 'REQUEST_USER_AGREEMENT'
export const CHECK_USER_CONSENTS = 'CHECK_USER_CONSENTS'
export const EV_REQUIRES_USER_AGREEMENT = 'EV_REQUIRES_USER_AGREEMENT'
export const EV_USER_AGREEMENT_RECORDED = 'EV_USER_AGREEMENT_RECORDED'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormEdit: false,
  items: [],
  item: {},
  meta: [],
  consents: [],
  wearables: [],
  companyMeta: [],
  dependents: [
    {
      name: 'James',
      url: 'https://i.pravatar.cc/300?u=adhtrd734fh',
    },
    {
      name: 'Keneth',
      url: 'https://i.pravatar.cc/200?u=a042581f4e29026704d',
    },
  ],
  parentId: null,
  paging: defaultPaging(),
}

// actions
export const actions = {
  async [EV_REQUIRES_USER_AGREEMENT] () {},
  async [EV_USER_AGREEMENT_RECORDED] () {},
  async [REQUEST_RECORD_AGREEMENT] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isSaving: true })
      const { item } = state

      // hipaa
      await api.post(`/admin/user/${item.id}/consent`, {
        name: CONSENT_HIPAA_VC,
        acknowledge: true,
        user_id: item.id,
        company_id: item.company_id,
      })

      await api.post(`/admin/user/${item.id}/consent`, {
        name: CONSENT_USER_AGREEMENT,
        acknowledge: true,
        user_id: item.id,
        company_id: item.company_id,
      })

      await dispatch(EV_USER_AGREEMENT_RECORDED)
    } catch (error) {
      console.dir(error)
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isSaving: false })
  },
  async [CHECK_USER_CONSENTS] ({ commit, dispatch, state }, { user }) {
    if (user) {
      await commit(UPDATE_USER_STATE, { item: user })
      await dispatch(REQUEST_USER_AGREEMENT)

      let consents = get(state, 'consents', [])
      consents = chain(consents).filter({ acknowledge: true }).map('name').value() || []

      const required = [
        CONSENT_USER_AGREEMENT,
        CONSENT_HIPAA_VC,
      ]
      remove(required, (x) => consents.includes(x))

      if (isEmpty(consents) || !isEmpty(required)) {
        // need to ask user to accepts the agreement
        await dispatch(EV_REQUIRES_USER_AGREEMENT)
      }
    }
  },
  async [REQUEST_USER_AGREEMENT] ({ commit, dispatch, state }) {
    try {
      const { item } = state
      const res = await api.get(`/admin/user/${item.id}/consent`)
      await commit(UPDATE_USER_STATE, { consents: api.parseItems(res) })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [REQUEST_USER_COMPANY_META] ({ commit, dispatch, state }) {
    try {
      const { item } = state
      const res = await api.get(`/admin/company/${item.company_id}/metadata`)
      await commit(UPDATE_USER_STATE, { companyMeta: api.parseCompanyMeta(res) })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [REQUEST_RESEND_EMAIL] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isSaving: true })
      const { item } = state
      await api.put(`/admin/company/${item.company_id}/emails`, {
        email: item.email,
        status: 'waiting',
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isSaving: false })
  },
  async [REQUEST_USER_UPDATE_META] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isSaving: true })
      const { meta: items, item, companyMeta } = state
      let meta = {}
      items.forEach((x) => {
        meta[x.tag] = x
      })

      const res = await api.put(`/admin/user/${item.id}/metadata`, { meta })
      const userMeta = api.parseUserMeta(res)

      meta = []
      companyMeta.map((companyMeta) => {
        const uMeta = find(userMeta, { tag: companyMeta.tag }) || {}
        meta.push({
          value: uMeta.value || '',
          choices: companyMeta.values,
          tag: companyMeta.tag,
        })
      })

      await commit(UPDATE_USER_STATE, { meta })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isSaving: false })
  },
  async [REQUEST_USER_META_LIST] ({ commit, dispatch, state }) {
    await commit(UPDATE_USER_STATE, { isFetching: true })
    try {
      const { item, companyMeta } = state
      const res = await api.get(`/admin/user/${item.id}/metadata`)
      const userMeta = api.parseUserMeta(res)
      const meta = []

      companyMeta.map((companyMeta) => {
        const uMeta = find(userMeta, { tag: companyMeta.tag }) || {}
        meta.push({
          ...omit(companyMeta, 'values'),
          value: uMeta.value || '',
          choices: companyMeta.values,
        })
      })

      await commit(UPDATE_USER_STATE, { meta })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isFetching: false })
  },
  async [REQUEST_USER_INFO] ({ commit, dispatch, state }) {
    await commit(UPDATE_USER_STATE, { isFetching: true })
    try {
      const { item } = state
      const res = await api.get(`/admin/user/${item.id}`)
      await commit(UPDATE_USER_STATE, { item: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isFetching: false })
  },
  async [REQUEST_USER_SIGNUP_MANUALLY] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isSaving: true })
      const { item } = state
      const { company } = this.state.app.appData
      await api.post('/admin/user/signup', {
        ...item,
        company_id: company,
        type: 'user',
        ...(has(item, 'phone') ? { phone: formatPhone(item.phone) } : {}),
      })
      await commit(UPDATE_USER_STATE, { isFormAdd: false, isFormEdit: false })
      await dispatch(REQUEST_USER_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isSaving: false })
  },
  async [REQUEST_USER_ADD_USER] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isSaving: true })
      const { item } = state
      const { company } = this.state.app.appData
      await api.post('/admin/user', {
        ...item,
        company_id: company,
        ...(has(item, 'phone') ? { phone: formatPhone(item.phone) } : {}),
      })
      await commit(UPDATE_USER_STATE, { isFormAdd: false, isFormEdit: false, paging: { _page: 1, q: item.email } })
      await dispatch(REQUEST_USER_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isSaving: false })
  },
  async [REQUEST_USER_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isSaving: true })
      const { item } = state
      await api.put(`/admin/user/${item.id}`, {
        ...item,
        ...(has(item, 'phone') ? { phone: formatPhone(item.phone) } : {}),
        ...(has(item, 'reporting_mgr_email') ? { reporting_mgr: item.reporting_mgr_email } : {}),
        ...(has(item, 'birth_date') ? { birthdate: moment(item.birth_date).valueOf() } : {}),
      })
      await commit(UPDATE_USER_STATE, { isFormAdd: false, isFormEdit: false, paging: { _page: 1, q: item.email } })
      await dispatch(REQUEST_USER_LIST)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isSaving: false })
  },
  async [REQUEST_USER_LIST] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_USER_STATE, { isFetching: true })

      const { paging } = state
      const { company } = this.state.app.appData
      const res = await api.get(`/admin/user/company/${company}`, api.parseListingPayload(paging))
      await commit(UPDATE_USER_STATE, {
        items: api.parseItems(res),
        paging: updatePaging(api.parsePagination(res)),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isFetching: false })
  },
  async [REQUEST_USER_WEARABLE] ({ commit, dispatch, state }) {
    await commit(UPDATE_USER_STATE, { isFetching: true })
    try {
      const { item } = state
      const res = await api.get(`/admin/user/${item.id}/wearables`)
      await commit(UPDATE_USER_STATE, { wearables: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_USER_STATE, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_USER_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items || [])
    if (payload.meta) s.meta = [].concat(payload.meta || [])
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.wearables) s.wearables = [].concat(payload.wearables || [])
    if (payload.companyMeta) s.companyMeta = [].concat(payload.companyMeta || [])
    if (payload.consents) s.consents = [].concat(payload.consents || [])
  },
  async [RESET_USER_STATE] (s) {
    merge(s, cloneDeep(moduleState))
    s.companyMeta = []
    s.consents = []
    s.items = []
    s.meta = []
    s.item = {}
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
