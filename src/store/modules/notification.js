import moment from 'moment'
import { find, cloneDeep, merge, pick } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'
import { defaultPaging, updatePaging } from '..'
import { EVENT_CAPTURE_WORK, EVENT_CAPTURE_PUBLIC, READINESS_FAILED, EVENT_SEND, EVENT_RESPONSE, EVENT_QUARANTINE, EVENT_WORK_FROM_HOME, EVENT_SICK_DAY } from '../../constants'

export const RESET_NOTIFICATION_STATE = 'RESET_NOTIFICATION_STATE'

export const UPDATE_NOTIFICATION_STATE = 'UPDATE_NOTIFICATION_STATE'
export const REQUEST_NOTIFICATION_FAILED_READINESS = 'REQUEST_NOTIFICATION_FAILED_READINESS'
export const REQUEST_NOTIFICATION_ENTRY = 'REQUEST_NOTIFICATION_ENTRY'
export const REQUEST_NOTIFICATION_RESPONSE = 'REQUEST_NOTIFICATION_RESPONSE'
export const REQUEST_NOTIFICATION_QUARANTINE = 'REQUEST_NOTIFICATION_QUARANTINE'
export const REQUEST_NOTIFICATION_WFH = 'REQUEST_NOTIFICATION_WFH'
export const REQUEST_NOTIFICATION_SICKDAY = 'REQUEST_NOTIFICATION_SICKDAY'

export const REQUEST_NOTIFICATION_READ = 'REQUEST_NOTIFICATION_READ'

export const INSTANCE_KEY_FAILED_READINESS = 'failedReadiness'
export const INSTANCE_KEY_ENTRY = 'entry'
export const INSTANCE_KEY_RESPONSE = 'response'
export const INSTANCE_KEY_QUARANTINE = 'quarantine'
export const INSTANCE_KEY_WFH = 'wfh'
export const INSTANCE_KEY_SICKDAY = 'sickday'

// state
const instances = [
  INSTANCE_KEY_FAILED_READINESS,
  INSTANCE_KEY_ENTRY,
  INSTANCE_KEY_RESPONSE,
  INSTANCE_KEY_QUARANTINE,
  INSTANCE_KEY_WFH,
  INSTANCE_KEY_SICKDAY,
]
const moduleState = {
  company: null,
  instances,
  item: {},
  isSaving: false,
  from: moment().startOf('day').toISOString(),
  to: moment().endOf('day').toISOString(),
  rangeMode: 'today',
}
instances.forEach((x) => {
  moduleState[x] = {
    key: x,
    items: [],
    item: {},
    isEditMode: false,
    isFetching: false,
    paging: defaultPaging(),
  }
})

// action
export const actions = {
  async [REQUEST_NOTIFICATION_READ] ({ commit, dispatch, state }) {
    const { item } = state
    const { user } = this.state.app
    try {
      // update the read_by on listing
      const instanceFn = (update = {}) => {
        return merge({}, cloneDeep(state[key]), update)
      }
      const { key } = item
      const items = state[key].items.map((x) => cloneDeep(x))
      const exists = find(items, { id: item.id })
      if (exists) {
        if (!find(exists.read_by, { user_id: user.id })) {
          await commit(UPDATE_NOTIFICATION_STATE, { isSaving: true })
          await api.put(`/admin/event/${item.id}/read`, { user_id: user.id })

          exists.read_by.push({ user_id: user.id })
          await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ items }) })
        }
      }
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { isSaving: false })
  },
  async [REQUEST_NOTIFICATION_FAILED_READINESS] ({ commit, dispatch, state }) {
    const { company } = state
    const key = INSTANCE_KEY_FAILED_READINESS
    const instanceFn = (update = {}) => {
      return merge({}, cloneDeep(state[key]), update)
    }
    try {
      await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: true }) })
      const { from, to } = state
      const { paging } = instanceFn()
      const res = await api.get(`/admin/events/${company}/date-range`, {
        ...api.parseListingPayload(paging),
        readiness_status: READINESS_FAILED,
        from,
        to,
        types: [
          EVENT_CAPTURE_WORK,
          EVENT_CAPTURE_PUBLIC,
        ].join(','),
      })
      await commit(UPDATE_NOTIFICATION_STATE, {
        [key]: instanceFn({
          items: api.parseEvents(res).map(x => ({ ...x, key })),
          paging: updatePaging(api.parsePagination(res)),
        }),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: false }) })
  },
  async [REQUEST_NOTIFICATION_ENTRY] ({ commit, dispatch, state }) {
    const { company } = state
    const key = INSTANCE_KEY_ENTRY
    const instanceFn = (update = {}) => {
      return merge({}, cloneDeep(state[key]), update)
    }
    try {
      await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: true }) })
      const { from, to } = state

      const { paging } = instanceFn()
      const res = await api.get(`/admin/events/${company}/date-range`, {
        ...api.parseListingPayload(paging),
        from,
        to,
        types: [
          EVENT_SEND,
        ].join(','),
      })
      await commit(UPDATE_NOTIFICATION_STATE, {
        [key]: instanceFn({
          items: api.parseEvents(res).map(x => ({ ...x, key })),
          paging: updatePaging(api.parsePagination(res)),
        }),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: false }) })
  },
  async [REQUEST_NOTIFICATION_RESPONSE] ({ commit, dispatch, state }) {
    const { company } = state
    const key = INSTANCE_KEY_RESPONSE
    const instanceFn = (update = {}) => {
      return merge({}, cloneDeep(state[key]), update)
    }
    try {
      await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: true }) })
      const { from, to } = state

      const { paging } = instanceFn()
      const res = await api.get(`/admin/events/${company}/date-range`, {
        ...api.parseListingPayload(paging),
        from,
        to,
        types: [
          EVENT_RESPONSE,
        ].join(','),
      })
      await commit(UPDATE_NOTIFICATION_STATE, {
        [key]: instanceFn({
          items: api.parseEvents(res).map(x => ({ ...x, key })),
          paging: updatePaging(api.parsePagination(res)),
        }),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: false }) })
  },
  async [REQUEST_NOTIFICATION_QUARANTINE] ({ commit, dispatch, state }) {
    const { company } = state
    const key = INSTANCE_KEY_QUARANTINE
    const instanceFn = (update = {}) => {
      return merge({}, cloneDeep(state[key]), update)
    }
    try {
      await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: true }) })
      const { from, to } = state

      const { paging } = instanceFn()
      const res = await api.get(`/admin/events/${company}/date-range`, {
        ...api.parseListingPayload(paging),
        from,
        to,
        types: [
          EVENT_QUARANTINE,
        ].join(','),
      })
      await commit(UPDATE_NOTIFICATION_STATE, {
        [key]: instanceFn({
          items: api.parseEvents(res).map(x => ({ ...x, key })),
          paging: updatePaging(api.parsePagination(res)),
        }),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: false }) })
  },
  async [REQUEST_NOTIFICATION_WFH] ({ commit, dispatch, state }) {
    const { company } = state
    const key = INSTANCE_KEY_WFH
    const instanceFn = (update = {}) => {
      return merge({}, cloneDeep(state[key]), update)
    }
    try {
      await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: true }) })
      const { from, to } = state

      const { paging } = instanceFn()
      const res = await api.get(`/admin/events/${company}/date-range`, {
        ...api.parseListingPayload(paging),
        from,
        to,
        types: [
          EVENT_WORK_FROM_HOME,
        ].join(','),
      })
      await commit(UPDATE_NOTIFICATION_STATE, {
        [key]: instanceFn({
          items: api.parseEvents(res).map(x => ({ ...x, key })),
          paging: updatePaging(api.parsePagination(res)),
        }),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: false }) })
  },
  async [REQUEST_NOTIFICATION_SICKDAY] ({ commit, dispatch, state }) {
    const { company } = state
    const key = INSTANCE_KEY_SICKDAY
    const instanceFn = (update = {}) => {
      return merge({}, cloneDeep(state[key]), update)
    }
    try {
      await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: true }) })
      const { from, to } = state

      const { paging } = instanceFn()
      const res = await api.get(`/admin/events/${company}/date-range`, {
        ...api.parseListingPayload(paging),
        from,
        to,
        types: [
          EVENT_SICK_DAY,
        ].join(','),
      })
      await commit(UPDATE_NOTIFICATION_STATE, {
        [key]: instanceFn({
          items: api.parseEvents(res).map(x => ({ ...x, key })),
          paging: updatePaging(api.parsePagination(res)),
        }),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_NOTIFICATION_STATE, { [key]: instanceFn({ isFetching: false }) })
  },
}

// mutations
const mutations = {
  async [UPDATE_NOTIFICATION_STATE] (s, payload) {
    merge(s, cloneDeep(pick(payload, 'company,isSaving,from,to,rangeMode'.split(','))))
    if (payload.item) s.item = cloneDeep(payload.item)
    instances.forEach(key => {
      if (payload[key]) {
        merge(s[key], payload[key])
        if (payload[key].items) s[key].items = [].concat(payload[key].items || [])
      }
    })
  },
  async [RESET_NOTIFICATION_STATE] (s) {
    merge(s, cloneDeep(moduleState))
    s.item = {}
    instances.forEach(key => {
      s[key].items = []
      s[key].paging = defaultPaging()
    })
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
