<template>
  <div class="pos-relative">
    <v-expansion-panels v-model="panel">
      <v-expansion-panel>
        <v-expansion-panel-header color="#592C85" class="text--panel white--text">
          Wearables
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-overlay :value="isFetching" absolute z-index="1">
            <v-progress-circular indeterminate size="36" />
          </v-overlay>
          <div v-for="(c, i) in items" :key="i" class="wearable--wrapper">
            <v-text-field
              label="Wearable Name"
              :value="c.wearable_name"
              hide-details
              readonly
            />
            <v-text-field
              label="Wearable ID"
              :value="c.wearable_id"
              hide-details
              readonly
            />
          </div>
          <small v-if="items.length > 0" class="grey--text text--darken-2">Read Only - Changes must be made via app</small>
          <div v-else class="grey--text text--darken-2 mt-3">
            There is no item found
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('Wearables', {
  props: ['items', 'isFetching'],
  data () {
    return {
      panel: 0,
    }
  },
})
</script>

<style lang="sass" scoped>
.wearable--wrapper:not(:last-child)
  padding-bottom: 20px
</style>
