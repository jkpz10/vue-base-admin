<template>
  <div
    class="wp--line_item d-flex justify-start align-start full-width"
    :class="parentClass"
  >
    <!-- Date Column -->
    <div v-if="info.date" class="band band--date band--first d-flex flex-column justify-start mr-1">
      <div class="text--dayname text-center">
        {{ day.name }}
      </div>
      <div class="text--daynum text-center">
        {{ day.num }}
      </div>
    </div>
    <div v-else class="band band--date band--first mr-1" />

    <!-- Blue Column -->
    <div
      class="band band--col--2 band--strip"
      :class="blueClass"
    />

    <div v-if="isResponse" class="band band--last band--inner full-width">
      <div v-ripple class="band--content pa-1 d-flex align-center justify-space-between">
        <div class="text--band">
          Response Iteration
        </div>
        <v-btn v-if="!info.ended" x-small class="inde btn--change_date red--text" text @click.stop.prevent="doEnd(info)">
          End <v-icon right color="red" v-text="'mdi-calendar-remove'" />
        </v-btn>
      </div>
    </div>
    <div v-else class="band band--last band--inner d-flex justify-start align-start full-width">
      <div
        class="band band--strip"
        :class="pinkClass"
      />

      <div v-if="isQuarantine" class="band band--last">
        <div v-ripple class="band--content pa-1 d-flex align-center justify-space-between">
          <div class="text--band">
            Quarantie
          </div>
          <v-btn v-if="!info.ended" x-small class="inde btn--change_date red--text" text @click.stop.prevent="doEnd(info)">
            End <v-icon right color="red" v-text="'mdi-calendar-remove'" />
          </v-btn>
        </div>
      </div>
      <div v-else class="band band--last band--inner d-flex justify-start align-start full-width">
        <div
          class="band band--strip"
          :class="thirdRibbonClass"
        />
        <div v-if="isWfh || isSickDay" class="band band--last">
          <div class="band--content pa-1 d-flex align-center justify-space-between">
            <div class="text--band">
              {{ isWfh ? 'Work from Home' : 'Sick Day' }}
            </div>
            <v-btn v-if="!info.ended" x-small class="inde btn--change_date red--text" text @click.stop.prevent="doEnd(info)">
              End <v-icon right color="red" v-text="'mdi-calendar-remove'" />
            </v-btn>
          </div>
        </div>
        <div v-else class="band band--inner band--last d-flex flex-column">
          <div v-if="isCommunication" class="band--content band--entry band--entry__violet d-flex align-center justify-start">
            <div class="text--icon">
              <v-icon small v-text="'mdi-message-text'" />
            </div>
            <div class="pl-2 text--band">
              Communication
            </div>
            <div class="text--icon last">
              <v-icon small v-text="'mdi-chevron-right'" />
            </div>
          </div>
          <div v-if="isVerify" class="band--content band--entry band--entry__purple d-flex align-center justify-start">
            <div class="text--icon">
              <v-icon small v-text="'mdi-shield-star-outline'" />
            </div>
            <div class="pl-2 text--band d-flex justify-space-between">
              <span>Verify</span>
              <v-icon x-small v-text="'mdi-check'" />
            </div>
            <div class="text--icon last">
              <v-icon small v-text="'mdi-chevron-right'" />
            </div>
          </div>
          <div v-if="isTest" class="band--content band--entry band--entry__blue d-flex align-center justify-start">
            <div class="text--icon">
              <v-icon small v-text="'mdi-virus-outline'" />
            </div>
            <div class="pl-2 text--band d-flex justify-space-between">
              <span>Test</span>
              <span :class="{ 'text--red': testResult === 'POSITIVE' }">{{ testResult }}</span>
            </div>
            <div class="text--icon last">
              <v-icon small v-text="'mdi-chevron-right'" />
            </div>
          </div>
          <div v-if="isEntry" class="band--content band--entry band--entry__orange d-flex align-center justify-start">
            <div class="text--icon">
              <v-icon small v-text="'mdi-exit-to-app'" />
            </div>
            <div class="pl-2 text--band d-flex justify-space-between">
              <span>Entry</span>
              <span class="time">13:00</span>
            </div>
            <div class="text--icon last">
              <v-icon small v-text="'mdi-chevron-right'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash'
import moment from 'moment'
import { EVENT_COMMUNICATION, EVENT_ENTRY, EVENT_QUARANTINE, EVENT_RESPONSE, EVENT_SEND, EVENT_SICK_DAY, EVENT_TEST, EVENT_WORK_FROM_HOME } from '../../../../constants'
import { initComponent } from '../../../../lib'

export default initComponent('LineItem', {
  props: {
    doEnd: {
      type: Function,
      default: () => ({}),
    },
    doView: {
      type: Function,
      default: () => ({}),
    },
  },
  computed: {
    isResponse () {
      const { end } = this.info
      return end === EVENT_RESPONSE
    },
    isQuarantine () {
      const { end } = this.info
      return end === EVENT_QUARANTINE
    },
    isWfh () {
      const { end } = this.info
      return end === EVENT_WORK_FROM_HOME
    },
    isSickDay () {
      const { end } = this.info
      return end === EVENT_SICK_DAY
    },
    isCommunication () {
      const { type } = this.info
      return type === EVENT_COMMUNICATION
    },
    isVerify () {
      const { type } = this.info
      return type === EVENT_SEND
    },
    isTest () {
      const { type } = this.info
      return type === EVENT_TEST
    },
    isEntry () {
      const { type } = this.info
      return type === EVENT_ENTRY
    },
    isSpacer () {
      const { type } = this.info
      return type === 'spacer'
    },
    testResult () {
      return (this.info.test_result || '').toUpperCase()
    },
    dateStr () {
      return moment(this.info._date).format('YYYY-MM-DD')
    },
    parentClass () {
      const { type, start, date } = this.info
      return {
        'band--spacer': type === 'spacer',
        'band--start': !!start & isEmpty(date),
        ...(start ? { [`band--start--${start}`]: true } : {}),
        // ...(parents[0] ? { [`band--${parents[0]}`]: true } : {}),
      }
    },
    blueClass () {
      const { type, parents = [], end, start } = this.info
      const isBlue = parents.concat([type]).includes(EVENT_RESPONSE)
      return {
        'band--strip__blue': isBlue,
        'band--strip__first': isBlue && end === EVENT_RESPONSE,
        'band--strip__last': isBlue && start === EVENT_RESPONSE,
      }
    },
    pinkClass () {
      const { type, parents = [], end, start } = this.info
      const isPink = parents.concat([type]).includes(EVENT_QUARANTINE)
      return {
        'band--strip__pink': isPink,
        'band--strip__first': isPink && end === EVENT_QUARANTINE,
        'band--strip__last': isPink && start === EVENT_QUARANTINE,
      }
    },
    thirdRibbonClass () {
      const { type, parents = [], end, start } = this.info
      const isYellow = parents.concat([type]).includes(EVENT_WORK_FROM_HOME)
      const isOrange = parents.concat([type]).includes(EVENT_SICK_DAY)
      return {
        'band--strip__yellow': isYellow,
        'band--strip__orange': isOrange,
        'band--strip__first': (isYellow || isOrange) && [EVENT_SICK_DAY, EVENT_WORK_FROM_HOME].includes(end),
        'band--strip__last': (isYellow || isOrange) && [EVENT_SICK_DAY, EVENT_WORK_FROM_HOME].includes(start),
      }
    },
    day () {
      const { date = '' } = this.info
      const [num, name] = date.split('|')
      return { name, num }
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
$bandHeight: 32px
.wp--line_item
  cursor: pointer
.text
  &--dayname
    @include font(400, 9px)
    text-transform: uppercase
  &--daynum
    @include font(600, 9px, 'Roboto')
  &--band
    @include font(400, 11px)
  &--icon
    padding-left: 5px !important
    padding-right: 5px !important
.btn
  &--change_date, &--go
    @include font(400, 11px)
    text-transform: none
.band
  width: 10px
  height: $bandHeight
  position: relative
  // &--inner
  //   background-color: green
  &--spacer
    height: $bandHeight * 0.3
    overflow: hidden
  &--start
    height: $bandHeight * 0.5
    overflow: hidden
    .band
      &--strip__last,
      &--strip__first,
      &--inner
        height: $bandHeight * 0.2
  &--first
    width: 25px
  &--strip
    &__yellow
      background-color: #F8E71C
      color: #F8E71C
    &__orange
      background-color: #F5A623
      color: #F5A623
    &__pink
      background-color: #D0021B7B
      color: #D0021B7B
    &__blue
      background-color: #4A90E2
      color: #4A90E2
    &__first
      border-top-left-radius: 5px
    &__last
      border-bottom-left-radius: 5px
  &--last
    flex: 1
  &--inner
    margin-left: 2px
  &--content
    background-color: #fff
    min-height: 28px
    &:not(&--entry)
      border-top-right-radius: 5px
      border-bottom-right-radius: 5px
  &--entry
    // margin-top: 3px
    margin-left: 5px
    border-top-left-radius: 5px
    border-bottom-left-radius: 5px
    overflow: hidden
    width: 200px
    cursor: pointer
    .text
      &--band, &--icon
        padding: 4px 1px
      &--band
        flex: 1
        @include font(400, 11px)
        color: #707070
        > .v-icon, > span:last-child:not(.time):not(.txt--red)
          color: #4CAF50
          margin-top: 2px
        > span.time:last-child
          position: relative
          &:before
            content: ''
            width: 1px
            background-color: lighten(#3C4858, 40)
            height: 80%
            position: absolute
            left: -6px
        > span.text
          &--red
            color: #ED3D3A !important
        > span:last-child
            @include font(400, 9px)
            text-transform: uppercase
      &--icon.last
        margin-left: auto
    .btn--go
      color: lighten(#707070, 10)
    &__orange
      .text
        &--icon:not(.last)
          background-color: #F8E71C46
          &, .v-icon
            color: #F8E71C !important
    &__blue
      .text
        &--icon:not(.last)
          background-color: #3883D08D
          &, .v-icon
            color: #1C4C7F !important
    &__purple
      .text
        &--icon:not(.last)
          background-color: #E9DBFC
          &, .v-icon
            color: #A772FD !important
    &__violet
      .text
        &--icon:not(.last)
          background-color: #E9DCFB
          &, .v-icon
            color: #643290 !important
</style>
