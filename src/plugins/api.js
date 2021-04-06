import Vue from 'vue'
import axios from 'axios'

import api from '../api'

Vue.use(api)

axios.interceptors.request.use((config) => {
  const { headers } = config
  if (!headers.Authorization) {
    const t = Vue.$cookies.get('_VCt')
    if (t) {
      headers.Authorization = t
    }
    config.headers = headers
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

axios.interceptors.response.use((res) => {
  return res
}, (err) => {
  // TODO: Handle error here
  // if (err.isAxiosError) {}
  return Promise.reject(err)
})
