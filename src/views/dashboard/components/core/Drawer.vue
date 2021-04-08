<template>
  <v-navigation-drawer
      v-model="drawer"
      app
    >
      <!--  -->
    </v-navigation-drawer>
</template>

<script>
import {
  mapState,
} from 'vuex'

export default {
  name: 'DashboardCoreDrawer',

  computed: {
    ...mapState({}),
    drawer: {
      get () {
        const { state } = this.$store;
        return state.drawer
      },
      set (val) {
        const {commit} = this.$store
        commit('SET_DRAWER', val)
      },
    },
  },
}
</script>

<style>

</style>