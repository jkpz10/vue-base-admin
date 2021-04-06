import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import i18n from '@/i18n'
import '@/sass/overrides.sass'

Vue.use(Vuetify)

const theme = {
  primary: '#673ab7',
  secondary: '#607d8b',
  accent: '#2277ba',
  error: '#f44336',
  warning: '#ff5722',
  info: '#00bcd4',
  success: '#4caf50',
}

export default new Vuetify({
  lang: {
    t: (key, ...params) => i18n.t(key, params),
  },
  theme: {
    themes: {
      dark: theme,
    },
  },
})
