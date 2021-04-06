import { kebabCase, startCase, get } from 'lodash'
import Vue from 'vue'
import Router from 'vue-router'
import store, { RESTORE_MUTATION } from './store/index'
import {
  ROUTE_ALLUSERS,
  ROUTE_BILLING,
  ROUTE_COMPANIES,
  ROUTE_COMPANY,
  ROUTE_DASHBOARD,
  ROUTE_ENTRY_LIST,
  ROUTE_ENTRY_SCAN,
  ROUTE_MYACCOUNT,
  ROUTE_NOTIFICATIONS,
  ROUTE_PUBLIC_READINESS,
  ROUTE_REPORTING,
  ROUTE_SIGNUP_VISITOR,
  ROUTE_SIGNUP_LINK,
  ROUTE_SIGNIN_CONFIRM,
  ROUTE_USER_AGREEMENT,
  ROUTE_NEW_PASSWORD,
  ROUTE_RESET_PASSWORD,
  ROUTE_SIGNIN,
  ROUTE_SIGNOUT,
  ROUTE_SIGNUP,
  ROUTE_USERS,
  ROUTE_USER,
  ROUTE_VERIFIED_WORKFORCE,
  ROUTE_WORKPLACE_READINESS,
  ROUTE_SURVEY_FORM,
  ROUTE_NOT_ALLOWED,
  ROUTE_SESSION_EXPIRED,
  ROUTE_DEBUG,
  ROUTE_TOS,
  ROUTE_PRIVATEPOLICY,
} from './constants'
import { REQUEST_SIGNOUT } from './store/modules/login'

Vue.use(Router)

export const toUrl = (path) => `/${kebabCase(path).toLowerCase()}`

export const rootDrawerMenuList = [
  {
    icon: 'mdi-account-group',
    id: ROUTE_ALLUSERS,
    title: startCase(ROUTE_ALLUSERS),
    to: toUrl(ROUTE_ALLUSERS),
  },
  {
    icon: 'mdi-view-list',
    id: ROUTE_COMPANIES,
    title: 'Manage Companies',
    to: toUrl(ROUTE_COMPANIES),
  },
  {
    icon: 'mdi-bookmark-check',
    id: ROUTE_PUBLIC_READINESS,
    title: startCase(ROUTE_PUBLIC_READINESS),
    to: toUrl(ROUTE_PUBLIC_READINESS),
  },
]

export const drawerMenuList = [
  {
    icon: 'mdi-view-dashboard',
    id: ROUTE_DASHBOARD,
    title: startCase(ROUTE_DASHBOARD),
    to: toUrl(ROUTE_DASHBOARD),
  },
  {
    icon: 'mdi-account-multiple',
    id: ROUTE_USERS,
    title: startCase(ROUTE_USERS),
    to: toUrl(ROUTE_USERS),
  },
  {
    icon: 'mdi-view-list',
    id: ROUTE_COMPANY,
    title: 'Company',
    to: toUrl(ROUTE_COMPANY),
  },
  // {
  //   icon: 'mdi-currency-usd',
  //   id: ROUTE_BILLING,
  //   title: startCase(ROUTE_BILLING),
  //   to: toUrl(ROUTE_BILLING),
  // },
  {
    icon: 'mdi-bookmark-check',
    id: ROUTE_WORKPLACE_READINESS,
    title: startCase(ROUTE_WORKPLACE_READINESS),
    to: toUrl(ROUTE_WORKPLACE_READINESS),
  },
  // {
  //   icon: 'mdi-chart-bar',
  //   id: ROUTE_REPORTING,
  //   title: startCase(ROUTE_REPORTING),
  //   to: toUrl(ROUTE_REPORTING),
  // },
  {
    icon: 'mdi-book-open-variant',
    id: ROUTE_ENTRY_LIST,
    title: startCase(ROUTE_ENTRY_LIST),
    to: toUrl(ROUTE_ENTRY_LIST),
  },
  {
    icon: 'mdi-login-variant',
    id: ROUTE_ENTRY_SCAN,
    title: startCase(ROUTE_ENTRY_SCAN),
    to: toUrl(ROUTE_ENTRY_SCAN),
  },
  // {
  //   icon: 'mdi-checkbox-marked-circle',
  //   id: ROUTE_VERIFIED_WORKFORCE,
  //   title: startCase(ROUTE_VERIFIED_WORKFORCE),
  //   to: toUrl(ROUTE_VERIFIED_WORKFORCE),
  // },
  {
    icon: 'mdi-bell',
    id: ROUTE_NOTIFICATIONS,
    title: startCase(ROUTE_NOTIFICATIONS),
    to: toUrl(ROUTE_NOTIFICATIONS),
  },
]

const routes = [
  {
    path: '/user',
    component: () => import('@/views/dashboard/Index'),
    children: [
      {
        path: '',
        redirect: { name: ROUTE_USERS },
      },
      {
        path: toUrl(ROUTE_USERS),
        name: ROUTE_USERS,
        component: () => import('@/views/users/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_USERS,
        },
      },
      {
        path: `${toUrl(ROUTE_USER)}/:id`,
        name: ROUTE_USER,
        component: () => import('@/views/users/User'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_USER,
        },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/views/dashboard/Index'),
    children: [
      {
        path: '',
        redirect: { name: ROUTE_MYACCOUNT },
      },
      {
        path: toUrl(ROUTE_DASHBOARD),
        name: ROUTE_DASHBOARD,
        component: () => import('@/views/dashboard/Dashboard'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_DASHBOARD,
        },
      },
      {
        path: toUrl(ROUTE_COMPANY),
        name: ROUTE_COMPANY,
        component: () => import('@/views/company/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_COMPANY,
        },
      },
      {
        path: toUrl(ROUTE_BILLING),
        name: ROUTE_BILLING,
        component: () => import('@/views/billing/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_BILLING,
        },
      },
      {
        path: toUrl(ROUTE_WORKPLACE_READINESS),
        name: ROUTE_WORKPLACE_READINESS,
        component: () => import('@/views/publicreadiness/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_WORKPLACE_READINESS,
          public: false,
        },
      },
      {
        path: toUrl(ROUTE_REPORTING),
        name: ROUTE_REPORTING,
        component: () => import('@/views/reporting/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_REPORTING,
        },
      },
      {
        path: toUrl(ROUTE_ENTRY_LIST),
        name: ROUTE_ENTRY_LIST,
        component: () => import('@/views/entrylist/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_ENTRY_LIST,
        },
      },
      {
        path: toUrl(ROUTE_NOTIFICATIONS),
        name: ROUTE_NOTIFICATIONS,
        component: () => import('@/views/notifications/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_NOTIFICATIONS,
        },
      },
      {
        path: toUrl(ROUTE_MYACCOUNT),
        name: ROUTE_MYACCOUNT,
        component: () => import('@/views/myaccount/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_MYACCOUNT,
        },
      },
      {
        path: toUrl(ROUTE_COMPANIES),
        name: ROUTE_COMPANIES,
        component: () => import('@/views/companies/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_COMPANIES,
        },
      },
      {
        path: toUrl(ROUTE_ALLUSERS),
        name: ROUTE_ALLUSERS,
        component: () => import('@/views/allusers/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_ALLUSERS,
        },
      },
      {
        path: toUrl(ROUTE_PUBLIC_READINESS),
        name: ROUTE_PUBLIC_READINESS,
        component: () => import('@/views/publicreadiness/Index'),
        meta: {
          withSession: true,
          auth: true,
        },
        props: {
          routeName: ROUTE_PUBLIC_READINESS,
          public: true,
        },
      },
    ],
  },
  {
    path: `${toUrl(ROUTE_SURVEY_FORM)}/:company/:facility`,
    name: ROUTE_SURVEY_FORM,
    component: () => import('@/views/survey/Index'),
    meta: {
      withSession: true,
      auth: false,
    },
    props: {
      routeName: ROUTE_SURVEY_FORM,
    },
  },
  {
    path: toUrl(ROUTE_ENTRY_SCAN),
    name: ROUTE_ENTRY_SCAN,
    meta: {
      withSession: true,
      auth: true,
    },
    component: () => import('@/views/entryscan/Index'),
    props: {
      routeName: ROUTE_ENTRY_SCAN,
    },
  },
  {
    path: toUrl(ROUTE_VERIFIED_WORKFORCE),
    name: ROUTE_VERIFIED_WORKFORCE,
    component: () => import('@/views/verifiedworkforce/Index'),
    meta: {
      withSession: true,
      auth: true,
    },
    props: {
      routeName: ROUTE_VERIFIED_WORKFORCE,
    },
  },
  {
    path: `${toUrl(ROUTE_USER_AGREEMENT)}`,
    name: ROUTE_USER_AGREEMENT,
    component: () => import('@/views/agreement/UserAgreement'),
    meta: {
      auth: true,
      withSession: true,
    },
    props: {
      routeName: ROUTE_USER_AGREEMENT,
    },
  },
]

const routeAuths = [
  {
    path: toUrl(ROUTE_RESET_PASSWORD),
    name: ROUTE_RESET_PASSWORD,
    component: () => import('@/views/login/Reset'),
    meta: {
      auth: false,
    },
    props: {
      routeName: ROUTE_RESET_PASSWORD,
    },
  },
  {
    path: `${toUrl(ROUTE_SIGNIN_CONFIRM)}/:email/:password`,
    name: ROUTE_SIGNIN_CONFIRM,
    component: () => import('@/views/login/Confirm'),
    meta: {
      auth: false,
    },
    props: {
      routeName: ROUTE_SIGNIN_CONFIRM,
    },
  },
  {
    path: `${toUrl(ROUTE_SIGNUP_LINK)}/:company/:email/:type`,
    name: ROUTE_SIGNUP_LINK,
    component: () => import('@/views/login/Link'),
    meta: {
      auth: false,
    },
    props: {
      routeName: ROUTE_SIGNUP_LINK,
    },
  },
  {
    path: `${toUrl(ROUTE_SIGNUP_VISITOR)}/:company?`,
    name: ROUTE_SIGNUP_VISITOR,
    component: () => import('@/views/login/Visitor'),
    meta: {
      auth: false,
    },
    props: {
      routeName: ROUTE_SIGNUP_VISITOR,
    },
  },
  {
    path: toUrl(ROUTE_SIGNIN),
    name: ROUTE_SIGNIN,
    component: () => import('@/views/login/Login'),
    meta: {
      auth: false,
    },
    props: {
      routeName: ROUTE_SIGNIN,
    },
  },
  {
    path: toUrl(ROUTE_NEW_PASSWORD),
    name: ROUTE_NEW_PASSWORD,
    component: () => import('@/views/login/NewPassword'),
    meta: {
      auth: false,
    },
    props: {
      routeName: ROUTE_NEW_PASSWORD,
    },
  },
  {
    path: toUrl(ROUTE_SIGNUP),
    alias: '/signup',
    name: ROUTE_SIGNUP,
    component: () => import('@/views/login/Register'),
    meta: {
      auth: false,
    },
    props: {
      isSignUp: true,
      routeName: ROUTE_SIGNUP,
    },
  },
  {
    path: toUrl(ROUTE_SIGNOUT),
    name: ROUTE_SIGNOUT,
    alias: '/signout',
    redirect: () => {
      store.dispatch(REQUEST_SIGNOUT)
      return { name: ROUTE_SIGNIN }
    },
    meta: {
      auth: false,
    },
  },
]

const mapping = {
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [].concat(routes).concat(routeAuths).concat([
    {
      path: toUrl(ROUTE_SESSION_EXPIRED),
      name: ROUTE_SESSION_EXPIRED,
      component: () => import('@/views/misc/SessionExpired'),
      meta: {
        auth: false,
      },
    },
    {
      path: toUrl(ROUTE_NOT_ALLOWED),
      name: ROUTE_NOT_ALLOWED,
      component: () => import('@/views/misc/NotAllowed'),
      meta: {
        auth: false,
      },
    },
    {
      path: toUrl(ROUTE_TOS),
      name: ROUTE_TOS,
      component: () => import('@/views/misc/TermsOfService'),
      meta: {
        auth: false,
      },
    },
    {
      path: toUrl(ROUTE_PRIVATEPOLICY),
      name: ROUTE_PRIVATEPOLICY,
      component: () => import('@/views/misc/PrivatePolicy'),
      meta: {
        auth: false,
      },
    },
    {
      path: toUrl(ROUTE_DEBUG),
      name: ROUTE_DEBUG,
      component: () => import('@/views/misc/Debug'),
      meta: {
        auth: false,
      },
    },
    {
      path: '*',
      component: () => import('@/views/misc/NotFound'),
    },
  ]),
}

const router = new Router(mapping)
router.beforeEach(async (to, from, next) => {
  if (get(store.state, 'app.isRestored', false) === false) {
    await store.restored
    await store.commit(RESTORE_MUTATION)
  }
  return next()
})

export default router
