<template>
  <v-app-bar app>
      <v-app-bar-nav-icon @click="setDrawer(!drawer)"></v-app-bar-nav-icon>

      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>
</template>

<script>

// Utilities
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'DashboardCoreAppBar',

  computed: {
    ...mapState(['drawer']),
  },

  methods: {
    ...mapMutations({
      setDrawer: 'SET_DRAWER',
    }),
  },
}
</script>

<style>

</style>