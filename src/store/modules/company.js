import * as csv from 'csvtojson'
import moment from 'moment'
import { cloneDeep, merge, has, isEmpty, startsWith, find, omit } from 'lodash'

import api, { AppException, formatPhone } from '../../api'
import { APP_ERROR, EV_CURRENT_COMPANY_MODIFIED } from './app'
import { TEMPORARY_PASSWORD } from '../../constants'

export const UPDATE_COMPANY_STATE = 'UPDATE_COMPANY_STATE'
export const REQUEST_COMPANY_INFO = 'REQUEST_COMPANY_INFO'
export const REQUEST_COMPANY_STAT = 'REQUEST_COMPANY_STAT'
export const REQUEST_COMPANY_CONTACT_INFO = 'REQUEST_COMPANY_CONTACT_INFO'
export const REQUEST_COMPANY_UPDATE = 'REQUEST_COMPANY_UPDATE'
export const REQUEST_COMPANY_CONTACT_UPDATE = 'REQUEST_COMPANY_CONTACT_UPDATE'
export const REQUEST_UPLOAD_CSV = 'REQUEST_UPLOAD_CSV'
export const EV_CSV_HAS_ERROR = 'EV_CSV_HAS_ERROR'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isUploading: false,
  company: {},
  contact: {},
  stat: {},
  commonFields: [
    'name',
    'email',
    'phone',
    'birthdate',
    'department',
    'reporting_mgr',
  ],
  uploadMessages: [],
  forRegistration: [],
}

const actions = {
  async [EV_CSV_HAS_ERROR] () {},
  async [REQUEST_COMPANY_STAT] ({ commit, dispatch }) {
    const { company } = this.state.app.appData
    await commit(UPDATE_COMPANY_STATE, { isFetching: true })
    try {
      const res = await api.get(`/admin/company/${company}/stat`)
      await commit(UPDATE_COMPANY_STATE, { stat: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANY_STATE, { isFetching: false })
  },
  async [REQUEST_COMPANY_INFO] ({ commit, dispatch }) {
    const { company } = this.state.app.appData
    await commit(UPDATE_COMPANY_STATE, { isFetching: true })
    try {
      const res = await api.get(`/admin/company/${company}`)
      await commit(UPDATE_COMPANY_STATE, { company: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANY_STATE, { isFetching: false })
  },
  async [REQUEST_COMPANY_CONTACT_INFO] ({ commit, dispatch, state }) {
    const { company } = this.state.app.appData
    await commit(UPDATE_COMPANY_STATE, { isFetching: true })
    try {
      const res = await api.get(`/admin/company/${company}/main-contact`)
      await commit(UPDATE_COMPANY_STATE, { contact: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANY_STATE, { isFetching: false })
  },
  async [REQUEST_COMPANY_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_COMPANY_STATE, { isSaving: true })
      const { company } = state
      await api.put(`/admin/company/${company.id}`, company)
      await dispatch(EV_CURRENT_COMPANY_MODIFIED)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANY_STATE, { isSaving: false })
  },
  async [REQUEST_COMPANY_CONTACT_UPDATE] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_COMPANY_STATE, { isSaving: true })
      const { company, contact } = state
      await api.put(`/admin/company/${company.id}/main-contact`, {
        ...contact,
        ...(has(contact, 'phone') ? { phone: formatPhone(contact.phone) } : {}),
        ...(has(contact, 'reporting_mgr_email') ? { reporting_mgr: contact.reporting_mgr_email } : {}),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANY_STATE, { isSaving: false })
  },
  async [REQUEST_UPLOAD_CSV] ({ dispatch, commit, state }, { info, csvString }) {
    try {
      await commit(UPDATE_COMPANY_STATE, { isUploading: true, uploadMessages: [], forRegistration: [] })
      // const { fields } = info
      const converter = csv({
        // headers: fields,
        trim: true,
      })
      const data = await converter.fromString(csvString)

      // check max allowed users
      const { max_user_count: limit, total_users: current } = state.stat
      if (current + data.length > limit) {
        throw new AppException(`You only have ${limit - current} user slots.`)
      }

      const messages = await api.validateImportUsers(data, info)
      const { company } = state
      const { metaFields } = info
      if (isEmpty(messages)) {
        // TODO: Upload csv data
        const items = data.map((item) => {
          let { birthdate, name, phone, email } = item
          birthdate = moment(birthdate, 'YYYY/MM/DD').valueOf()

          const fields = []

          Object.keys(item).forEach((key) => {
            if (startsWith(key, 'meta_')) {
              const tag = key.replace(/meta_/g, '')
              const field = find(metaFields, { tag })
              if (field) {
                fields.push({
                  value: item[key] || '',
                  choices: field.values,
                  tag,
                })
              }
            }
          })

          return {
            birthdate,
            company_id: company.id,
            type: 'user',
            password: TEMPORARY_PASSWORD,
            meta_fields: fields,
            name,
            phone: formatPhone(phone),
            email,
            isProcessing: true,
            isError: false,
          }
        })
        const fn = async () => await commit(UPDATE_COMPANY_STATE, { uploadMessages: [], forRegistration: items.map((x) => cloneDeep(x)) })
        await fn()
        await Promise.all(items.map(async (item) => {
          try {
            await api.post('/admin/user/signup', omit(item, 'isProcessing', 'isError'))
          } catch (err) {
            item.isError = true
            await dispatch(APP_ERROR, { error: err })
          }
          item.isProcessing = false
          await fn()
          setTimeout(async () => {
            items.splice(items.indexOf(item), 1)
            await fn()
          }, 2500)
        }))
      } else {
        await dispatch(EV_CSV_HAS_ERROR, {})
        await commit(UPDATE_COMPANY_STATE, { uploadMessages: messages })
      }
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_COMPANY_STATE, { isUploading: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_COMPANY_STATE] (s, payload) {
    merge(s, payload)
    if (payload.company) s.company = cloneDeep(payload.company)
    if (payload.contact) s.contact = cloneDeep(payload.contact)
    if (payload.stat) s.stat = cloneDeep(payload.stat)
    if (payload.uploadMessages) s.uploadMessages = [].concat(payload.uploadMessages)
    if (payload.forRegistration) s.forRegistration = [].concat(payload.forRegistration)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
