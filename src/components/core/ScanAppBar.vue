<template>
  <v-app-bar
    :clipped-left="$vuetify.breakpoint.lgAndUp"
    app
  >
    <v-app-bar-nav-icon
      class="white--text hidden-md-and-up"
      to="/"
    />
    <v-toolbar-title
      class="ml-0 pl-0 white--text"
      @click="setDrawer(!drawer)"
    >
      <v-img
        src="@/assets/company-logo.png"
        height="50"
        contain
        position="left center"
      />
    </v-toolbar-title>

    <v-toolbar-title
      class="ml-0 pl-0 white--text"
    >
      Employees at this location are <br>
      verified Workplace Ready
    </v-toolbar-title>

    <v-spacer />

    <v-avatar color="success">
      <v-icon dark>
        mdi-check
      </v-icon>
    </v-avatar>

    <v-toolbar-title
      class="ml-2 pl-0 white--text"
    >
      The green check indicates that the individual has met <br>  the workplace standards before entering the facility.
    </v-toolbar-title>
  </v-app-bar>
</template>

<script>
// Components
// import axios from 'axios'
// import { VHover, VListItem } from 'vuetify/lib'

// Utilities
import { mapState, mapMutations } from 'vuex'
import { TOGGLE_DRAWER } from '../../store/modules/app'

export default {
  name: 'EntryScanAppBar',

  components: {
  },

  props: {
  },

  data: () => ({
  }),

  computed: {
    ...mapState(['drawer']),
  },

  methods: {
    ...mapMutations({
      setDrawer: TOGGLE_DRAWER,
    }),
  },
}
</script>
