<template>
  <v-sheet rounded class="wp wp--line_view mt-1 elevation-1" :class="`wp--${type}`">
    <v-card-title class="d-flex justify-center pa-3">
      <v-icon small left v-text="icon" />
      <span class="txt--title">{{ title }}</span>
    </v-card-title>
    <div class="content content--item content--line">
      <div class="d-flex justify-start">
        <span>Date:</span> <strong>{{ eventDate }}</strong>
      </div>
      <div class="d-flex justify-start">
        <span>Time:</span> <strong>{{ eventTime }}</strong>
      </div>
    </div>
    <div
      v-if="['entry', 'send'].includes(type)"
      class="content content--item content--title d-flex justify-center mt-2"
    >
      <v-icon left small v-text="'mdi-check'" />
      <span>Workplace Ready</span>
    </div>
    <div
      v-if="['test'].includes(type)"
      class="content content--item content--line"
    >
      <div class="d-flex justify-start">
        <span class="txt--result mr-2">Test Result:</span>
        <strong :class="`${testResult === 'NEGATIVE' ? 'green' : 'red'}--text`">
          {{ testResult }}
        </strong>
      </div>
      <div class="d-flex justify-start">
        <span class="txt--result mr-2">Test Type:</span> <strong>{{ info.test_type }}</strong>
      </div>
      <div class="d-flex justify-start">
        <span class="txt--result mr-2">Testing Site:</span> <strong>{{ info.test_location_name }}</strong>
      </div>

      <v-divider class="mt-2" />
      <v-img v-if="imageInfo.url" contain :src="imageInfo.url" />
      <base-upload-image
        v-else
        :info="imageInfo"
        label="Drag n drop test image here"
        class="wp--upload_image pos-relative"
        :on-avatar-change="onAvatarChange"
      />

      <v-divider class="mb-4" />

      <v-btn x-small block color="#FD7387" class="inde mt-2">
        run contract trace <v-icon right x-small v-text="'mdi-radar'" />
      </v-btn>
    </div>
    <div
      v-if="['entry', 'send'].includes(type)"
      class="content content--item content--line pb-6"
    >
      <div class="details pa-2">
        <div class="txt--caption">
          {{ subjectName }}
        </div>
        <div class="d-flex flex-column">
          <div class="d-flex justify-start">
            <span>Address</span> <strong>{{ address }}</strong>
          </div>
          <div class="d-flex justify-start">
            <span>Main Contact</span> <strong>{{ contact }}</strong>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="['wfh', 'sickday', 'response', 'quarantine', 'communication'].includes(type)"
      class="content content--item content--line pb-6"
    >
      <div class="details pa-2">
        <div class="txt--caption">
          Notes
        </div>
        <div class="d-flex flex-column">
          <p>{{ info.notes }}</p>
        </div>
      </div>
    </div>
    <div
      v-if="['wfh', 'sickday', 'test'].includes(type)"
      class="content content--item content--line"
    >
      <div class="d-flex justify-start align-center">
        <span class="txt--mini mr-2">Entered By:</span>
        <strong>{{ enteredBy }}</strong>
      </div>
    </div>
  </v-sheet>
</template>

<script>
import moment from 'moment'
import { get } from 'lodash'
import { mapState } from 'vuex'
import { EVENT_COMMUNICATION, EVENT_ENTRY, EVENT_QUARANTINE, EVENT_RESPONSE, EVENT_SEND, EVENT_SICK_DAY, EVENT_TEST, EVENT_WORK_FROM_HOME } from '../../../../constants'
import { initComponent } from '../../../../lib'

export default initComponent('LineView', {
  computed: {
    imageInfo () {
      const { test_image_url: url, id, type } = this.info
      return { url, id, type }
    },
    eventDate () {
      const { _date } = this.info
      return moment(_date).format('LL')
    },
    eventTime () {
      const { _date } = this.info
      return moment(_date).format('LTS')
    },
    type () {
      return get(this.info, 'type', 'entry')
    },
    testResult () {
      return (this.info.test_result || '').toUpperCase()
    },
    enteredBy () {
      return this.info.entered_by_name || 'System'
    },
    title () {
      const { type } = this
      return {
        [EVENT_QUARANTINE]: 'Quarantine',
        [EVENT_RESPONSE]: 'Response',
        [EVENT_ENTRY]: 'Enter',
        [EVENT_SEND]: 'Verify',
        [EVENT_WORK_FROM_HOME]: 'Work From Home',
        [EVENT_SICK_DAY]: 'Sick Day',
        [EVENT_TEST]: 'Test Results',
        [EVENT_COMMUNICATION]: 'Communication',
      }[type] || ''
    },
    icon () {
      const { type } = this
      return {
        [EVENT_QUARANTINE]: 'mdi-sign-caution',
        [EVENT_RESPONSE]: 'mdi-play',
        [EVENT_ENTRY]: 'mdi-exit-to-app',
        [EVENT_SEND]: 'mdi-shield-star-outline',
        [EVENT_WORK_FROM_HOME]: 'mdi-home',
        [EVENT_SICK_DAY]: 'mdi-emoticon-sick-outline',
        [EVENT_TEST]: 'mdi-microscope',
        [EVENT_COMMUNICATION]: 'mdi-message-text',
      }[type] || 'mdi-adjust'
    },
    contact () {
      const { type } = this
      let subject = null
      if (type === 'entry') {
        subject = this.facility
      }
      if (type === 'send') {
        subject = this.company
      }
      return subject ? '' : `${subject.name}, ${subject.email}, ${subject.phone}`
    },
    address () {
      const { type } = this
      let subject = null
      if (type === 'entry') {
        subject = this.facility
      }
      if (type === 'send') {
        subject = this.company
      }
      return subject ? '' : `${subject.addr} ${subject.city}, ${subject.state} ${subject.zip}`
    },
    subjectName () {
      const { type } = this
      if (type === 'entry') {
        return this.facility.name
      }
      if (type === 'send') {
        return this.company.name
      }
      return 'no-name'
    },
    ...mapState({
      facilityContact () {
        return {
          name: 'Arnold Schwarzenegger',
          email: 'arnold.schwarzenegger@mailinator.com',
          phone: '+1-202-555-0173',
        }
      },
      facility () {
        return {
          name: 'Annex 2',
          addr: '137 Teaticket Hwy',
          city: 'East Falmouth',
          state: 'Massachusetts',
          zip: '2536',
        }
      },
      companyContact () {
        return {
          name: 'George Washington',
          email: 'george.washington@mailinator.com',
          phone: '+1-202-555-0108',
        }
      },
      company () {
        return {
          name: 'Braxton Inc',
          addr: '777 Brockton Avenue',
          city: 'Abington',
          state: 'Massachusetts',
          zip: '2351',
        }
      },
    }),
  },
  methods: {
    async onAvatarChange (item) {
      if (item && item.test_image_url) {
        return this.doUpdateData(item.test_image_url, 'test_image_url')
      }
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  overflow: hidden
  &--line_view
    width: 230px
  .v-card__title
    color: #383838
  &--response
    .v-card__title
      background-color: #3883D08D
      .v-icon
        color: #1C4C7F !important
  &--quarantine
    .v-card__title
      background-color: #D0021B7B
      .v-icon
        color: #D0021B7B !important
  &--entry
    .v-card__title
      background-color: #FFF4E5
      .v-icon
        color: #FFCA83 !important
  &--send
    .v-card__title
      background-color: #E9DCFB
      .v-icon
        color: #643290 !important
  &--test
    .v-card__title
      background-color: #8FB8E0
      .v-icon
        color: #1C4C7F !important
  &--sickday
    .v-card__title
      background-color: #F3A536
      .v-icon
        color: #F7E53B !important
  &--communication
    .v-card__title
      background-color: #E9DCFB
      .v-icon
        color: #643290 !important
  &--wfh
    .v-card__title
      background-color: #FBF5C2
      .v-icon
        color: #F7E53B !important
.content
  padding: 8px 14px
  &--line
    @include font(400, 10px)
    > div
      margin-bottom: 2px
      &.details
        box-shadow: 0px 3px 13px 5px rgba(0,0,0,0.1)
      > span:not(.txt--mini):not(.txt--result)
        width: 40px
  &--title
    @include font(400, 12px)
    > .v-icon
      background-color: #4AD991
      border-radius: 20px
      padding: 5px
      color: white
    > span
      @include font(600, 15px)
      text-transform: uppercase
      color: #474747
      margin-top: 2px
.txt
  &--title
    @include font(400, 11px)
    text-transform: uppercase
  &--caption
    @include font(700, 11px)
  &--mini
    @include font(300, 9px)
</style>
