import { cloneDeep, merge, has, get } from 'lodash'
import moment from 'moment'

import api, { AppException, formatDate } from '../../api'
import { EVENT_QUARANTINE, EVENT_RESPONSE, EVENT_SICK_DAY, EVENT_TEST, EVENT_WORK_FROM_HOME } from '../../constants'
import { APP_ERROR } from './app'
import { REQUEST_USER_INFO } from './user'

export const RESET_UE_STATE = 'RESET_UE_STATE'
export const UPDATE_UE_STATE = 'UPDATE_UE_STATE'
export const REQUEST_UE_LIST = 'REQUEST_UE_LIST'
export const REQUEST_UE_CURRENT_EVENT = 'REQUEST_UE_CURRENT_EVENT'
export const REQUEST_UE_UPDATE = 'REQUEST_UE_UPDATE'
export const REQUEST_UE_ADD_EVENT = 'REQUEST_UE_ADD_EVENT'
export const REQUEST_UE_UPDATE_EVENT = 'REQUEST_UE_UPDATE_EVENT'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  isFormAdd: false,
  isFormView: false,
  items: [],
  item: {},
  from: moment().startOf('week').valueOf(),
  to: moment().endOf('week').valueOf(),
  currentEvents: {},
}

const actions = {
  async [REQUEST_UE_CURRENT_EVENT] ({ dispatch, commit, state }, payload) {
    try {
      await commit(UPDATE_UE_STATE, { isFetching: true })
      const { id } = payload
      const res = await api.get(`/app/event/${id}`)
      const item = api.parseItem(res)
      const index = {
        [EVENT_RESPONSE]: 3,
        [EVENT_QUARANTINE]: 2,
        [EVENT_WORK_FROM_HOME]: 1,
        [EVENT_SICK_DAY]: 1,
      }
      await commit(UPDATE_UE_STATE, {
        currentEvents: {
          ...state.currentEvents,
          [item.type]: {
            ...item,
            index: index[item.type],
          },
        },
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_UE_STATE, { isFetching: false })
  },
  async [REQUEST_UE_LIST] ({ dispatch, commit, state }, payload = {}) {
    try {
      const { fromEvent = false } = payload
      if (fromEvent) {
        await dispatch(REQUEST_USER_INFO)
      }

      await commit(UPDATE_UE_STATE, { currentEvents: {} })
      const ev = get(this.state.user, 'item.current_events', {})
      await Promise.all(Object.keys(ev).map(async (i) => {
        return dispatch(REQUEST_UE_CURRENT_EVENT, { id: ev[i] })
      }))

      await commit(UPDATE_UE_STATE, { isFetching: true })
      const { from, to, currentEvents = {} } = state
      const { item: user } = this.state.user
      const res = await api.get(`/admin/events/user/${user.id}/date-range`, {
        from: moment(from).toISOString(), to: moment(to).toISOString(), no_paging: 1,
      })
      await commit(UPDATE_UE_STATE, {
        items: api.parseUserEvents(res, to, currentEvents),
      })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_UE_STATE, { isFetching: false })
  },
  async [REQUEST_UE_UPDATE_EVENT] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_UE_STATE, { isSaving: true })
      const { item } = state
      const url = {
        [EVENT_RESPONSE]: '/admin/event/response',
        [EVENT_QUARANTINE]: '/admin/event/quarantine',
        [EVENT_WORK_FROM_HOME]: '/admin/event/wfh',
        [EVENT_SICK_DAY]: '/admin/event/sickday',
        [EVENT_TEST]: '/admin/event/test',
      }
      if (!has(url, item.type)) {
        await dispatch(APP_ERROR, { error: new AppException(`Unsupported event type ${item.type}`) })
      }
      const data = cloneDeep(item);
      [
        'created_at',
        'started_at',
        'ended_at',
        'received_at',
        'date_tested',
      ].forEach((x) => {
        if (has(data, x)) data[x] = formatDate(data[x])
      })
      await api.put(`${get(url, data.type)}/${data.id}`, data)
      await commit(UPDATE_UE_STATE, { isFormAdd: false, currentEvents: {} })
      await dispatch(REQUEST_UE_LIST, { fromEvent: true })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_UE_STATE, { isSaving: false })
  },
  async [REQUEST_UE_ADD_EVENT] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_UE_STATE, { isSaving: true })
      const { item } = state
      const url = {
        [EVENT_RESPONSE]: '/admin/event/response',
        [EVENT_QUARANTINE]: '/admin/event/quarantine',
        [EVENT_WORK_FROM_HOME]: '/admin/event/wfh',
        [EVENT_SICK_DAY]: '/admin/event/sickday',
        [EVENT_TEST]: '/admin/event/test',
      }
      if (!has(url, item.type)) {
        await dispatch(APP_ERROR, { error: new AppException(`Unsupported event type ${item.type}`) })
      }
      const data = cloneDeep(item);
      [
        'created_at',
        'started_at',
        'ended_at',
        'received_at',
        'date_tested',
      ].forEach((x) => {
        if (has(data, x)) data[x] = formatDate(data[x])
      })
      await api.post(get(url, data.type), {
        ...data,
        ...(has(data, 'notify') ? { notify_user: data.notify } : {}),
        ...(has(data, 'test_result') ? { test_result: data.test_result.toLowerCase() } : {}),
      })

      await commit(UPDATE_UE_STATE, { isFormAdd: false, currentEvents: {} })
      await dispatch(REQUEST_UE_LIST, { fromEvent: true })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_UE_STATE, { isSaving: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_UE_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items)
    if (payload.item) s.item = cloneDeep(payload.item)
    if (payload.currentEvents) s.currentEvents = cloneDeep(payload.currentEvents)
  },
  async [RESET_UE_STATE] (s) {
    merge(s, cloneDeep(moduleState))
    s.items = []
    s.item = {}
    s.currentEvents = {}
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
