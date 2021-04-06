<template>
  <v-sheet
    v-bind="$attrs"
    class="pos-relative file-upload rounded-circle"
    :class="{ 'is-visible': isUploading }"
    @drop.prevent="doAddFromDrop"
    @dragover.prevent
  >
    <v-overlay :value="isUploading" absolute z-index="10">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <span v-bind="attrs" v-on="on">
          <v-file-input
            :value="file"
            :error-messages="errorMessages"
            accept="img/*"
            prepend-icon="mdi-camera"
            show-size
            outlined
            hide-input
            hide-details="auto"
            :dark="true"
            :label="label"
            class="mt-1"
            @change="doCheckFile"
          />
        </span>
      </template>
      <span>Drag n drop avatar here</span>
    </v-tooltip>
  </v-sheet>
</template>

<script>
import { isEmpty } from 'lodash'
import { rule2MbOnly, ruleImageOnly } from '../../api'
import { APP_ERROR, REQUEST_UPLOAD_AVATAR } from '../../store/modules/app'

export default {
  name: 'UploadAvatar',

  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    onAvatarChange: {
      type: Function,
      default: () => ({}),
    },
    label: {
      type: String,
      default: 'Upload PNG or JPEG avatar here',
    },
  },
  data: () => ({
    file: null,
    errorMessages: [],
    isUploading: false,
  }),
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
          await dispatch(REQUEST_UPLOAD_AVATAR, {
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
.file-upload
  opacity: 0
  background: transparent
  width: 80px
  height: 80px
  top: -46px
  transition: opacity .5s

  &:hover, &.is-visible
    background: #00000040
    opacity: 1
  &.is-visible
    .v-file-input
      opacity: 0
  .v-input
    margin: 0 auto
    width: 24px
</style>
