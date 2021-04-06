/* eslint-disable camelcase */
import axios from 'axios'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { Auth } from 'aws-amplify'
import { validate } from 'vee-validate'
import { get, isEmpty, isArray, omit, has, keys, camelCase, partialRight, partial, startCase, first, orderBy, pick, uniq, indexOf, without } from 'lodash'
import {
  ENV_PRODUCTION,
  ROUTE_SIGNUP_VISITOR,
  ROUTE_RESET_PASSWORD,
  ROUTE_SIGNIN,
  ROUTE_DASHBOARD,
  ROUTE_USERS,
  ROUTE_COMPANY,
  ROUTE_BILLING,
  ROUTE_WORKPLACE_READINESS,
  ROUTE_REPORTING,
  ROUTE_ENTRY_LIST,
  ROUTE_NOTIFICATIONS,
  ROUTE_MYACCOUNT,
  ROUTE_COMPANIES,
  ROUTE_ALLUSERS,
  ROUTE_PUBLIC_READINESS,
  ROUTE_ENTRY_SCAN,
  ROUTE_VERIFIED_WORKFORCE,
  ROLE_SUPERUSER,
  ROLE_COMPANY_SUPER_ADMIN,
  ROLE_COMPANY_ADMIN,
  ROLE_COMPANY_ENTRY,
  ROLE_COMPANY_BILLING,
  ROLE_DEPARTMENT_ADMIN,
  ROLE_DEPARTMENT_ENTRY,
  ROLE_COMPANY_USER,
  ROLE_GENERAL_USER,
  ROUTE_USER,
  EVENT_SEND,
  EVENT_ENTRY,
  EVENT_SICK_DAY,
  EVENT_WORK_FROM_HOME,
  EVENT_QUARANTINE,
  EVENT_RESPONSE,
  EVENT_COMMUNICATION,
  EVENT_TEST,
  ROUTE_SURVEY_FORM,
  ROUTE_NOT_ALLOWED,
  ROUTE_SIGNOUT,
  ROUTE_SIGNUP,
  ROUTE_NEW_PASSWORD,
  ROUTE_SIGNUP_LINK,
  ROUTE_SIGNIN_CONFIRM,
  ROUTE_USER_AGREEMENT,
  ROUTE_SESSION_EXPIRED,
  ROUTE_DEBUG,
  ROUTE_TOS,
  ROUTE_PRIVATEPOLICY,
} from './constants'

const API_URL = process.env.VUE_APP_DATA_API_URL

export const UNCENTRALIZED_AXIOS = 'UNCENTRALIZED_AXIOS'

export class BackendException extends Error {}
export class AppException extends Error {}

export function rule2MbOnly (file) {
  return !file || file.size < 2000000 || 'File size should be less than 2 MB!'
}

export function ruleCsvOnly (file) {
  return !file || file.type === 'text/csv' || 'File is not a csv file!'
}

export function ruleImageOnly (file) {
  return !file || ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) || 'File is not an image file!'
}

export function ruleCSVOnly (file) {
  return !file || ['text/csv'].includes(file.type) || 'File is not a csv file!'
}

export function invokeRules (files, rule) {
  if (!isEmpty(files)) {
    let x = files
    if (!isArray(files)) {
      x = [files]
    }
    x = x.map((f) => rule(f))
    return first(x)
  }
  return false
}

export function formatPhone (phone = '') {
  return phone.replace(/[\s-]/g, '')
}

export function formatDate (date = '') {
  if (moment.isMoment(date)) {
    return date.valueOf()
  }
  if (typeof date === 'string') {
    return moment(date).valueOf()
  }
  if (typeof date === 'number') {
    return date
  }
  throw new AppException(`Date ${date} is not a valid date`)
}

export function getCustomDate (dates) {
  const [from, to] = dates
  const mFrom = moment(from)
  const mTo = moment(to)

  let result = null
  if (mFrom.month() !== mTo.month()) {
    result = `${mFrom.format('hh:mm A, MMMM DD')} - ${mTo.format('hh:mm A, MMMM DD,')} ${mTo.format('YYYY')}`
  } else if (mFrom.day() !== mTo.day()) {
    result = `${mFrom.format('hh:mm A Do')} - ${mTo.format('hh:mm A Do')}, of ${mTo.format('MMMM YYYY')}`
  } else if (mFrom.hour() !== mTo.hour()) {
    const hourPart = mFrom.format('A') === mTo.format('A') ? ['hh:mm', 'hh:mm A'] : ['hh:mm A', 'hh:mm A']
    result = `${mFrom.format(hourPart[0])} - ${mTo.format(hourPart[1])}, ${mTo.format('MMMM DD, YYYY, dddd')}`
  } else {
    result = `${mFrom.format('hh')}-${mTo.format('hh:mm A')}, ${mTo.format('MMMM DD, YYYY, dddd')}`
  }

  return result
}

export const importUsers = {
  messages: [],
  validateRequiredFields (data = {}, index) {
    const required = [
      'name', 'phone', 'email',
    ]
    const missingFields = []
    required.forEach(x => {
      if (isEmpty(data[x])) missingFields.push(x)
    })

    let message = null
    if (missingFields.length > 0) {
      message = `Missing fields ${missingFields.join(', ')}`
      this.messages.push({ message, index: index + 1 })
    }
    return message
  },
  async validateEmail (data = {}, index) {
    const { errors } = await validate(data.email, 'required|email')
    let message = null
    if (errors.length) {
      message = errors.join(' ').replace(/\{field\}/g, 'Email')
      this.messages.push({ message, index: index + 1 })
    }
    return message
  },
  async validatePhone (data = {}, index) {
    const { errors } = await validate(data.phone, 'required|phone')
    let message = null
    if (errors.length) {
      message = `${errors.join(' ').replace(/\{field\}/g, 'Phone')} Please use international phone number format.`
      this.messages.push({ message, index: index + 1 })
    }
    return message
  },
  validateBirtdate (data = {}, index) {
    let message = null
    if (data.birthdate) {
      if (!moment(data.birthdate).isValid()) {
        message = 'Invalid birthdate. Format is "YYYY/MM/DD".'
        this.messages.push({ message, index: index + 1 })
      } else if (moment(data.birthdate).format('YYYY/MM/DD') !== data.birthdate) {
        message = 'Invalid date format for birthdate. Format is "YYYY/MM/DD".'
        this.messages.push({ message, index: index + 1 })
      }
    }
    return message
  },
  validateDepartment (data = {}, index, info) {
    let message = null
    if (data.department) {
      const exists = info.departments.filter(department => {
        return department.name.toLowerCase() === data.department.toLowerCase()
      })
      if (isEmpty(exists)) {
        message = `Invalid department name. Valid values are ${info.departments.map(x => x.name).join(', ')}.`
        this.messages.push({ message, index: index + 1 })
      }
    }
    return message
  },
  validateReportingMgr (data = {}, index, info) {
    let message = null
    if (data.reporting_mgr) {
      const exists = info.users.filter(user => {
        return user.email.toLowerCase() === data.reporting_mgr.toLowerCase()
      })
      if (isEmpty(exists)) {
        message = "Invalid reporting manager's email."
        this.messages.push({ message, index: index + 1 })
      }
    }
    return message
  },
  validateMetaFields (data = {}, index, info) {
    const { metaFields = [] } = info
    const message = []
    if (metaFields.length) {
      metaFields.forEach((x) => {
        const key = `meta_${x.tag}`
        if (data[key]) {
          const exists = x.values.filter(value => {
            return value === data[key]
          })
          if (isEmpty(exists)) {
            message.push(`Invalid value for ${key}. Value can be one of the ff: ${x.values.join(', ')}.`)
          }
        }
      })
    }

    if (message.length) {
      this.messages.push({ message: message.join('. '), index: index + 1 })
      return message.join('. ')
    }

    return null
  },
}

class Api {
  constructor () {
    this.authToken = null
    this.user = {}
    this.baseUrl = API_URL
    this.isStage = process.env.VUE_APP_ENV !== ENV_PRODUCTION

    this.getCustomDate = getCustomDate.bind(this)

    const opts = {
      baseURL: this.baseUrl,
      timeout: 0,
      responseType: 'json',
      headers: {
        'X-App': 'VueApp',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
    }

    this.api = axios.create(opts)

    this.api.interceptors.request.use(async (config) => {
      const isGuestEndpoint = /^\/guest/g.test(config.url)

      if (!isGuestEndpoint) {
        const token = await this.getToken()
        if (token) {
          config.headers = {
            Authorization: token,
          }
        }
      }
      return config
    })

    this.routes = {
      ROUTE_SIGNUP_VISITOR,
      ROUTE_RESET_PASSWORD,
      ROUTE_SIGNIN,
      ROUTE_DASHBOARD,
      ROUTE_USERS,
      ROUTE_COMPANY,
      ROUTE_BILLING,
      ROUTE_WORKPLACE_READINESS,
      ROUTE_REPORTING,
      ROUTE_ENTRY_LIST,
      ROUTE_NOTIFICATIONS,
      ROUTE_MYACCOUNT,
      ROUTE_COMPANIES,
      ROUTE_ALLUSERS,
      ROUTE_PUBLIC_READINESS,
      ROUTE_ENTRY_SCAN,
      ROUTE_VERIFIED_WORKFORCE,
      ROUTE_USER,
      ROUTE_SURVEY_FORM,
      ROUTE_NOT_ALLOWED,
      ROUTE_SIGNOUT,
      ROUTE_SIGNUP,
      ROUTE_NEW_PASSWORD,
      ROUTE_SIGNUP_LINK,
      ROUTE_SIGNIN_CONFIRM,
      ROUTE_USER_AGREEMENT,
      ROUTE_SESSION_EXPIRED,
      ROUTE_DEBUG,
      ROUTE_TOS,
      ROUTE_PRIVATEPOLICY,
    }

    const accesses = [
      ROUTE_SIGNIN,
      ROUTE_RESET_PASSWORD,
      ROUTE_SIGNUP_VISITOR,
      ROUTE_DASHBOARD,
      ROUTE_USERS,
      ROUTE_COMPANY,
      ROUTE_BILLING,
      ROUTE_WORKPLACE_READINESS,
      ROUTE_REPORTING,
      ROUTE_ENTRY_LIST,
      ROUTE_NOTIFICATIONS,
      ROUTE_MYACCOUNT,
      ROUTE_COMPANIES,
      ROUTE_ALLUSERS,
      ROUTE_PUBLIC_READINESS,
      ROUTE_ENTRY_SCAN,
      ROUTE_VERIFIED_WORKFORCE,
    ]
    accesses.forEach((x) => {
      this[camelCase(`AllowedTo${x}`)] = partialRight(this.hasAccess, x).bind(this)
    })

    const roles = [
      ROLE_SUPERUSER,
      ROLE_COMPANY_SUPER_ADMIN,
      ROLE_COMPANY_ADMIN,
      ROLE_COMPANY_ENTRY,
      ROLE_COMPANY_BILLING,
      ROLE_DEPARTMENT_ADMIN,
      ROLE_DEPARTMENT_ENTRY,
      ROLE_COMPANY_USER,
      ROLE_GENERAL_USER,
    ]
    roles.forEach((x) => {
      this[camelCase(`Is${startCase(x)}`)] = partial(this.isRole, x).bind(this)
    })

    const commonRoutes = [
      ROUTE_SIGNIN,
      ROUTE_RESET_PASSWORD,
      ROUTE_SIGNUP_LINK,
      ROUTE_SIGNIN_CONFIRM,
      ROUTE_USER_AGREEMENT,
      ROUTE_SIGNUP_VISITOR,
      ROUTE_NEW_PASSWORD,
      ROUTE_SIGNUP,
      ROUTE_SIGNOUT,
      ROUTE_MYACCOUNT,
      ROUTE_NOT_ALLOWED,
      ROUTE_SESSION_EXPIRED,
      ROUTE_SURVEY_FORM,
      ROUTE_TOS,
      ROUTE_PRIVATEPOLICY,
    ]

    this.routeMatrix = {
      [ROLE_SUPERUSER]: [
        ROUTE_DEBUG,
        ROUTE_DASHBOARD,
        ROUTE_USERS,
        ROUTE_USER,
        ROUTE_COMPANY,
        ROUTE_BILLING,
        ROUTE_WORKPLACE_READINESS,
        ROUTE_REPORTING,
        ROUTE_ENTRY_LIST,
        ROUTE_NOTIFICATIONS,
        ROUTE_COMPANIES,
        ROUTE_ALLUSERS,
        ROUTE_PUBLIC_READINESS,
        ROUTE_ENTRY_SCAN,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_COMPANY_SUPER_ADMIN]: [
        ROUTE_MYACCOUNT,
        ROUTE_DASHBOARD,
        ROUTE_USERS,
        ROUTE_USER,
        ROUTE_COMPANY,
        ROUTE_BILLING,
        ROUTE_WORKPLACE_READINESS,
        ROUTE_REPORTING,
        ROUTE_ENTRY_LIST,
        ROUTE_NOTIFICATIONS,
        ROUTE_ENTRY_SCAN,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_COMPANY_ADMIN]: [
        ROUTE_MYACCOUNT,
        ROUTE_DASHBOARD,
        ROUTE_USERS,
        ROUTE_USER,
        ROUTE_COMPANY,
        ROUTE_REPORTING,
        ROUTE_ENTRY_LIST,
        ROUTE_NOTIFICATIONS,
        ROUTE_ENTRY_SCAN,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_COMPANY_ENTRY]: [
        ROUTE_MYACCOUNT,
        ROUTE_REPORTING,
        ROUTE_ENTRY_SCAN,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_COMPANY_BILLING]: [
        ROUTE_MYACCOUNT,
        ROUTE_COMPANY,
        ROUTE_BILLING,
        ROUTE_NOTIFICATIONS,
      ].concat(commonRoutes),
      [ROLE_DEPARTMENT_ADMIN]: [
        ROUTE_MYACCOUNT,
        ROUTE_DASHBOARD,
        ROUTE_USERS,
        ROUTE_USER,
        ROUTE_COMPANY,
        ROUTE_WORKPLACE_READINESS,
        ROUTE_ENTRY_LIST,
        ROUTE_NOTIFICATIONS,
        ROUTE_ENTRY_SCAN,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_DEPARTMENT_ENTRY]: [
        ROUTE_MYACCOUNT,
        ROUTE_WORKPLACE_READINESS,
        ROUTE_ENTRY_LIST,
        ROUTE_NOTIFICATIONS,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_COMPANY_USER]: [
        ROUTE_MYACCOUNT,
        ROUTE_ENTRY_LIST,
        ROUTE_NOTIFICATIONS,
        ROUTE_VERIFIED_WORKFORCE,
      ].concat(commonRoutes),
      [ROLE_GENERAL_USER]: [
        ROUTE_MYACCOUNT,
      ].concat(commonRoutes),
    }
  }

  async get (endpoint, params = {}, config = {}) {
    return this.api.get(endpoint, {
      ...config,
      params,
    })
  }

  async post (endpoint, body = {}, config = {}) {
    return this.api.post(endpoint, body, config)
  }

  async put (endpoint, body = {}, config = {}) {
    return this.api.put(endpoint, body, config)
  }

  async delete (endpoint, config = {}) {
    return this.api.delete(endpoint, config)
  }

  parseError (err = {}, defaultMessage) {
    if (typeof err === 'string') {
      return err
    }

    if (err.isAxiosError) {
      const known = [
        'ECONNABORTED',
      ].includes(err.code)
      if (known) {
        return `${defaultMessage} [${err.message}]`
      }
      if (err.response) {
        if (has(err.response, 'data.error')) {
          return get(err.response, 'data.error')
        }
      }
    }

    if (err.message) {
      return err.message
    }

    return defaultMessage
  }

  parseItem (res) {
    const data = get(res, 'data.data', {})
    if (has(data, 'item')) return data.item
    throw new BackendException('Invalid response. There is no item found.')
  }

  parseItems (res) {
    const data = get(res, 'data.data', {})
    if (has(data, 'items')) return data.items
    throw new BackendException('Invalid response. There are no items found.')
  }

  parseSelect (res, labelAttr = 'name') {
    const data = this.parseItems(res)
    return data.map((x) => ({ id: x.id, [labelAttr]: x[labelAttr] || x.id }))
  }

  parseMeta (res) {
    const data = get(res, 'data.data', {})
    return data.meta || {}
  }

  parseCompanyMeta (res) {
    const meta = this.parseItem(res)
    return keys(meta).map((x) => {
      const i = meta[x] || {}
      return {
        id: `${uuidv4()}`,
        tag: x,
        label: get(i, 'label', x),
        values: get(i, 'values', []),
        status: get(i, 'status', 'inactive'),
      }
    })
  }

  parseUserMeta (res) {
    const meta = this.parseItem(res)
    return keys(meta).map((x) => {
      const i = meta[x] || {}
      return {
        id: `${uuidv4()}`,
        tag: x,
        value: get(i, 'value', null),
        status: get(i, 'status', 'inactive'),
      }
    })
  }

  parseEvents (res) {
    const items = this.parseItems(res)
    return items.map((item) => {
      item.time = moment(item.created_at).format('HH:mm:ss')
      item.date = moment(item.created_at).format('MM/DD/YYYY')
      return item
    })
  }

  parseUserEvents (res, dateLimit, activeUserEvents = {}) {
    let items = []

    const dates = {}

    const getDate = (item) => {
      const {
        type,
        created_at: cat,
        started_at: sat,
        date_tested: dt,
      } = item
      if ([
        EVENT_SICK_DAY,
        EVENT_WORK_FROM_HOME,
        EVENT_QUARANTINE,
        EVENT_RESPONSE,
      ].includes(type)) {
        return moment(sat)
      }
      if (type === EVENT_TEST) return moment(dt)
      if ([
        EVENT_SEND,
        EVENT_ENTRY,
        EVENT_COMMUNICATION,
      ].includes(type)) return moment(cat)
    }

    const dateFormat = 'YYYYMMDD'

    // group by date format: YYYYMMDD
    this.parseItems(res).forEach((item = {}, i) => {
      let date = getDate(item)
      let group = parseInt(date.format(dateFormat), 0)

      dates[group] = dates[group] || []

      const curItem = {
        ...item,
        ended: false,
        index: date.valueOf(),
        date: date.format('DD|ddd'),
        _date: date.valueOf(),
      }
      dates[group].push(curItem)

      if ([
        EVENT_SICK_DAY,
        EVENT_WORK_FROM_HOME,
        EVENT_QUARANTINE,
        EVENT_RESPONSE,
      ].includes(item.type)) {
        curItem.start = item.type
      }

      const { ended_at: eat } = item
      if (eat) { // count end date as additional entry
        date = moment(eat)
        group = parseInt(date.format(dateFormat), 0)
        dates[group] = dates[group] || []
        dates[group].push({
          ...item,
          ended: true,
          end: item.type, // flagged the item as end event of item.type
          index: date.valueOf(),
          _date: date.valueOf(),
          date: date.format('DD|ddd'),
        })
      }
    })

    let lastItem = { parents: [], _parents: {} }
    Object.keys(dates).forEach((key, y) => {
      const groupItems = []
      orderBy(dates[key], ['index'], ['asc']).forEach((item, i) => {
        const x = omit(item, ['date'])
        if (i === (dates[key].length - 1)) {
          x.date = item.date // only the last item should have the date
        }

        x.parents = lastItem.parents

        groupItems.push(x)
        lastItem = {
          ...lastItem,
          ...pick(item, ['index']),
        }

        // record the last parent
        if ([
          EVENT_SICK_DAY,
          EVENT_WORK_FROM_HOME,
          EVENT_QUARANTINE,
          EVENT_RESPONSE,
        ].includes(item.type)) {
          lastItem.parents = uniq(lastItem.parents.concat([item.type]))
          lastItem._parents[item.type] = item
        }

        if (item.end) {
          lastItem.parents.splice(indexOf(lastItem.parents, item.type), 1)
        }
      })

      if (y < dates.length) {
        groupItems.push({
          type: 'spacer',
          index: lastItem.index + 1,
          parents: lastItem.parents,
        })
      }

      items = items.concat(groupItems)
    })

    items = orderBy(items, ['index'], ['desc'])

    lastItem.parents = Object.keys(activeUserEvents)

    if (lastItem.parents.length > 0) {
      const date = moment()

      if (!date.isBefore(moment(dateLimit))) return items

      const key = date.format(dateFormat)
      if (dates[key]) {
        delete items[0].date
        items.push({
          type: 'spacer',
          index: lastItem.index + 1,
          parents: lastItem.parents,
        })
      }
      lastItem.parents.forEach((x, i) => {
        const b = activeUserEvents[x]
        items.push({
          ...b,
          ended: false,
          end: x,
          index: date.valueOf() + b.index,
          _date: date.valueOf(),
          parents: without(lastItem.parents, x),
        })
      })
      items = orderBy(items, ['index'], ['desc'])
      items[0].date = date.format('DD|ddd')
    }

    return items
  }

  parsePagination (res) {
    const {
      page = 1,
      limit = 10,
      pages = 0,
      total = 0,
    } = get(res, 'data.data', {})
    return { page, limit, pages, total }
  }

  parseListingPayload (payload) {
    let _payload = { ...omit(payload, 'sort', 'all') }

    const { sort } = payload
    if (isArray(sort)) {
      const [col = [], desc] = sort
      if (!isEmpty(col)) {
        const _sort = []
        col.forEach((c, i) => {
          _sort.push({ column: c, order: desc[i] ? 'desc' : 'asc' })
        })
        _payload._sort = JSON.stringify(_sort)
      }
    }

    const { q } = payload
    if (isEmpty(q)) {
      _payload = omit(_payload, 'q')
    }

    return _payload
  }

  install (Vue) {
    Vue.$api = this
    Vue.prototype.$api = Vue.$api
  }

  async refreshToken () {
    const cognitoUser = await Auth.currentAuthenticatedUser()
    const currentSession = await Auth.currentSession()

    if (currentSession.isValid()) {
      return new Promise((resolve, reject) => {
        try {
          cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
            if (err) return reject(err)
            return resolve(session)
          })
        } catch (e) {
          return reject(e)
        }
      })
    }
    throw new Error('Session has expired.')
  }

  async getToken () {
    const currentSession = await Auth.currentSession()
    return get(currentSession, 'idToken.jwtToken')
  }

  hasAccess (role = '', subject = '') {
    const s = (subject || this.user.group) || ''
    if (isEmpty(role) || isEmpty(s)) return false
    if (keys(this.routeMatrix).includes(role)) {
      return this.routeMatrix[role].includes(s)
    }
    return false
  }

  isRole (role = '', subject = '') {
    const s = (subject || this.user.group) || ''
    return role.toLowerCase() === s.toLowerCase()
  }

  async validateImportUsers (data = [], info = {}) {
    importUsers.messages = []
    await Promise.all(data.map(async (item, index) => {
      let message = importUsers.validateRequiredFields(item, index)
      if (message) return

      message = await importUsers.validateEmail(item, index)
      if (message) return

      message = await importUsers.validatePhone(item, index)
      if (message) return

      message = importUsers.validateBirtdate(item, index)
      if (message) return

      message = importUsers.validateDepartment(item, index, info)
      if (message) return

      message = importUsers.validateReportingMgr(item, index, info)
      if (message) return

      message = importUsers.validateMetaFields(item, index, info)
    }))

    importUsers.messages = orderBy(importUsers.messages, ['index'], ['asc'])

    return importUsers.messages
  }
}

export default new Api()
