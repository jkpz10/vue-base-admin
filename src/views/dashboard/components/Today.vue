<template>
  <v-sheet class="card--today amber lighten-5 pa-6 mb-4 sheet--day">
    <v-overlay :value="isFetching" absolute z-index="0">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="mt-8 d-flex justify-space-around">
      <v-sheet
        color="light-green darken-1 px-4 py-2"
      >
        <div class="text-h2 white--text">
          <strong>{{ passed }}</strong> Passed
        </div>
      </v-sheet>
      <v-sheet
        color="red darken-3 px-4 py-2"
      >
        <div class="text-h2 white--text">
          <strong>{{ failed }}</strong> Failed
        </div>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('Today', {
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
  computed: {
    failed () {
      const { failed } = this.info || {}
      if (failed) {
        return failed[Object.keys(failed)[0]]
      }
      return 0
    },
    passed () {
      const { passed } = this.info || {}
      if (passed) {
        return passed[Object.keys(passed)[0]]
      }
      return 0
    },
  },
})
</script>

<style lang="sass"></style>
