import Vue from 'vue'
import moment from 'moment'
import Ph from 'awesome-phonenumber'
import {
  extend,
  ValidationObserver,
  ValidationProvider,
} from 'vee-validate'
import {
  email,
  max,
  min,
  numeric,
  required,
} from 'vee-validate/dist/rules'

extend('email', email)
extend('max', max)
extend('min', min)
extend('numeric', numeric)
extend('required', required)
extend('checked', {
  validate (value) {
    return {
      required: true,
      valid: ['', null, false, undefined].indexOf(value) === -1,
    }
  },
  computesRequired: true,
})
extend('date', {
  validate (value) {
    return {
      required: true,
      valid: moment(value).isValid(),
    }
  },
})
extend('phone', {
  validate (value) {
    const ph = new Ph(value)
    return {
      required: true,
      valid: ph.isValid(),
    }
  },
})

Vue.component('validation-provider', ValidationProvider)
Vue.component('validation-observer', ValidationObserver)
