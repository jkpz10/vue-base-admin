import moment from 'moment'
import { filter, cloneDeep, merge, get, set } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'

export const UPDATE_DASHBOARD_DATA = 'UPDATE_DASHBOARD_DATA'
export const REQUEST_DASHBOARD_STATS = 'REQUEST_DASHBOARD_STATS'

// state
const moduleState = {
  isFetching: false,
  department: null,
  from: moment().startOf('day').toISOString(),
  to: moment().endOf('day').toISOString(),
  rangeMode: 'today',
  range: { passed: [], failed: [] },
}

const getEntriesByDepartment = (department = null, entries = []) => {
  let _entries = [].concat(entries)
  if (department) {
    _entries = filter(_entries, { user_department: department })
  }
  return _entries
}

// actions
export const actions = {
  async [REQUEST_DASHBOARD_STATS] ({ dispatch, commit, state }) {
    try {
      await commit(UPDATE_DASHBOARD_DATA, { isFetching: true })
      const { from, to, department } = state
      let mFrom = moment(from)
      const mTo = moment(to)
      const dateFormat = 'YYYY-MM-DD'

      const dates = {}
      while (mTo.isAfter(mFrom)) {
        dates[mFrom.format(dateFormat)] = 0
        mFrom = mFrom.add(1, 'days')
      }

      const data = {
        passed: cloneDeep(dates),
        failed: cloneDeep(dates),
      }

      const { company } = this.state.app.appData
      const res = await api.get(`/admin/event/${company}/entry/date-range`, {
        from, to, no_paging: 1,
      })

      getEntriesByDepartment(department, api.parseItems(res))
        .forEach(({ readiness_approved: approved, created_at: at }) => {
          const path = `${approved ? 'passed' : 'failed'}.${moment.utc(at).format(dateFormat)}`
          set(data, path, get(data, path, 0) + 1)
        })
      await commit(UPDATE_DASHBOARD_DATA, { range: data })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_DASHBOARD_DATA, { isFetching: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_DASHBOARD_DATA] (s, payload) {
    merge(s, payload)
    if (payload.range) s.range = cloneDeep(payload.range)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
