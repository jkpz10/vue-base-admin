import { Auth } from 'aws-amplify'
import { cloneDeep, merge } from 'lodash'
import { COLOR_INFO, COLOR_SUCCESS, COLOR_WARNING, SNACKBAR_ADD } from '..'

import api, { AppException, formatPhone } from '../../api'
import { SCENARIO_MFA_LOGIN, SCENARIO_MFA_NEW_PASSWORD, SCENARIO_MFA_RESET, SCENARIO_MFA_SIGNUP } from '../../constants'
import { APP_ERROR, RESET_APP_DATA } from './app'

export const UPDATE_LOGIN_STATE = 'UPDATE_LOGIN_STATE'
export const REQUEST_SIGNOUT = 'REQUEST_SIGNOUT'
export const REQUEST_SIGNUP = 'REQUEST_SIGNUP'
export const REQUEST_LOGIN = 'REQUEST_LOGIN'
export const REQUEST_RESET_PASSWORD = 'REQUEST_RESET_PASSWORD'
export const REQUEST_NEW_PASSWORD = 'REQUEST_NEW_PASSWORD'
export const REQUEST_MFA = 'REQUEST_MFA'
export const RESET_MFA_CODE = 'RESET_MFA_CODE'
export const RESET_LOGIN_STATE = 'RESET_LOGIN_STATE'

export const REQUEST_COMPANY_LIST = 'REQUEST_COMPANY_LIST'

export const EV_LOGIN_SUCCESSFUL = 'EV_LOGIN_SUCCESSFUL'
export const EV_SIGNUP_SUCCESSFUL = 'EV_SIGNUP_SUCCESSFUL'
export const EV_NEW_PASSWORD_REQUIRED = 'EV_NEW_PASSWORD_REQUIRED'
export const EV_RESET_SUCCESSFUL = 'EV_RESET_SUCCESSFUL'

// state
const moduleState = {
  isProcessing: false,
  isFetching: false,
  isMFA: false,
  challengeName: null,
  companies: [],
  form: {
    scenario: { as: null, mfa: null },
    hipaa: false,
    code: null,
    name: '',
    company: '',
    type: '',
    phone: '',
    username: '',
    password: '',
  },
}

const getClientMetaData = (form) => {
  const {
    username,
    company,
    type,
  } = form
  const data = {
    email: username,
  }
  if (type) {
    data.type = type
  }
  if (company) {
    data.company = company
  }
  return data
}

const getUserAttributes = (form) => {
  const {
    hipaa,
    name,
    phone,
    username,
    company,
  } = form
  const data = {
    email: username,
    phone_number: formatPhone(phone),
    'custom:hipaa': hipaa && 'agreed',
    'custom:tos': hipaa && 'agreed',
    'custom:full_name': name,
  }
  if (company) {
    data['custom:company_id'] = company
  }
  return data
}

// actions
export const actions = {
  async [EV_NEW_PASSWORD_REQUIRED] () {},
  async [EV_LOGIN_SUCCESSFUL] () {},
  async [EV_SIGNUP_SUCCESSFUL] ({ commit, state }) {
    const { form } = state
    await commit(UPDATE_LOGIN_STATE, {
      isMFA: false,
      form: {
        ...form,
        scenario: { as: null, mfa: null },
      },
    })
  },
  async [EV_RESET_SUCCESSFUL] ({ commit }) {
    await commit(UPDATE_LOGIN_STATE, { isMFA: false })
  },

  async [REQUEST_COMPANY_LIST] ({ dispatch, commit }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isFetching: true })
      const res = await api.get('/guest/companies', { no_paging: 1 })
      await commit(UPDATE_LOGIN_STATE, { companies: api.parseSelect(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_LOGIN_STATE, { isFetching: false })
  },

  async [REQUEST_SIGNOUT] ({ dispatch, commit }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isProcessing: true })
      await Auth.signOut()
      await commit(RESET_LOGIN_STATE)
      await commit(RESET_APP_DATA)
    } catch (err) {
      let error = err
      if (typeof error === 'string') {
        error = new AppException(err)
      }
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
  },
  async [REQUEST_SIGNUP] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isProcessing: true })
      const { username, password } = state.form

      const params = {
        username,
        password,
        attributes: getUserAttributes(state.form),
        clientMetadata: getClientMetaData(state.form),
      }
      await Auth.signUp(params)
      await commit(RESET_MFA_CODE)
      await commit(UPDATE_LOGIN_STATE, { isMFA: true })
    } catch (err) {
      let error = err
      if (typeof error === 'string') {
        error = new AppException(err)
      }
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
  },
  async [REQUEST_LOGIN] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isProcessing: true })
      const { username, password } = state.form

      api.user = await Auth.signIn({ username, password })
      const { challengeName } = api.user
      await commit(UPDATE_LOGIN_STATE, { challengeName })

      if (challengeName === 'NEW_PASSWORD_REQUIRED') {
        await commit(UPDATE_LOGIN_STATE, { form: merge({}, state.form, { password: '' }) })
        await dispatch(EV_NEW_PASSWORD_REQUIRED)
        await dispatch(SNACKBAR_ADD, {
          message: 'You can now change your temporary password',
          color: COLOR_SUCCESS,
        })
      } else if (['SOFTWARE_TOKEN_MFA', 'SMS_MFA'].includes(challengeName)) {
        await commit(RESET_MFA_CODE)
        await commit(UPDATE_LOGIN_STATE, { isMFA: true })
      } else {
        // support non-MFA approach
        await dispatch(EV_LOGIN_SUCCESSFUL)
        await commit(RESET_APP_DATA)
      }
    } catch (err) {
      let error = err
      if (typeof error === 'string') {
        error = new AppException(err)
      }
      if (error.code === 'UserNotConfirmedException') {
        await commit(RESET_MFA_CODE)
        await commit(UPDATE_LOGIN_STATE, { isMFA: true })
        await dispatch(SNACKBAR_ADD, {
          message: 'Your account is not yet confirmed.',
          color: COLOR_WARNING,
        })
        await Auth.resendSignUp(state.form.username)
        await dispatch(SNACKBAR_ADD, {
          message: 'Verification code sent.',
          color: COLOR_SUCCESS,
        })
        await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
      } else if (error.code === 'PasswordResetRequiredException') {
        await dispatch(SNACKBAR_ADD, {
          message: 'You are required to change your password. Click forgot password.',
          color: COLOR_INFO,
        })
      } else {
        await dispatch(APP_ERROR, { error })
      }
    }
    await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
  },
  async [REQUEST_NEW_PASSWORD] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isProcessing: true })

      if (!api.user) {
        throw new AppException('Page was refreshed.')
      }
      const { password } = state.form
      api.user = await Auth.completeNewPassword(api.user, password)
      const { challengeName } = api.user
      await commit(UPDATE_LOGIN_STATE, { challengeName })
      if (challengeName === 'SMS_MFA') {
        await commit(RESET_MFA_CODE)
        await commit(UPDATE_LOGIN_STATE, { isMFA: true })
      } else {
        // support non-MFA approach
        await dispatch(SNACKBAR_ADD, {
          message: 'You can now login',
          color: COLOR_SUCCESS,
        })
        await dispatch(EV_LOGIN_SUCCESSFUL)
      }
    } catch (err) {
      let error = err
      if (typeof error === 'string') {
        error = new AppException(err)
      }
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
  },
  async [REQUEST_RESET_PASSWORD] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isProcessing: true })
      const { username } = state.form
      await Auth.forgotPassword(username)
      await commit(RESET_MFA_CODE)
      await commit(UPDATE_LOGIN_STATE, {
        isMFA: true,
        form: {
          ...state.form,
          password: '',
        },
      })
    } catch (err) {
      let error = err
      if (typeof error === 'string') {
        error = new AppException(err)
      }
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
  },
  async [REQUEST_MFA] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_LOGIN_STATE, { isProcessing: true })
      const { username, password, code, scenario = {} } = state.form
      const { mfa } = scenario
      if ([
        SCENARIO_MFA_LOGIN,
        SCENARIO_MFA_NEW_PASSWORD,
      ].includes(mfa)) {
        if (!api.user) {
          throw new AppException('Page was refreshed.')
        }
        await Auth.confirmSignIn(api.user, code, state.challengeName)
        await dispatch(EV_LOGIN_SUCCESSFUL)
      } else if (mfa === SCENARIO_MFA_RESET) {
        await Auth.forgotPasswordSubmit(username, code, password)
        await dispatch(SNACKBAR_ADD, {
          message: 'You can now login',
          color: COLOR_SUCCESS,
        })
        await dispatch(EV_RESET_SUCCESSFUL)
      } else if (mfa === SCENARIO_MFA_SIGNUP) {
        await Auth.confirmSignUp(
          username,
          code,
          { clientMetadata: getClientMetaData(state.form) },
        )
        await dispatch(SNACKBAR_ADD, {
          message: 'You can now login',
          color: COLOR_SUCCESS,
        })
        await dispatch(EV_SIGNUP_SUCCESSFUL)
      } else {
        throw new AppException('Unrecognize MFA Flow')
      }
    } catch (err) {
      let error = err
      if (typeof error === 'string') {
        error = new AppException(err)
      }
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_LOGIN_STATE, { isProcessing: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_LOGIN_STATE] (s, payload) {
    merge(s, payload)
    if (payload.form) s.form = cloneDeep(payload.form)
  },
  async [RESET_MFA_CODE] (s) {
    s.form.code = null
  },
  async [RESET_LOGIN_STATE] (s) {
    merge(s, cloneDeep(moduleState))
    s.form = cloneDeep(moduleState.form)
    s.companies = []
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
