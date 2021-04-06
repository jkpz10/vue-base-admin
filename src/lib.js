import { Auth } from 'aws-amplify'
import moment from 'moment'
import { merge, omit, get as _get, isEmpty, startsWith, partial, isFunction, noop, isUndefined, isNull, find } from 'lodash'
import { mapState } from 'vuex'
import api from './api'
import { ROUTE_NOT_ALLOWED, ROUTE_SESSION_EXPIRED, ROUTE_SIGNIN } from './constants'
import store from './store'
import { LOAD_SESSION, EV_CHANGE_SELECTED_COMPANY, LOAD_USER_GROUPS, LOAD_USER_SELECT, LOAD_DEPARTMENT_SELECT, MODE_STALE, EV_CURRENT_COMPANY_MODIFIED } from './store/modules/app'
import { EV_LOGIN_SUCCESSFUL, EV_NEW_PASSWORD_REQUIRED, EV_RESET_SUCCESSFUL, EV_SIGNUP_SUCCESSFUL } from './store/modules/login'
import { EV_CSV_HAS_ERROR } from './store/modules/company'
import { CHECK_USER_CONSENTS, EV_REQUIRES_USER_AGREEMENT, EV_USER_AGREEMENT_RECORDED } from './store/modules/user'

export function get (target, path, defaultVal) {
  const x = _get(target, path)
  return (isUndefined(x) || isNull(x)) ? defaultVal : x
}

export function result (...params) {
  const r = get(...params)
  if (isFunction(r)) {
    return r.call(this)
  }
  return r
}

export function isCurrentPage () {
  const { routeName, $route } = this
  // console.log(`${routeName} === ${$route.name}`)
  return routeName === $route.name
}

async function onStoreAction ({ type }) {
  if (startsWith(type, 'EV')) {
    console.log(`Broadcasting: ${type}`)

    if (type === EV_CSV_HAS_ERROR) {
      await result.call(this, this, 'onCSVError')
    }

    if (type === EV_CHANGE_SELECTED_COMPANY) {
      await result.call(this, this, 'onCompanyChanged')
    }

    if (type === EV_LOGIN_SUCCESSFUL) {
      await result.call(this, this, 'onLoginSuccess')
    }

    if (type === EV_NEW_PASSWORD_REQUIRED) {
      await result.call(this, this, 'onNewPasswordRequired')
    }

    if (type === EV_RESET_SUCCESSFUL) {
      await result.call(this, this, 'onResetPasswordSuccess')
    }

    if (type === EV_SIGNUP_SUCCESSFUL) {
      await result.call(this, this, 'onSignUpSuccess')
    }

    if (type === EV_CURRENT_COMPANY_MODIFIED) {
      await result.call(this, this, 'onSelectedCompanyModified')
    }

    if (type === EV_REQUIRES_USER_AGREEMENT) {
      await result.call(this, this, 'onUserRequiresToAgree')
    }
    if (type === EV_USER_AGREEMENT_RECORDED) {
      await result.call(this, this, 'onRecordAgreementSuccess')
    }
  }
}

function commonProps (name) {
  let res = {}

  // form props
  if ([
    'AddCompanyForm',
    'EditUserForm',
    'EditUserFields',
    'Question',
    'EditCompanyForm',
    'EditContactForm',
    'AddEditFacilityForm',
    'AddEditDepartmentForm',
    'AddEditUserFieldForm',
    'LineItem',
    'LineForm',
    'LoginForm',
    'MfaForm',
    'NewPasswordForm',
    'ResetPasswordForm',
    'SignUpForm',
    'SignUpFromLinkForm',
    'SignUpVisitorForm',
    'QuestionaireForm',
    'ResultFailed',
    'ResultPassed',
    'LineView',
    'EnterFacilityForm',
    'AddEditScannerForm',
    'NotificationTable',
    'HipaaForm',
  ].includes(name)) {
    res = {
      ...res,
      isSaving: {
        type: Boolean,
        default: false,
      },
      isAddMode: {
        type: Boolean,
        default: false,
      },
      isEditMode: {
        type: Boolean,
        default: false,
      },
      info: {
        type: Object,
        default: () => ({}),
      },
      doSave: {
        type: Function,
        default: () => ({}),
      },
      doCallAction: {
        type: Function,
        default: () => ({}),
      },
      doCancel: {
        type: Function,
        default: () => ({}),
      },
      doUpdateData: {
        type: Function,
        default: () => ({}),
      },
    }
  }

  if ([
    'EditContactForm',
  ].includes(name)) {
    res = {
      ...res,
      departments: {
        type: Array,
        default: () => ([]),
      },
    }
  }

  if ([
    'EnterFacilityForm',
    'AddEditScannerForm',
  ].includes(name)) {
    res = {
      ...res,
      facilities: {
        type: Array,
        default: [],
      },
    }
  }
  return res
}

function commonComputed (name) {
  let res = {}

  // departments
  if ([
    'EditContactForm',
  ].includes(name)) {
    res = {
      ...res,
      department: {
        get () {
          const { departments, info: { department } } = this
          return (find(departments, { id: department }) || {}).name || department
        },
        async set (v) {
          return this.doUpdateData(v.id, 'department')
        },
      },
    }
  }

  if ([
    'Company',
    'Facility',
  ].includes(name)) {
    res = {
      ...res,
      ...mapState({
        departments: (state) => {
          return (state.app.appData.departments || []).map((x) => ({
            ...x,
            value: x.id,
            text: x.name,
          }))
        },
      }),
    }
  }

  // company name
  if ([
    'Users',
    'Company',
    'Entry',
    'Facility',
    'Department',
    'AddMultipleUser',
    'Notifications',
  ].includes(name)) {
    res = {
      ...res,
      ...mapState({
        companyName: (state) => state.app.appData.companyName,
        companyId: (state) => state.app.appData.company,
      }),
    }
  }

  // status switch
  if ([
    'AddCompanyForm',
    'EditCompanyForm',
    'EditUserForm',
    'AddEditUserFieldForm',
  ].includes(name)) {
    res = {
      ...res,
      status: {
        get () {
          const { status } = this.info
          return status === 'active'
        },
        async set (v) {
          const value = v ? 'active' : 'inactive'
          return this.doUpdateData(value, 'status')
        },
      },
      statusText () {
        return this.info.status || 'inactive'
      },
    }
  }

  // groups
  if ([
    'EditUserForm',
  ].includes(name)) {
    res = {
      ...res,
      ...mapState({
        groups (state) {
          return get(state, 'app.appData.groups', []).filter((i) => {
            if (!this.info.company_id) {
              return !(startsWith(i.id, 'company_') || startsWith(i.id, 'department_'))
            }
            return true
          })
        },
      }),
    }
  }

  // companies
  if ([
    'EditUserForm',
  ].includes(name)) {
    res = {
      ...res,
      ...mapState({
        companies (state) {
          return [{ id: 'none', name: 'None' }].concat(get(state, 'app.appData.companies', []))
        },
      }),
    }
  }

  // birthdate
  if ([
    'EditUserForm',
  ].includes(name)) {
    res = {
      ...res,
      birth_date () {
        const { birthdate } = this.info
        return moment(birthdate).isValid() ? moment(birthdate).format('YYYY/MM/DD') : null
      },
    }
  }

  // paging
  if ([
    'Users',
    'AllUsers',
    'Companies',
    'Facility',
    'Entry',
    'NotificationTable',
  ].includes(name)) {
    res = {
      ...res,
      footerProps () {
        return {
          itemsPerPageOptions: [5, 10, 50, 100],
        }
      },
    }
  }

  // facility select
  if ([
    'EnterFacilityForm',
    'AddEditScannerForm',
  ].includes(name)) {
    res = {
      ...res,
      facility: {
        get () {
          const { facilities, info: { facility_id: id } } = this
          return (find(facilities, { id }) || {}).name || id
        },
        async set (v) {
          return this.doUpdateData(v.id, 'facility_id')
        },
      },
    }
  }

  return res
}

export async function pageOnReady () {
  const { pageName } = this
  const { dispatch } = this.$store
  if (this.isCurrentPage()) {
    if ([
      'Dashboard',
      'Company',
    ].includes(pageName)) {
      await dispatch(LOAD_DEPARTMENT_SELECT)
    }

    if ([
      'Company',
    ].includes(pageName)) {
      await dispatch(LOAD_USER_SELECT)
    }

    if ([
      'User',
    ].includes(pageName)) {
      await dispatch(LOAD_USER_GROUPS)
    }

    if ([
      'MyAccount',
      'Dashboard',
      'Survey',
    ].includes(pageName)) {
      const { app } = this.$store.state
      await dispatch(CHECK_USER_CONSENTS, { user: app.user })
    }
  }
}

export function initComponent (name = 'NoName', def = {}) {
  def.name = name

  const nonMergeable = [
    'data',
    'computed',
    'isPage',
    // lifecycle event
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'activated',
    'deactivated',
    'beforeDestroy',
    'destroyed',
    'errorCaptured',
  ]
  const { isPage = false } = def

  const opts = merge(omit(def, nonMergeable), {
    name,
    props: {
      ...(isPage ? { routeName: { type: String, default: 'xxx' } } : {}),
      ...commonProps.call(def, name),
    },
    methods: {
      ...(isPage ? { isCurrentPage } : {}),
    },
  })

  if (isPage) {
    opts.beforeRouteEnter = async function (to, from, next) {
      // authentication
      const { auth } = to.meta
      if (auth) {
        try {
          const currentSession = await Auth.currentSession()
          console.log(`Session is valid: ${currentSession.isValid().toString()}`)

          api.authToken = get(currentSession, 'idToken.jwtToken')
          if (isEmpty(api.authToken)) {
            console.log('session expired')
            return next({ name: ROUTE_SESSION_EXPIRED })
          }
        } catch (error) {
          console.dir(error)
          return next({ name: ROUTE_SIGNIN })
        }
      }

      // with session
      const { withSession } = to.meta
      if (withSession) {
        if (!window.__isLoaded) {
          await store.dispatch(LOAD_SESSION)
          window.__isLoaded = true
        }

        // must have access
        const group = get(store.state, 'app.user.group')
        if (!group) {
          console.log('user doesn\'t belong to a group.')
          return next({ name: ROUTE_NOT_ALLOWED })
        }
        const { name: page } = to
        if (!api.hasAccess(group, page)) {
          console.log(`no access ${page}`)
          return next({ name: ROUTE_NOT_ALLOWED })
        }
      } else {
        await store.commit(MODE_STALE)
      }

      return next()
    }
  }

  // data
  opts.data = function (d = {}) {
    const { isPage, name } = d
    return {
      ...(isPage ? {
        pageName: name,
      } : {}),
      name,
      isPage,
      subscriptions: [],
      ...api.routes,
      ...result.call(this, d, 'data', {}),
    }
  }
  opts.data = partial(opts.data, def)

  // computed
  opts.computed = {
    ...result(def, 'computed', {}),
    ...commonComputed.call(def, name),
  }

  // beforeCreate
  opts.beforeCreate = async function () {
    // console.dir(`beforeCreate ${name}[${isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'beforeCreate', noop)
  }
  // created
  opts.created = async function () {
    // console.dir(`created ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'created', noop)
  }
  // beforeMount
  opts.beforeMount = async function () {
    // console.dir(`beforeMount ${this.name}[${this.isPage}]`)
    if (this.isPage) {
      if (!this._onReady) {
        this._onReady = this.onReady || noop
        this.onReady = async function () {
          await this._onReady()
          await pageOnReady.call(this)
        }
      }
    }
    await result.call(this, def, 'beforeMount', noop)
  }
  // mounted
  opts.mounted = async function () {
    console.dir(`mounted ${this.name}[${this.isPage}]`)

    const { $store } = this
    this.subscriptions.push($store.subscribeAction(onStoreAction.bind(this)))

    if (this.isPage) {
      const { meta } = this.$route
      if (!window.__isLoaded && meta.auth === true) return
      if (!this.isCurrentPage()) return

      await this.onReady()
      await result.call(this, def, 'mounted', noop)
    } else {
      await result.call(this, def, 'mounted', noop)
    }
  }
  // beforeUpdate
  opts.beforeUpdate = async function () {
    // console.dir(`beforeUpdate ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'beforeUpdate', noop)
  }
  // updated
  opts.updated = async function () {
    // console.dir(`updated ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'updated', noop)
  }
  // activated
  opts.activated = async function () {
    // console.dir(`activated ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'activated', noop)
  }
  // deactivated
  opts.deactivated = async function () {
    // console.dir(`deactivated ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'deactivated', noop)
  }
  // beforeDestroy
  opts.beforeDestroy = async function () {
    console.dir(`beforeDestroy ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    this.subscriptions.forEach(s => s())
    await result.call(this, def, 'beforeDestroy', noop)
  }
  // destroyed
  opts.destroyed = async function () {
    // console.dir(`destroyed ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'destroyed', noop)
  }
  // errorCaptured
  opts.errorCaptured = async function () {
    // console.dir(`errorCaptured ${this.name}[${this.isPage}]`)
    if (this.isPage) {}
    await result.call(this, def, 'errorCaptured', noop)
  }

  return opts
}
