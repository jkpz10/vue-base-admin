<template>
  <v-card-text class="pt-6 px-8 d-flex flex-column align-start justify-stretch">
    <div class="wp--first">
      Your health survey is complete
    </div>
    <div class="wp--first">
      Use this QR for entry to:
      <div class="text-center text-h4 text-teal darken-4 font-weight-bold">
        {{ info.company.name }}
      </div>
    </div>
    <div class="full-width wp--second d-flex justify-center">
      <div class="wp--icon d-flex mr-2">
        <v-icon large class="flex-fill" v-text="'mdi-check'" />
      </div>
      <div class="d-flex flex-column">
        <h4>Survey Verified</h4>
        <span class="mt-2 text--today">Today</span>
        <span class="text--date">{{ today }}</span>
      </div>
    </div>
    <div class="full-width d-flex flex-column justify-center align-center">
      <div class="wp--qrcode">
        <vue-qrcode :value="qrCodeValue" />
      </div>
      <span class="text--bold">
        SCAN QR for Entry
      </span>
    </div>
  </v-card-text>
</template>

<script>
import { get, initComponent } from '../../../lib'
import moment from 'moment'
import VueQrcode from 'vue-qrcode'

export default initComponent('ResultPassed', {
  components: {
    VueQrcode,
  },
  props: {
    companyName: {
      type: String,
      default: '',
    },
  },
  computed: {
    qrCodeValue () {
      const { info = {} } = this.info
      return JSON.stringify({
        answers: get(info, 'result.answers', []),
        company_id: get(info, 'result.company_id', null),
        user_id: get(info, 'result.user_id', null),
        passed: get(info, 'result.passed'),
      })
    },
  },
  data () {
    return {
      today: moment().format('MMM DD hh:mm a'),
    }
  },
  methods: {},
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
$iconSize: 60px
.wp
  &--icon
    background: #51D893
    width: $iconSize
    height: $iconSize
    border-radius: $iconSize
    > .flex-fill
      color: white
  &--title
    @include font(400, 12px)
    h4
      @include font(400, 10px)
  &--first
    margin: 10px auto 5px
    @include font(400, 14px)
  &--second
    margin-top: 20px
    margin-bottom: 10px
a
  text-decoration: none
  @include font(600, 12px)
.text
  &--today
    @include font(600, 10px)
  &--date
    @include font(600, 14px)
  &--bold
    @include font(700, 9px)
</style>
