<template>
  <v-app-bar app>
    <v-app-bar-nav-icon class="xl:tw-hidden" @click="doToggleDrawer()"></v-app-bar-nav-icon>
    <div class="tw-flex tw-w-full tw-justify-between">
      <v-toolbar-title>
        <AtomText :text="$route.name" />
      </v-toolbar-title>

      <v-badge
        bordered
        color="error"
        dot
        overlap
      >
        <v-icon>fa-bell</v-icon>
      </v-badge>
      
    </div>
  </v-app-bar>
</template>

<script>

// Utilities
import { mapState } from 'vuex'
import { TOGGLE_DRAWER } from '@/store/modules/app'


// Components 
import AtomText from '@/components/atoms/Text'

export default {
  name: 'DashboardCoreAppBar',
  components : {
    AtomText,
  },

  computed: {
    ...mapState({
      // state here
    }),
  },

  methods: {
    // ...mapMutations({
    //   setDrawer: 'SET_DRAWER',
    // }),
    doToggleDrawer () {
      this.$store.commit(TOGGLE_DRAWER)
    },
  },
}
</script>

<style>

</style>