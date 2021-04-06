<template>
  <v-sheet
    class="wp--upload_area pos-relative"
    v-bind="$attrs"
    v-on="$listeners"
    @drop.prevent="doAddFromDrop"
    @dragover.prevent
  >
    <v-overlay :value="isUploading" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-sheet tile class="d-flex flex-row align-center justify-start wp--sheet rounded" @click.self="doOpenFileInput">
      <v-file-input
        ref="fileInput"
        v-model="file"
        hide-input
        hide-details
        class="mt-n2 file_input"
        prepend-icon="mdi-file-excel"
        @change="doCheckFile"
      />
      <div class="text--label">
        {{ label }}
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script>
import { rule2MbOnly, ruleCSVOnly } from '../../../api'
import { initComponent } from '../../../lib'
import { COLOR_ERROR, SNACKBAR_ADD } from '../../../store/index'
import { APP_ERROR } from '../../../store/modules/app'
import { REQUEST_UPLOAD_CSV } from '../../../store/modules/company'

export default initComponent('UploadCsvForm', {
  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    isUploading: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Drag and drop csv file here',
    },
  },
  data: () => ({
    file: null,
  }),
  computed: {
    _file: {
      get () {
        return this.file
      },
      set (file) {
        console.dir(file)
        this.file = file
      },
    },
  },
  async mounted () {
    const { dispatch } = this.$store
    if (!FileReader) {
      const msg = `Please use other browser, like google chrome.
        File processing is not supported by this browser.`
      await dispatch(APP_ERROR, { error: new Error(msg) })
    }
  },
  methods: {
    async onCSVError () {
      this.$refs.fileInput.reset()
    },
    doOpenFileInput () {
      this.$refs.fileInput.$el.click()
    },
    doAddFromDrop (e) {
      const { files } = e.dataTransfer
      if (files) {
        this.doCheckFile(files[0])
      }
    },
    async doCheckFile (file) {
      const { dispatch } = this.$store
      this.file = file || null

      if (!this.file) {
        return
      }

      const [sizeEr, typeEr] = [
        ruleCSVOnly(file),
        rule2MbOnly(file),
      ]
      if (typeof sizeEr === 'string') {
        return dispatch(SNACKBAR_ADD, {
          message: sizeEr,
          color: COLOR_ERROR,
        })
      }
      if (typeof typeEr === 'string') {
        return dispatch(SNACKBAR_ADD, {
          message: typeEr,
          color: COLOR_ERROR,
        })
      }

      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const { info } = this
          console.log('b')
          await dispatch(REQUEST_UPLOAD_CSV, { info, csvString: e.target.result })
        }
        reader.readAsText(this.file)
      } catch (error) {}
    },
  },
})
</script>

<style lang="sass" scoped>
.file_input
  max-width: 30px
.wp
  &--upload_area
    padding: 8px
    margin: 4px
    background-color: #E1F5FE
  &--sheet
    height: 80px
    padding: 10px
    cursor: pointer
    border: 1px dotted grey
    background: transparent
</style>
