<template>
  <v-container id="entries" tag="section">
    <div class="pos-relative d-flex justify-space-between align-center">
      <div class="text-h3">
        {{ companyName }}
      </div>
    </div>
    <div class="d-flex justify-space-between">
      <div class="text-h5 align-self-center">
        {{ selectedDate }}
      </div>
      <v-btn-toggle
        :value="rangeMode"
        tile
        borderless
        mandatory
        class="btn--daterange"
        @change="doUpdateRangeMode"
      >
        <v-btn class="inde btn--daterange" value="today">
          Today
        </v-btn>
        <v-btn class="inde btn--daterange" value="week">
          This Week
        </v-btn>
        <v-btn class="inde btn--daterange" value="month">
          This Month
        </v-btn>
        <v-btn ref="customDate" class="inde btn--daterange" :class="{ 'v-item--active v-btn--active': rangeMode === 'custom' }" value="custom" @click="doShowPicker">
          Custom Date
        </v-btn>
      </v-btn-toggle>
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :position-x="x"
        :position-y="y"
        transition="scale-transition"
        absolute
        offset-y
        min-width="290px"
      >
        <v-date-picker
          v-model="dates"
          no-title
          scrollable
          range
        >
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="menu = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="() => doUpdateRangeMode('x.custom')"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-menu>
    </div>
    <v-row no-gutters>
      <v-col cols="12" md="9">
        <notification-table
          v-for="(info, x) in instances"
          :key="x"
          :info="info"
          :do-update-data="doUpdateData"
          :do-refresh="doRefresh(info.key)"
          :do-export="doExport(info.key)"
          :do-view-item="doViewItem"
          :is-read="isRead"
        />
      </v-col>
      <v-col v-if="item.id" cols="12" md="3">
        <line-view
          class="mt-10 full-width"
          :do-cancel="doCancel"
          :info="item"
          :is-saving="isSaving"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'
import { find } from 'lodash'
import { mapState } from 'vuex'
import { initComponent } from '../../lib'
import { RESET_NOTIFICATION_STATE, UPDATE_NOTIFICATION_STATE, REQUEST_NOTIFICATION_FAILED_READINESS, REQUEST_NOTIFICATION_ENTRY, REQUEST_NOTIFICATION_RESPONSE, REQUEST_NOTIFICATION_QUARANTINE, REQUEST_NOTIFICATION_WFH, REQUEST_NOTIFICATION_SICKDAY, INSTANCE_KEY_FAILED_READINESS, INSTANCE_KEY_ENTRY, INSTANCE_KEY_RESPONSE, INSTANCE_KEY_QUARANTINE, INSTANCE_KEY_WFH, INSTANCE_KEY_SICKDAY, REQUEST_NOTIFICATION_READ } from '../../store/modules/notification'
import NotificationTable from './components/NotificationTable'
import LineView from './components/LineView'

export default initComponent('Notifications', {
  isPage: true,
  components: {
    NotificationTable,
    LineView,
  },
  data () {
    const { from, to } = this.$store.state.notification
    return {
      x: 0,
      y: 0,
      dates: [moment(from).format('YYYY-MM-DD'), moment(to).format('YYYY-MM-DD')],
      menu: false,
      selectedDate: this.getTodayDate(),
    }
  },
  computed: {
    ...mapState({
      rangeMode: (state) => state.notification.rangeMode,
      isSaving: (state) => state.notification.isSaving,
      item (state) {
        const { notification } = state
        return notification.item
      },
      instances (state) {
        const instances = []
        const { notification } = state
        notification.instances.forEach(key => {
          instances.push(notification[key])
        })
        return instances
      },
    }),
  },
  methods: {
    async onReady () {
      const { $store: { commit, state } } = this
      await commit(RESET_NOTIFICATION_STATE)
      await commit(UPDATE_NOTIFICATION_STATE, { company: state.app.appData.company })
      const { rangeMode } = state.notification
      await this.doUpdateRangeMode(rangeMode)
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    async doUpdateData (key, update) {
      const { commit } = this.$store
      return commit(UPDATE_NOTIFICATION_STATE, { [key]: update })
    },
    doRefresh (key) {
      return () => {
        const mapping = {
          [INSTANCE_KEY_FAILED_READINESS]: REQUEST_NOTIFICATION_FAILED_READINESS,
          [INSTANCE_KEY_ENTRY]: REQUEST_NOTIFICATION_ENTRY,
          [INSTANCE_KEY_RESPONSE]: REQUEST_NOTIFICATION_RESPONSE,
          [INSTANCE_KEY_QUARANTINE]: REQUEST_NOTIFICATION_QUARANTINE,
          [INSTANCE_KEY_WFH]: REQUEST_NOTIFICATION_WFH,
          [INSTANCE_KEY_SICKDAY]: REQUEST_NOTIFICATION_SICKDAY,
        }
        if (mapping[key]) {
          const { notification } = this.$store.state
          if (notification.company) {
            return this.$store.dispatch(mapping[key])
          }
        }
      }
    },
    isRead (item) {
      const { user } = this.$store.state.app
      return find(item.read_by || [], { user_id: user.id }) ? '' : 'error'
    },
    async doViewItem (item) {
      const { commit, dispatch } = this.$store
      await commit(UPDATE_NOTIFICATION_STATE, { item })
      await dispatch(REQUEST_NOTIFICATION_READ)
    },
    doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_NOTIFICATION_STATE, { item: {} })
    },
    doExport (key) {
      return () => {
        console.dir(key)
      }
    },
    doShowPicker (e) {
      const { left, top } = this.$refs.customDate.$el.getBoundingClientRect()
      this.x = left
      this.y = top
      this.menu = !this.menu
    },
    async doUpdateRangeMode (value) {
      const { commit, dispatch } = this.$store
      const data = { rangeMode: value }

      if (value === 'custom') {
        return ''
      }

      const mapping = {
        today: this.getTodayDate(),
        week: this.getWeekDate(),
        month: this.getMonthDate(),
      }
      this.selectedDate = mapping[value] || this.getCustomDate()

      if (value === 'x.custom') {
        this.menu = false
        data.rangeMode = 'custom'
        data.from = this.dates[0]
        data.to = this.dates[1]
        if (moment(data.to).isBefore(data.from)) {
          [data.to, data.from] = this.dates
        }
        data.from = moment(data.from)
        data.to = moment(data.to)
      } else {
        data.from = moment().startOf(value)
        data.to = moment().endOf(value)
      }

      data.from = data.from.toISOString()
      data.to = data.to.toISOString()

      await commit(UPDATE_NOTIFICATION_STATE, data)
      await Promise.all([
        dispatch(REQUEST_NOTIFICATION_FAILED_READINESS),
        dispatch(REQUEST_NOTIFICATION_ENTRY),
        dispatch(REQUEST_NOTIFICATION_RESPONSE),
        dispatch(REQUEST_NOTIFICATION_QUARANTINE),
        dispatch(REQUEST_NOTIFICATION_WFH),
        dispatch(REQUEST_NOTIFICATION_SICKDAY),
      ])
    },
    getMonthDate () {
      return `1st to ${moment().endOf('month').format('Do of MMMM, YYYY')}`
    },
    getWeekDate () {
      return `${moment().startOf('week').format('DD')} to ${moment().endOf('week').format('DD MMMM, YYYY')}`
    },
    getTodayDate () {
      const format = 'DD MMMM, YYYY, dddd'
      return moment().format(format)
    },
    getCustomDate () {
      return this.$api.getCustomDate(this.dates)
    },
  },
})
</script>
<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--table
    .input--search
      width: 250px
</style>
