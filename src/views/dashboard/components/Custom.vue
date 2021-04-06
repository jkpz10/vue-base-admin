<template>
  <v-sheet class="card--today amber lighten-5 pa-6 mb-4 sheet--day">
    <v-overlay :value="isFetching" absolute z-index="0">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <line-chart
      :chart-data="chartData"
      :options="chartOptions"
    />
  </v-sheet>
</template>

<script>
import moment from 'moment'
import { initComponent } from '../../../lib'
import LineChart from './LineChart'

export default initComponent('Custom', {
  components: {
    LineChart,
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
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    }
  },
  computed: {
    chartData () {
      const { passed = {}, failed = {} } = this.info
      let labels = Object.keys(passed).map((x) => x)
      if (Object.keys(passed).length === 1) {
        const d = Object.keys(passed)[0]
        let from = moment(d).subtract(2, 'days')
        const to = moment(d).add('2', 'days')
        labels = []
        while (to.isAfter(from)) {
          labels.push(from.format('YYYY-MM-DD'))
          from = from.add(1, 'days')
        }
      }
      return {
        labels: labels.map((x) => moment(x).format('MM-DD')),
        datasets: [
          {
            label: 'Passed',
            backgroundColor: '#7ED321',
            data: labels.map((x) => passed[x] || 0),
          },
          {
            label: 'Failed',
            backgroundColor: '#D0021B',
            data: labels.map((x) => failed[x] || 0),
          },
        ],
      }
    },
  },
})
</script>

<style lang="sass"></style>
