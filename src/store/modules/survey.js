import { cloneDeep, merge } from 'lodash'
import api from '../../api'
import { APP_ERROR } from './app'

export const REQUEST_SURVEY_COMPANY_INFO = 'REQUEST_SURVEY_COMPANY_INFO'
export const UPDATE_SURVEY_STATE = 'UPDATE_SURVEY_STATE'
export const REQUEST_SURVEY_LIST = 'REQUEST_SURVEY_LIST'
export const REQUEST_SEND_ANSWERS = 'REQUEST_SEND_ANSWERS'
export const RESET_SURVEY_STATE = 'RESET_SURVEY_STATE'

// state
const moduleState = {
  isFetching: false,
  isSaving: false,
  items: [],
  answers: [],
  company: {},
  contact: {},
  passOrFail: 0,
  result: {},
}

export const actions = {
  async [REQUEST_SURVEY_COMPANY_INFO] ({ commit, dispatch }, payload) {
    await commit(UPDATE_SURVEY_STATE, { isFetching: true })
    try {
      const { company } = payload
      let res = await api.get(`/admin/company/${company}`)
      await commit(UPDATE_SURVEY_STATE, { company: api.parseItem(res) })
      res = await api.get(`/admin/company/${company}/main-contact`)
      await commit(UPDATE_SURVEY_STATE, { contact: api.parseItem(res) })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SURVEY_STATE, { isFetching: false })
  },
  async [REQUEST_SURVEY_LIST] ({ commit, dispatch }, payload) {
    try {
      await commit(UPDATE_SURVEY_STATE, { isFetching: true, items: [], answers: [] })

      const { company } = payload
      const res = await api.get(`/admin/workspace/${company}/survey-active`)
      const items = api.parseItems(res)
      const answers = (items || []).map((x) => null)
      await commit(UPDATE_SURVEY_STATE, { items, answers })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SURVEY_STATE, { isFetching: false })
  },
  async [REQUEST_SEND_ANSWERS] ({ commit, dispatch, state }) {
    try {
      await commit(UPDATE_SURVEY_STATE, { isSaving: true })

      const { user: { id } } = this.state.app
      const { answers, items, company } = state
      const data = {
        company_id: company.id,
        user_id: id,
        answers: answers.map((answer, i) => {
          return {
            question: items[i].question,
            survey_id: items[i].id,
            answer,
          }
        }),
      }
      const res = await api.post('/admin/event/check-survey', data)
      const result = api.parseItem(res)
      const { passed } = result
      await commit(UPDATE_SURVEY_STATE, { result, passOrFail: passed ? 1 : 2 })
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_SURVEY_STATE, { isSaving: false })
  },
}

const mutations = {
  async [UPDATE_SURVEY_STATE] (s, payload) {
    merge(s, payload)
    if (payload.items) s.items = [].concat(payload.items || [])
    if (payload.answers) s.answers = [].concat(payload.answers || [])
    if (payload.result) s.result = cloneDeep(payload.result)
    if (payload.contact) s.contact = cloneDeep(payload.contact)
    if (payload.company) s.company = cloneDeep(payload.company)
  },

  async [RESET_SURVEY_STATE] (s) {
    merge(s, cloneDeep(moduleState))
    s.items = []
    s.answers = []
    s.company = {}
    s.contact = {}
    s.result = {}
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
