<template>
  <v-navigation-drawer
    v-model="drawer"
    :mini-variant.sync="mini"
    app
  >
    <!-- Company Logo  -->
    <div class="top-container">
      <!-- <v-list flat> -->
        <!-- <v-list-item two-line>
          <v-list-item-content class="tw-text-left">
            <v-list-item-title>COMPANY LOGO</v-list-item-title>
            <v-list-item-subtitle>
              <AtomText text="V 1.0.0"/>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list> -->
      <!-- User Account -->
      <v-list class="tw-pt-0">
        <v-list-item class="tw-px-2" link>
          <v-list-item-avatar>
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="title">
              John Leider
            </v-list-item-title>
            <v-list-item-subtitle>john@vuetifyjs.com</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <!-- <v-icon>mdi-menu-down</v-icon> -->
            <v-btn
              class="tw-hidden xl:tw-block"
              icon
              @click.stop="doToggleMini"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-system-bar class="tw-justify-center">
        <AtomText text="Admin" />
      </v-system-bar>
    </div>
    
    <!-- Side Nav -->
    <v-list
      class="tw-relative tw-top-28"
      nav
      dense
    >
      <template v-for="(item, i) in items">
        <!-- v-model="selectedItem" -->
        <v-list-item
          v-if="!item.subs"
          :key="i"
          :to="item.to"
          link
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title class="tw-text-left"> 
              <AtomText :text="item.text" />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        
        <v-list-group
          v-else
          :value="false"
          :key="i"
          no-action
          :prepend-icon="item.icon"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title class="tw-text-left" >
                <AtomText :text="item.text" />
              </v-list-item-title>
            </v-list-item-content>
          </template>

          <template v-for="(subs, subIdx) in item.subs">

            <v-list-item
              v-if="!subs.subs"
              :key="subIdx"
              link
            >
              <v-list-item-title class="tw-text-left">
                <AtomText :text="subs.text" />
              </v-list-item-title>
            </v-list-item>

            <v-list-group
              v-if="subs.subs"
              :key="subIdx"
              :value="false"
              no-action
              sub-group
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title class="tw-text-left">
                    <AtomText :text="subs.text" />
                  </v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item
                v-for="([title, icon], i) in subs.subs"
                :key="i"
                link
              >
                <v-list-item-title>
                  <AtomText :text="title" />
                </v-list-item-title>

                <v-list-item-icon>
                  <v-icon v-text="icon"></v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list-group>
          </template>
        </v-list-group>
      </template>
      
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import {
  mapState,
  mapMutations,
} from 'vuex'
import { TOGGLE_MINI, TOGGLE_DRAWER } from '@/store/modules/app'


//components
import AtomText from '@/components/atoms/Text';


export default {
  name: 'DashboardCoreDrawer',
  components: {
    AtomText,
  },
  data: () => ({
    selectedItem: 0,
    items: [
      { text: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
      {
        text: 'Users',
        icon: 'fa-users',
        subs: [
          {
            text: 'Admin',
            subs: [
              ['Management', 'mdi-account-multiple-outline'],
              ['Settings', 'mdi-cog-outline'],
            ],
          },
          {
            text: 'Employees',
            subs: null,
          }
        ],

        
      },
      { text: 'Companies', icon: 'fa-network-wired' },
      { text: 'Starred', icon: 'fa-star' },
      { text: 'Online', icon: 'fa-check-circle' },
      { text: 'Recent', icon: 'fa-history' },
    ],
  }),
  computed: {
    ...mapState({
      // state here
    }),
    drawer: {
      get () {
        const { state } = this.$store;
        // console.log('drawer', state.app.drawer)
        return state.app.drawer
      },
      set (val) {
        const {commit} = this.$store
        commit(TOGGLE_DRAWER, val)
        if(val) {
          commit(TOGGLE_MINI, false)
        }
      },
    },
    mini: {
      get () {
        const { state } = this.$store;
        return state.app.mini
      },
      set (val) {
        const {commit} = this.$store
        commit(TOGGLE_MINI, val)
      },
    },
  },
  methods: {
    ...mapMutations({
      // setDrawer: 'SET_DRAWER',
      // setMini: 'SET_MINI',
    }),
    doToggleMini () {
      this.$store.commit(TOGGLE_MINI)
    },
  },
}
</script>

<style lang="sass" scoped>
.top-container
  @apply tw-bg-white tw-border-0 tw-border-gray-300 tw-border-opacity-70 tw-border-r tw-border-solid tw-fixed tw-shadow tw-z-10

</style>