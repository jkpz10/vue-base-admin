<template>
  <v-app class="app">
    <dashboard-core-app-bar />
    <dashboard-core-drawer />
    <v-overlay :value="isFreeze">
      <v-progress-circular
        indeterminate
        size="64"
      />
    </v-overlay>
    <base-snack-bars :objects.sync="snackBars" />
    <base-forbidden v-if="isForbidden" :code="code" />
    <dashboard-core-view v-else />
  </v-app>
</template>

<script>
// import Vue from 'vue'
import { mapState } from 'vuex'
import { MODE_FORBIDDEN, MODE_FREEZE } from '../../store/modules/app'

export default {
  name: 'DashboardIndex',
  components: {
    DashboardCoreAppBar: () => import('@/components/core/AppBar'),
    DashboardCoreDrawer: () => import('@/components/core/Drawer'),
    DashboardCoreView: () => import('@/components/core/View'),
  },
  // extends: Vue.component('IndexPage'),
  data: () => ({
    expandOnHover: false,
  }),
  computed: {
    ...mapState({
      isFreeze: (state) => state.app.mode === MODE_FREEZE,
      isForbidden: (state) => state.app.mode === MODE_FORBIDDEN,
      code: (state) => state.app.code,
    }),
  },
}
</script>
