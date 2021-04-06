import { cloneDeep, merge } from 'lodash'

import api from '../../api'
import { APP_ERROR } from './app'
import { REQUEST_COMPANY_INFO } from './company'

export const UPDATE_FR_STATE = 'UPDATE_FR_STATE'
export const REQUEST_COMPANY_UPLOAD_BUNCH_OF_EMAILS = 'REQUEST_COMPANY_UPLOAD_BUNCH_OF_EMAILS'
export const REQUEST_FR_RESEND = 'REQUEST_FR_RESEND'

// state
const moduleState = {
  isSaving: false,
  isFormUpload: false,
  isUploading: false,
}

const actions = {
  async [REQUEST_COMPANY_UPLOAD_BUNCH_OF_EMAILS] ({ commit, dispatch }, payload) {
    await commit(UPDATE_FR_STATE, { isUploading: true })
    try {
      const { companyInfo } = this.state.app.company
      await api.post(`/admin/company/${companyInfo.id}/emails`, payload)
      await commit(UPDATE_FR_STATE, { isFormUpload: false })
      await dispatch(REQUEST_COMPANY_INFO)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FR_STATE, { isUploading: false })
  },
  async [REQUEST_FR_RESEND] ({ dispatch, commit }, payload) {
    await commit(UPDATE_FR_STATE, { isUploading: true })
    try {
      const { companyInfo } = this.state.app.company
      console.dir(payload)
      await api.put(`/admin/company/${companyInfo.id}/emails`, payload)
      await commit(UPDATE_FR_STATE, { isFormUpload: false })
      await dispatch(REQUEST_COMPANY_INFO)
    } catch (error) {
      await dispatch(APP_ERROR, { error })
    }
    await commit(UPDATE_FR_STATE, { isUploading: false })
  },
}

// mutations
const mutations = {
  async [UPDATE_FR_STATE] (s, payload) {
    merge(s, payload)
  },
}

export default {
  state: () => cloneDeep(moduleState),
  actions,
  mutations,
}
