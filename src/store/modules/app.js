import moment from 'moment'
import { Auth } from 'aws-amplify'
import { filter, cloneDeep, find, first, get, has, indexOf, isEmpty, merge, pick } from 'lodash'

import { COLOR_ERROR, COLOR_INFO, COLOR_WARNING, SNACKBAR_ADD } from '..'
import api, { BackendException, AppException } from '../../api'
import router, { rootDrawerMenuList, drawerMenuList } from '../../router'
import { EVENT_TEST, ROUTE_SIGNIN } from '../../constants'
import { REQUEST_SIGNOUT, RESET_LOGIN_STATE } from './login'

// constants
export const APP_ERROR = 'APP_ERROR'
export const TOGGLE_DRAWER = 'TOGGLE_DRAWER'

// modes
export const EV_SESSION_EXPIRED = 'EV_SESSION_EXPIRED'

export const RESET_APP_DATA = 'RESET_APP_DATA'

export const MODE_STALE = 'MODE_STALE'
export const MODE_FREEZE = 'MODE_FREEZE'
export const MODE_FORBIDDEN = 'MODE_FORBIDDEN'

export const UPDATE_LOGIN_INFORMATION = 'UPDATE_LOGIN_INFORMATION'
export const UPDATE_APP_DATA = 'UPDATE_APP_DATA'
export const EV_CHANGE_SELECTED_COMPANY = 'EV_CHANGE_SELECTED_COMPANY'
export const UPDATE_LAST_ERROR = 'UPDATE_LAST_ERROR'

export const LOAD_SESSION = 'LOAD_SESSION'
export const LOAD_USER_INFORMATION = 'LOAD_USER_INFORMATION'
export const LOAD_USER_GROUPS = 'LOAD_USER_GROUPS'
export const LOAD_APP_DATA = 'LOAD_APP_DATA'
export const LOAD_USER_SELECT = 'LOAD_USER_SELECT'
export const LOAD_DEPARTMENT_SELECT = 'LOAD_DEPARTMENT_SELECT'
export const LOAD_COMPANY_META = 'LOAD_COMPANY_META'

export const REQUEST_UPLOAD_AVATAR = 'REQUEST_UPLOAD_AVATAR'
export const REQUEST_UPLOAD_IMAGE = 'REQUEST_UPLOAD_IMAGE'

export const EV_CURRENT_COMPANY_MODIFIED = 'EV_CURRENT_COMPANY_MODIFIED'

// app bar
export const REQUEST_NOTIFICATION = 'REQUEST_NOTIFICATION'

// state
const moduleState = {
  drawer: false,
  mode: MODE_STALE,
  code: null,
  user: {
    menuList: [],
    rootMenuList: [],
  },
  isReady: false,
  isRestored: false,
  error: null,
  lastError: null,
  appData: {
    notifications: [],
    company: null,
    companyName: null,
    departments: [],
    companyMeta: [],
  },
}

const actions = {
  async [EV_SESSION_EXPIRED] () {
    router.replace({ name: ROUTE_SIGNIN })
  },
  async [EV_CHANGE_SELECTED_COMPANY] () {},
  async [REQUEST_UPLOAD_IMAGE] ({ dispatch }, payload) {
    try {
      const { item, file } = payload
      const mapping = {
        [EVENT_TEST]: `/app/event/${item.id}/photo-test-image`,
        avatar: `/app/user/${item.id}/avatar`,
        so2: `/app/event/${item.id}/photo-oxygen-saturation`,
        temperature: `/app/event/${item.id}/photo-temperature`,
        companyLogo: `/admin/company/${item.id}/logo`,
        facilityLogo: `/admin/company/${item.company}/facility/${item.id}/logo`,
      }
      const url = mapping[item.type]
      if (isEmpty(url)) {
        throw new AppException(`Unhandled upload type. Supported types are ${Object.keys(mapping).join(', ')}`)
      }
      return api.post(url, file, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
  },
  async [REQUEST_UPLOAD_AVATAR] ({ dispatch }, payload) {
    try {
      const { item } = payload
      return api.post(`/app/user/${item.id}/avatar`, payload.file, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
  },
  async [UPDATE_APP_DATA] ({ commit, state }, payload) {
    const { appData = {} } = state
    await commit(UPDATE_APP_DATA, {
      ...appData,
      ...payload,
    })
  },
  async [LOAD_USER_GROUPS] ({ dispatch }) {
    try {
      const res = await api.get('/admin/user-groups')
      await dispatch(UPDATE_APP_DATA, { groups: api.parseItems(res) })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [LOAD_COMPANY_META] ({ dispatch, state }) {
    try {
      const { appData } = state
      if (!appData.company) throw new AppException('Please select company first.')
      const res = await api.get(`/admin/company/${appData.company}/metadata`)
      await dispatch(UPDATE_APP_DATA, { companyMeta: api.parseCompanyMeta(res) })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [LOAD_USER_SELECT] ({ dispatch, state }) {
    try {
      const { appData } = state
      if (!appData.company) throw new AppException('Please select company first.')
      const res = await api.get(`/admin/user/company/${appData.company}`, { no_paging: 1 })
      await dispatch(UPDATE_APP_DATA, { users: api.parseSelect(res, 'email') })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [LOAD_DEPARTMENT_SELECT] ({ dispatch, state }) {
    try {
      const { appData } = state
      if (!appData.company) throw new AppException('Please select company first.')
      const res = await api.get(`/admin/company/${appData.company}/department`, { no_paging: 1 })
      await dispatch(UPDATE_APP_DATA, { departments: api.parseSelect(res) })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [REQUEST_NOTIFICATION] ({ dispatch, state }) {
    const { user } = state
    try {
      const res = await api.get(`/admin/event/${get(user, 'company.id')}/notifications/${user.id}`, {
        today: moment().startOf('day').toISOString(),
      })
      await dispatch(UPDATE_APP_DATA, { notifications: api.parseItems(res) })
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [LOAD_SESSION] ({ commit, dispatch }) {
    await commit(MODE_FREEZE) // make the app not accessible

    try {
      const user = await Auth.currentAuthenticatedUser()
      const auth = await (new Promise((resolve, reject) => {
        user.getUserAttributes((err, attrs) => {
          if (err) {
            return reject(err)
          }
          const data = {}
          attrs.forEach((attr) => {
            const { Name, Value } = attr.toJSON()
            merge(data, { [Name]: Value })
          })
          resolve(data)
        })
      }))
      if (!has(auth, 'custom:user_id') && !auth.sub) {
        throw new Error('Invalid user details.')
      }
      await commit(UPDATE_LOGIN_INFORMATION, {
        id: auth['custom:user_id'] || null,
        cognito_sub: auth.sub,
      })

      // load app data
      await dispatch(LOAD_APP_DATA)

      // load user information
      await dispatch(LOAD_USER_INFORMATION)

      await commit(RESET_LOGIN_STATE)

      await commit(MODE_STALE)
    } catch (error) {
      if (error && error.code) {
        if (error.code === 'PasswordResetRequiredException') {
          await dispatch(REQUEST_SIGNOUT)
          return dispatch(SNACKBAR_ADD, {
            message: 'You are required to change your password.',
            color: COLOR_INFO,
          })
        }
      }
      return dispatch(APP_ERROR, { error })
    }
  },
  async [LOAD_APP_DATA] ({ dispatch, state }) {
    try {
      const appData = {}

      // get list of registered companies
      appData.companies = await api.get('/admin/company', { no_paging: 1 })
      appData.companies = api.parseItems(appData.companies)

      // appData.company = get(state, 'appData.company') || first(appData.companies).id
      // if (appData.company) {
      //   const exists = find(appData.companies, { id: appData.company })
      //   if (!exists) {
      //     const com = first(appData.companies)
      //     appData.company = com.id
      //     appData.companyName = com.name
      //   } else {
      //     appData.companyName = exists.name
      //   }
      // }

      // we need to look for the public company and remove it from the list
      const index = indexOf(appData.companies, find(appData.companies, { is_public: true }))
      appData.publicCompany = first(appData.companies.splice(index, 1))
      if (isEmpty(appData.publicCompany)) {
        throw new BackendException('There is no public company define.')
      }
      if (isEmpty(appData.companies)) {
        await dispatch(SNACKBAR_ADD, {
          message: 'There are no existing companies.',
          color: COLOR_WARNING,
        })
      }
      await dispatch(UPDATE_APP_DATA, appData)
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [LOAD_USER_INFORMATION] ({ dispatch, commit, state }) {
    const { user, appData } = state
    let res = null

    try {
      // get user details from the backend
      const url = user.id ? `/admin/user/${user.id}` : `/admin/user/${user.cognito_sub}/cognito`
      res = await api.get(url)
      const userData = api.parseItem(res)
      if (userData.id !== user.id && userData.cognito_sub !== user.cognito_sub) {
        throw new BackendException('Invalid user details from backend')
      }
      if (userData.cognito_sub !== user.cognito_sub) {
        throw new BackendException('Cognito user details didn\'t match what we have on our record. Please inform the superadmin.')
      }

      // save the information of the currently logged in user to api
      api.user = pick(userData, ['status', 'id', 'group', 'email', 'company_id'])

      // get user's comapany details from fetched company list
      if (userData.company_id) {
        userData.company = find(appData.companies, { id: userData.company_id })
        if (isEmpty(userData.company)) {
          throw new BackendException('User\'s company is not registered.')
        }
      }

      if (!(get(state, 'appData.company') || null)) {
        const _appData = cloneDeep(appData)
        if (userData.company_id) {
          _appData.company = userData.company_id
        } else {
          _appData.company = first(appData.companies).id
        }

        const exists = find(appData.companies, { id: _appData.company })
        if (!exists) {
          throw new AppException(`There is no company with a given id ${_appData.company}`)
        }
        _appData.companyName = exists.name
        await dispatch(UPDATE_APP_DATA, _appData)
      }

      // get user's consents
      res = await api.get(`/admin/user/${userData.id}/consent`)
      userData.consents = api.parseItems(res)

      // drawer menu list
      userData.rootMenuList = api.isSuperuser(userData.group) ? rootDrawerMenuList : []
      userData.menuList = filter(drawerMenuList, (menu) => api.hasAccess(userData.group, menu.id))

      // update user data
      await commit(UPDATE_LOGIN_INFORMATION, userData)

      if (userData.company_id) {
        // TODO: It is unnecessary to get notifications for user who isn't a reporting manager
        // get user's notification
        await dispatch(REQUEST_NOTIFICATION)
      }
    } catch (error) {
      console.dir(error)
      return dispatch(APP_ERROR, { error })
    }
  },
  async [APP_ERROR] ({ dispatch, commit }, { error }) {
    await commit(UPDATE_LAST_ERROR, error)

    if (typeof error === 'string') {
      if (error === 'No current user') {
        await dispatch(EV_SESSION_EXPIRED)
        return dispatch(SNACKBAR_ADD, {
          message: 'Session expired.',
          color: COLOR_ERROR,
        })
      }
    }

    return dispatch(SNACKBAR_ADD, {
      message: api.parseError(error),
      color: COLOR_ERROR,
    })
  },
  async [EV_CURRENT_COMPANY_MODIFIED] ({ dispatch }) {
    return dispatch(LOAD_APP_DATA)
  },
}

const mutations = {
  async [MODE_STALE] (s) {
    s.mode = MODE_STALE
    s.code = null
    s.isReady = true
  },
  async [MODE_FREEZE] (s) {
    s.mode = MODE_FREEZE
    s.code = null
    s.isReady = false
    // make page inaccessible
  },
  async [MODE_FORBIDDEN] (s, { code }) {
    s.mode = MODE_FORBIDDEN
    s.code = code
  },
  async [TOGGLE_DRAWER] (s, payload) {
    s.drawer = payload === undefined ? !s.drawer : payload
  },
  async [UPDATE_LOGIN_INFORMATION] (s, payload) {
    s.user = payload
  },
  async [UPDATE_APP_DATA] (s, payload) {
    s.appData = payload
  },
  async [UPDATE_LAST_ERROR] (s, error) {
    console.error(error)
    s.lastError = error.message
  },
  async [RESET_APP_DATA] (s) {
    merge(s, cloneDeep(moduleState))
    s.appData = cloneDeep(moduleState.appData)
    s.user = cloneDeep(moduleState.user)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
