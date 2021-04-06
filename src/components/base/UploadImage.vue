<template>
  <v-sheet
    v-bind="$attrs"
    v-on="$listeners"
    @drop.prevent="doAddFromDrop"
    @dragover.prevent
  >
    <v-img contain :src="info.url" class="d-flex align-center justify-center">
      <v-sheet tile class="full-width d-flex align-center justify-center wp--sheet">
        <v-overlay :value="isUploading" absolute z-index="1">
          <v-progress-circular indeterminate size="36" />
        </v-overlay>
        <v-file-input
          :value="file"
          :error-messages="errorMessages"
          hide-input
          accept="img/*"
          show-size
          outlined
          hide-details="auto"
          color="grey"
          class="mt-n3"
          prepend-icon="mdi-file-image-outline"
          @change="doCheckFile"
        />
        <div class="text--label text-left" @click.self="doOpenImage">
          {{ noImage ? labelNoImage : labelWithImage }}
        </div>
      </v-sheet>
    </v-img>
  </v-sheet>
</template>

<script>
import { isEmpty } from 'lodash'
import { rule2MbOnly, ruleImageOnly } from '../../api'
import { APP_ERROR, REQUEST_UPLOAD_IMAGE } from '../../store/modules/app'

export default {
  name: 'UploadImage',

  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    onAvatarChange: {
      type: Function,
      default: () => ({}),
    },
    labelNoImage: {
      type: String,
      default: 'Drag and drop image here',
    },
    labelWithImage: {
      type: String,
      default: 'Click here to view or drag and drop image here to replace',
    },
  },
  data: () => ({
    file: null,
    errorMessages: [],
    isUploading: false,
  }),
  computed: {
    noImage () {
      return isEmpty(this.info.url)
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
    doAddFromDrop (e) {
      const { files } = e.dataTransfer
      if (files) {
        this.doCheckFile(files[0])
      }
    },
    doOpenImage () {
      const { url } = this.info
      window.open(url, '_tab')
    },
    async doCheckFile (file) {
      this.file = file || null
      this.errorMessages = []
      const [sizeEr, typeEr] = [
        ruleImageOnly(file),
        rule2MbOnly(file),
      ]
      if (typeof sizeEr === 'string') {
        this.errorMessages.push(sizeEr)
      }
      if (typeof typeEr === 'string') {
        this.errorMessages.push(typeEr)
      }

      if (this.file && isEmpty(this.errorMessages)) {
        try {
          this.isUploading = true
          const { dispatch } = this.$store
          await dispatch(REQUEST_UPLOAD_IMAGE, {
            item: this.info,
            file: this.file,
          }).then((res) => {
            return this.onAvatarChange(this.$api.parseItem(res)).then(() => {
              this.file = null
              this.isUploading = false
            })
          })
        } catch (error) {
          this.isUploading = false
        }
      }
    },
  },
}
</script>

<style lang="sass" scoped>
.wp
  &--upload_image
    margin: 2px 4px
  &--sheet
    padding: 0px 4px
    background: rgba(255, 255, 255, 0.6)
    cursor: pointer
</style>
