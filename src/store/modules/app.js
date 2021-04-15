

// import { rootDrawerMenuList, drawerMenuList } from '@/router'
// import { filter, cloneDeep, find, first, get, has, indexOf, isEmpty, merge, pick } from 'lodash'
import { cloneDeep } from 'lodash'


// constants
export const APP_ERROR = 'APP_ERROR'
export const TOGGLE_DRAWER = 'TOGGLE_DRAWER'
export const TOGGLE_MINI = 'TOGGLE_MINI'


// state
const moduleState = {
  drawer: true,
  mini: false,
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

// action

const actions = {
  
}

const mutations = {
  async [TOGGLE_DRAWER] (s, payload) {
    s.drawer = payload === undefined ? !s.drawer : payload
  },
  async [TOGGLE_MINI] (s, payload) {
    s.mini = payload === undefined ? !s.mini : payload
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}