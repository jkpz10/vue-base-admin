<template>
  <div class="d-flex flex-column pa-2">
    <v-overlay :value="isFetching || isLoading" absolute z-index="2">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="d-flex justify-space-between align-top full-width">
      <div class="d-flex flex-column">
        <div class="text--day">
          {{ weekString }}
        </div>
      </div>
      <div class="d-flex justify-end">
        <v-btn x-small class="px-1 inde btn--change_date" text @click="doPrevWeek">
          <v-icon class="mr-1" left small color="black" v-text="'mdi-calendar-arrow-left'" /> Previous week
        </v-btn>
        <v-btn x-small class="px-1 inde btn--change_date" text @click="doNextWeek">
          Next week <v-icon class="ml-1" small right color="black" v-text="'mdi-calendar-arrow-right'" />
        </v-btn>
      </div>
    </div>
    <v-alert v-if="noRecords" border="top" color="red lighten-2" dark class="mt-2 pb-2 pt-3 px-2">
      No event history
    </v-alert>
    <div v-else ref="history" v-scroll.self="onScroll" class="d-flex flex-column wp wp--scrollable wp--scrollable__y mb-5">
      <div ref="scrollable" class="pos-relative">
        <line-item
          v-for="(item, x) in items"
          :key="x"
          :info="item"
          :do-end="doEndLineItem"
          @click.native="doShowDetails(item)"
        />
      </div>
    </div>
    <div class="d-flex flex-row-reverse">
      <v-btn ref="addEventBtn" icon tile elevation="0" small class="rounded inde btn--save" @click="doShowAddEventMenu">
        <v-icon color="white" v-text="'mdi-plus'" />
      </v-btn>
      <v-menu
        v-model="menuEvent"
        transition="scale-transition"
        absolute
        offset-y
        :position-x="xyEvent.x"
        :position-y="xyEvent.y"
        max-width="200"
      >
        <v-list class="pa-2 pb-0 menu--wp">
          <v-list-item
            v-for="(item, x) in eventTypes"
            :key="x"
            class="menu--item"
            :class="{ 'menu--item__disabled': item.disabled }"
            :disabled="item.disabled"
          >
            <v-divider v-if="item.id === 'spacer'" />
            <v-list-item-title v-else class="menu--title d-flex rounded" :class="`menu--title__${item.id}`" @click="doAddEvent(item.id)">
              <div class="d-flex justify-center align-center">
                <v-icon small v-text="item.icon" />
              </div>
              <div class="d-flex justify-space-between">
                {{ item.text }}
                <v-icon right v-text="'mdi-plus'" />
              </div>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="menu--item menu--item__last pl-1 d-flex justify-space-between">
            <div>Select Event to Add</div>
            <v-btn x-small icon class="inde mr-n12" tile elevation="0" @click="menuEvent = false">
              <v-icon v-text="'mdi-close'" />
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn icon small class="inde btn--back white--text mr-2" @click="doRefreshList">
        <v-icon v-text="'mdi-refresh'" />
      </v-btn>
      <v-btn class="inde btn btn--export mr-2" elevation="0" @click="doExport">
        Export <v-icon color="white" right v-text="'mdi-export-variant'" />
      </v-btn>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { isEmpty, cloneDeep } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { initComponent } from '../../../lib'
import { REQUEST_UE_LIST, UPDATE_UE_STATE } from '../../../store/modules/user-events'
import LineItem from './WPHS/LineItem'
import { EVENT_QUARANTINE, EVENT_RESPONSE, EVENT_SICK_DAY, EVENT_TEST, EVENT_VACCINE, EVENT_WORK_FROM_HOME } from '../../../constants'

export default initComponent('WorkPlaceHealthStory', {
  components: {
    LineItem,
  },
  props: {
    isFetching: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      xyEvent: { x: 0, y: 0 },
      menuEvent: false,
      xyDatePicker: { x: 0, y: 0 },
      menuDtPicker: false,
    }
  },
  computed: {
    ...mapState({
      weekString: (state) => {
        const { from, to } = state.userEvent
        const x = moment(from).startOf('day')
        const y = moment(to).endOf('week')
        let str = `${x.format('Do')} `
        str = `${str}${x.format('MM') !== y.format('MM') ? x.format('MMM') : ''} `
        str = `${str} to ${y.format('Do MMM, YYYY')}`
        return str
      },
      eventTypes: (state) => {
        const { current_events: ev = {} } = state.user.item
        return [
          {
            id: EVENT_RESPONSE,
            text: 'Start Response',
            icon: 'mdi-play',
            disabled: !isEmpty(ev.response_id),
          },
          {
            id: EVENT_QUARANTINE,
            text: 'Start Quarantine',
            icon: 'mdi-sign-caution',
            disabled: !isEmpty(ev.quarantine_id),
          },
          {
            id: EVENT_WORK_FROM_HOME,
            text: 'Work From Home',
            icon: 'mdi-home',
            disabled: !isEmpty(ev.wfh_id) || !isEmpty(ev.sickday_id),
          },
          {
            id: EVENT_SICK_DAY,
            text: 'Start Sick Day',
            icon: 'mdi-emoticon-sick-outline',
            disabled: !isEmpty(ev.wfh_id) || !isEmpty(ev.sickday_id),
          },
          {
            id: 'spacer',
          },
          {
            id: EVENT_TEST,
            text: 'Test Results',
            icon: 'mdi-microscope',
            disabled: false,
          },
          {
            id: EVENT_VACCINE,
            text: 'Add Vaccine',
            icon: 'mdi-needle',
            disabled: true,
          },
        ]
      },
      isLoading: (state) => state.userEvent.isFetching,
      noRecords: (state) => isEmpty(state.userEvent.items),
      items: (state) => state.userEvent.items,
      currentDate: (state) => {
        const { from: date } = state.userEvent
        return moment(date).format('YYYY-MM-DD')
      },
      date: (state) => {
        const { from } = state.userEvent
        const today = moment(undefined).format('YYYY-MM-DD')
        const p = moment(from).format('YYYY-MM-DD')
        return {
          day: today === p ? 'Today' : moment(from).format('DD ddd'),
          monthYear: moment(from).format('MMMM YYYY'),
        }
      },
    }),
  },
  methods: {
    async onReady () {
      await this.updateCustomDate()
      await this.doRefreshList()
      if (this.$refs.history) this.$refs.history.scrollTop = 0
    },
    async updateCustomDate (value) {
      const { commit } = this.$store
      const data = {}
      data.from = moment(value).startOf('week').valueOf()
      data.to = moment(value).endOf('week').valueOf()
      await commit(UPDATE_UE_STATE, data)
    },
    async doRefreshList () {
      const { $store: { dispatch } } = this
      await dispatch(REQUEST_UE_LIST)
    },
    async doAddEvent (event) {
      const { commit, state } = this.$store
      const { item: user } = state.user

      commit(UPDATE_UE_STATE, { item: {}, isFormAdd: false, isFormEdit: false })

      let item = {
        type: event,
        company_id: user.company_id,
        user_id: user.id,
      }
      if (event === EVENT_TEST) {
        item = {
          ...item,
          type: event,
          test_type: 'ANTIGEN',
          test_location_name: '',
          test_location_address: '',
          test_result: 'NEGATIVE',
          date_tested: moment().valueOf(),
          share_to_employer: true,
        }
      } else {
        item = {
          ...item,
          notes: '',
          notify: false,
          started_at: moment().valueOf(),
        }
      }
      return commit(UPDATE_UE_STATE, { item, isFormView: false, isSaving: false, isFormAdd: true })
    },
    doShowAddEventMenu (e) {
      const { left, top } = this.$refs.addEventBtn.$el.getBoundingClientRect()
      this.xyEvent = { x: left, y: top }
      this.menuEvent = !this.menuEvent
    },
    async doNextWeek () {
      const { state } = this.$store
      const { to } = state.userEvent
      await this.updateCustomDate(moment(to).add(1, 'day').valueOf())
      await this.doRefreshList()
    },
    async doPrevWeek () {
      const { state } = this.$store
      const { from } = state.userEvent
      await this.updateCustomDate(moment(from).subtract(1, 'day').valueOf())
      await this.doRefreshList()
    },
    doExport () {
    },
    async doEndLineItem (subject) {
      const { commit } = this.$store
      const item = {
        ...cloneDeep(subject),
        ended_at: moment(undefined).valueOf(),
      }
      return commit(UPDATE_UE_STATE, { item, isSaving: false, isFormAdd: true })
    },
    async doShowDetails (item) {
      const { commit } = this.$store
      return commit(UPDATE_UE_STATE, { item, isFormView: true, isSaving: false, isFormAdd: false })
    },
    ...mapActions({}),
    async onScroll () {
      const { state } = this.$store
      const { from, to } = state.userEvent
      const { clientHeight: boundary, scrollTop } = this.$refs.history
      const { clientHeight: contentHeight } = this.$refs.scrollable

      const data = {}
      const limit = contentHeight - boundary

      if (scrollTop === 0) {
        data.from = moment(from).startOf('day').add(1, 'day').toISOString()
        data.to = moment(to).startOf('day').subtract(1, 'day').toISOString()
      } else if (scrollTop === limit) {
        data.from = moment(from).startOf('day').subtract(1, 'day').toISOString()
        data.to = moment(to).startOf('day').add(1, 'day').toISOString()
      }
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.menu
  &--wp
    min-height: auto
    background-color: #F6F6F6
  &--item
    padding: 0px
    min-height: 32px
    &:not(:last-child)
      margin-bottom: 4px
    &__last
      @include font(400, 10px)
      > div
        color: #4AD991
    &__disabled
      .menu--title
        background-color: #E0E0E0
        > div
          cursor: not-allowed !important
  &--title
    overflow: hidden
    background-color: white
    min-height: 32px
    > div
      cursor: pointer
      transition: all 0.3s ease
      &:first-child
        width: 30px
      &:last-child
        flex: 1
        padding-top: 8px
        padding-left: 6px
        padding-right: 8px
        @include font(400, 11px)
        .v-icon
          margin-top: -7px
    &__sickday
      > div
        &:first-child
          background-color: #F5A623
          .v-icon
            color: #F7E53B !important
      &:hover > div
        &:first-child
          background-color: darken(#F5A623, 10)
        &:last-child
          background-color: darken(#F6F6F6, 10)
    &__wfh
      > div
        &:first-child
          background-color: #F8E71C46
          .v-icon
            color: #F7E53B !important
      &:hover > div
        &:first-child
          background-color: darken(#F8E71C46, 10)
        &:last-child
          background-color: darken(#F6F6F6, 10)
    &__quarantine
      > div
        &:first-child
          background-color: #D0021B7B
          .v-icon
            color: darken(#D0021B7B, 10) !important
      &:hover > div
        &:first-child
          background-color: darken(#D0021B7B, 10)
        &:last-child
          background-color: darken(#F6F6F6, 10)
    &__response
      > div
        &:first-child
          background-color: #4A90E2
          .v-icon
            color: lighten(#4A90E2, 10) !important
      &:hover > div
        &:first-child
          background-color: darken(#4A90E2, 10)
        &:last-child
          background-color: darken(#F6F6F6, 10)
    &__test
      > div
        &:first-child
          background-color: #8FB8E0
          .v-icon
            color: lighten(#8FB8E0, 10) !important
      &:hover > div
        &:first-child
          background-color: darken(#8FB8E0, 10)
        &:last-child
          background-color: darken(#F6F6F6, 10)
.wp
  &--scrollable__y
    min-height: 100px
    max-height: 500px
    position: relative
.text
  &--day
    @include font(400, 11px)
</style>
