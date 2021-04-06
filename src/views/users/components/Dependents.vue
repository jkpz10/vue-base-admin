<template>
  <div>
    <v-overlay :value="isFetching" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-expansion-panels v-model="panel">
      <v-expansion-panel va>
        <v-expansion-panel-header color="#592C85" class="text--panel white--text">
          Dependents
        </v-expansion-panel-header>
        <v-expansion-panel-content class="mx-n2">
          <div class="d-flex justify-start pt-5">
            <div v-for="(c, i) in items" :key="i" class="mr-3 d-flex flex-column align-center">
              <v-avatar class="avatar--dependents">
                <img
                  v-if="c.url"
                  :src="c.url"
                  :alt="c.name"
                >
              </v-avatar>
              <span class="mt-3 text-caption">{{ c.name }}</span>
            </div>
            <div class="pos-relative">
              <v-avatar class="avatar--add avatar--dependents" color="white" @click="doAdd">
                <v-icon dark color="black" large>
                  mdi-plus-circle-outline
                </v-icon>
              </v-avatar>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('Dependents', {
  props: {
    items: {
      type: Array,
      default: [],
    },
    isFetching: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      panel: 0,
    }
  },
  methods: {
    async doAdd () {

    },
  },
})
</script>

<style lang="sass" scoped>
.avatar
  &--dependents
    box-shadow: 0px 1px 3px #00000033
    border: 1px solid #fff
  &--add
    cursor: pointer
</style>
