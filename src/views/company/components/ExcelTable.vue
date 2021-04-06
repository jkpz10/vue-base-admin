<template>
  <div v-bind="$attrs" class="table-wrapper full-width">
    <div class="wp wp--scrollable wp--scrollable__x">
      <table class="full-width">
        <thead>
          <th v-for="(x, i) in fields"
              :key="i"
              v-text="x"
          />
        </thead>
        <tbody>
          <td v-for="(x, i) in fields" :key="i" v-html="'&nbsp;'" />
        </tbody>
      </table>
    </div>
    <div class="title pa-2 pb-0 d-flex justify-space-between">
      <div>
        {{ link }}
      </div>
      <v-btn small text @click="doDownloadCsvTemplate">
        Download csv template <v-icon color="black" small right v-text="'mdi-download'" />
      </v-btn>
    </div>
  </div>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('ExcelTable', {
  data: () => ({}),
  props: {
    link: {
      type: String,
      default: '',
    },
    fields: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    async doDownloadCsvTemplate () {
      let data = this.fields.join(',')
      data = `${data}\n${this.fields.map(() => '').join(',')}`

      const exportedFilenmae = 'template.csv'
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae)
      } else {
        const link = document.createElement('a')
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', exportedFilenmae)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.table-wrapper
  overflow: scroll
table
  position: relative
  border: 1px solid #ddd
  border-collapse: collapse
td, th
  white-space: nowrap
  border: 1px solid #ddd
  padding: 2px 5px
  min-width: 120px
th
  background-color: #eee
tbody tr td:first-of-type
  background-color: #eee
</style>
