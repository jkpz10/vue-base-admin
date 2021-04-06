<template>
  <v-app-bar
    :clipped-left="$vuetify.breakpoint.lgAndUp"
    class="app-bar"
    app
  >
    <v-app-bar-nav-icon
      class="white--text hidden-md-and-up"
      @click="doToggleDrawer"
    />

    <v-toolbar-title
      class="ml-0 pl-0 white--text"
      @click="doToggleDrawer"
    >
      <v-img
        src="@/assets/company-logo.png"
        height="50"
        contain
        position="left center"
      />
    </v-toolbar-title>

    <v-spacer />

    <v-menu
      bottom
      left
      offset-y
      origin="top right"
      transition="slide-x-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          icon
          color="white"
          v-bind="attrs"
          v-on="on"
          @mouseenter="isDot = false"
          @mouseleave="isDot = true"
        >
          <v-badge
            color="error"
            :content="notifications.length.toString()"
            :value="notifications.length"
            overlap
            :dot="isDot"
          >
            <v-icon v-text="'mdi-bell'" />
          </v-badge>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(notif, index) in notifications"
          :key="index"
        >
          <v-list-item-title v-text="notif" />
        </v-list-item>
        <v-list-item v-if="notifications.length <= 0">
          <v-list-item-title v-text="'Hooray! Zero notification!'" />
        </v-list-item>
      </v-list>
    </v-menu>

    <div class="mx-1" />

    <v-menu
      bottom
      left
      offset-y
      origin="top right"
      transition="slide-x-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-avatar
          color="white"
          size="42"
          v-bind="attrs"
          v-on="on"
        >
          <img
            v-if="avatar"
            :src="avatar"
            alt="Avatar"
          >
          <v-icon
            v-else
            color="black"
            v-text="'mdi-account'"
          />
        </v-avatar>
      </template>
      <v-list>
        <v-list-item
          v-for="(menu, index) in menus"
          :key="index"
          @click.stop.prevent="doGoTo(menu)"
        >
          <v-list-item-title v-text="menu.title" />
        </v-list-item>
      </v-list>
    </v-menu>
    <div class="mx-3" />
  </v-app-bar>
</template>

<script>
import { startCase } from 'lodash'
import { mapState } from 'vuex'
import { TOGGLE_DRAWER } from '../../store/modules/app'
import { ROUTE_MYACCOUNT, ROUTE_SIGNOUT } from '../../constants'

export default {
  name: 'DashboardCoreAppBar',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    isDot: true,
    menus: [
      {
        title: startCase(ROUTE_MYACCOUNT),
        to: ROUTE_MYACCOUNT,
      },
      {
        title: startCase(ROUTE_SIGNOUT),
        to: ROUTE_SIGNOUT,
      },
    ],
  }),

  computed: {
    ...mapState({
      avatar: (state) => state.app.user.url,
      notifications: (state) => state.app.appData.notifications || [],
    }),
  },

  methods: {
    doToggleDrawer () {
      this.$store.commit(TOGGLE_DRAWER)
    },
    doGoTo ({ to }) {
      if (this.$route.name !== to) {
        return this.$router.push({ name: to })
      }
    },
  },
}
</script>
