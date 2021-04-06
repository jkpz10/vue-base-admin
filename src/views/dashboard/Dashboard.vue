<template>
  <v-container v-cloak>
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
          @input="updateCustomDate"
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
    <v-row>
      <v-spacer />
      <v-col cols="5">
        <v-select
          label="Department"
          :value="department"
          :items="departments"
          item-text="name"
          item-value="id"
          placeholder="Select Department"
          @input="doUpdateDepartment"
        />
      </v-col>
    </v-row>

    <today v-if="rangeMode === 'today'" :is-fetching="isFetching" :info="range" />
    <custom v-else :is-fetching="isFetching" :info="range" />
  </v-container>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'
import Today from './components/Today'
import Custom from './components/Custom'
import { initComponent } from '../../lib'
import { REQUEST_DASHBOARD_STATS, UPDATE_DASHBOARD_DATA } from '../../store/modules/dashboard'
import { ROUTE_SURVEY_FORM, ROUTE_USER_AGREEMENT } from '../../constants'

export default initComponent('Dashboard', {
  isPage: true,
  components: {
    Today,
    Custom,
  },
  data () {
    const { from, to } = this.$store.state.dashboard
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
      departments (state) {
        return [
          {
            id: null,
            name: 'All Departments',
          },
        ].concat(state.app.appData.departments || [])
      },
      range: (state) => state.dashboard.range,
      rangeMode: (state) => state.dashboard.rangeMode,
      isFetching: (state) => state.dashboard.isFetching,
      department: (state) => state.dashboard.department,
    }),
  },
  methods: {
    async onUserRequiresToAgree () {
      const { query = {} } = this.$route
      this.$router.push({ name: ROUTE_USER_AGREEMENT, query: { ...query, redirect: ROUTE_SURVEY_FORM } })
    },
    async onReady () {
      const { commit, dispatch, state } = this.$store
      const { department } = state.dashboard
      await commit(UPDATE_DASHBOARD_DATA, { department })
      await dispatch(REQUEST_DASHBOARD_STATS)
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    async updateCustomDate (dates) {
      let [from, to] = this.dates
      if (moment(to).isBefore(from)) {
        [to, from] = this.dates
      }
      if (from && to) {
        const { commit } = this.$store
        await commit(UPDATE_DASHBOARD_DATA, {
          from: moment(from).startOf('day').toISOString(),
          to: moment(to || from).endOf('day').toISOString(),
        })
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
        return
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
      } else {
        data.from = moment().startOf(value).toISOString()
        data.to = moment().endOf(value).toISOString()
      }

      await commit(UPDATE_DASHBOARD_DATA, data)
      await dispatch(REQUEST_DASHBOARD_STATS)
    },
    getMonthDate () {
      return `1st to ${moment().endOf('month').format('Do of MMMM, YYYY')}`
    },
    getWeekDate () {
      return `${moment().startOf('week').format('DD')} to ${moment().endOf('week').format('DD MMMM, YYYY')}`
    },
    getTodayDate () {
      const format = 'hh:mm:ss A - DD MMMM, YYYY, dddd'
      return moment().format(format)
    },
    getCustomDate () {
      return this.$api.getCustomDate(this.dates)
    },
    async doUpdateDepartment (department) {
      const { state, dispatch, commit } = this.$store
      if (state.dashboard.department !== department) {
        await commit(UPDATE_DASHBOARD_DATA, { department })
        await dispatch(REQUEST_DASHBOARD_STATS)
      }
    },
  },
})
</script>
<style lang="sass" scoped>
.card
  &--today, &--week, &--month
    position: relative
.btn
  &--daterange
    .v-btn
      margin-bottom: 0px !important
      margin-right: 0px !important
</style>
