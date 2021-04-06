<template>
  <v-card
    v-bind="$attrs"
    class="addedit addedit--wrapper pos-relative pb-6"
    @drop.prevent="doAddFromDrop"
    @dragover.prevent
  >
    <v-overlay
      :value="isUploading"
      absolute
      z-index="1"
    >
      <v-progress-circular
        indeterminate
        size="36"
      />
    </v-overlay>
    <v-file-input
      :value="file"
      :error-messages="errorMessages"
      accept="text/csv"
      show-size
      outlined
      color="grey"
      label="Upload CSV"
      class="mt-8"
      @change="doCheckFile"
    />
    <v-alert
      v-for="(n, i) in parseMessages"
      :key="i"
      icon="mdi-alert"
      type="error"
      class="mx-4 mb-1 py-1 px-3"
    >
      {{ n }}
    </v-alert>
    <div class="addedit--action d-flex flex-row-reverse mt-4">
      <v-btn
        elevation="0"
        small
        color="pink darken-1"
        class="mr-1"
        @click="doCancel"
      >
        Cancel <v-icon
          color="white"
          right
        >
          mdi-close-circle-outline
        </v-icon>
      </v-btn>
      <v-btn
        elevation="0"
        color="light-green lighten-1"
        :disabled="uploadBtnDisabled"
        small
        @click="$emit('do-upload', emails)"
      >
        Save <v-icon
          color="white"
          right
        >
          mdi-table-arrow-up
        </v-icon>
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { isEmpty, compact } from 'lodash'
import { validate } from 'vee-validate'
import { rule2MbOnly, ruleCsvOnly } from '../../api'
import { APP_ERROR } from '../../store/modules/app'

export default {
  name: 'UploadEmails',

  props: {
    isUploading: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    doCancel: {
      type: Function,
      default: () => ({}),
    },
  },
  data: () => ({
    file: null,
    emails: [],
    parseMessages: [],
    errorMessages: [],
  }),
  computed: {
    uploadBtnDisabled () {
      return this.isUploading || !this.file || !isEmpty(this.errorMessages) || !isEmpty(this.parseMessages)
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
    doCheckFile (file) {
      this.file = file || null
      this.errorMessages = []
      const [sizeEr, typeEr] = [
        ruleCsvOnly(file),
        rule2MbOnly(file),
      ]
      if (typeof sizeEr === 'string') {
        this.errorMessages.push(sizeEr)
      }
      if (typeof typeEr === 'string') {
        this.errorMessages.push(typeEr)
      }

      if (this.file && isEmpty(this.errorMessages)) {
        const reader = new FileReader()
        this.parseMessages = []
        reader.onload = async (e) => {
          this.emails = compact(e.target.result.split('\n')).map(async (email) => {
            email = email.trim().replace(/^"|"$/g, '')
            await validate(email, 'required|email').then((res) => {
              if (!res.valid) this.parseMessages.push(`${email} is not a valid email`)
            })
            return email
          })
          this.emails = await Promise.all(this.emails)
        }
        reader.readAsText(this.file)
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
