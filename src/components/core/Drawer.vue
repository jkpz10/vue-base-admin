<template>
  <v-navigation-drawer
    id="core-navigation-drawer"
    v-model="drawer"
    :clipped="$vuetify.breakpoint.lgAndUp"
    :right="$vuetify.rtl"
    mobile-break-point="960"
    width="260"
    v-bind="$attrs"
    app
  >
    <v-subheader
      v-if="$api.allowedToCompanies(role)"
      class="header header--admin"
    >
      ADMIN
    </v-subheader>

    <v-list
      v-if="$api.isSuperuser(role)"
      expand
      nav
      class="mb-2"
      dense
    >
      <v-list-item-group>
        <v-list-item
          v-for="(item, i) in rootMenuList"
          :key="i"
          :to="item.to"
          class="menu-link"
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-subheader
      v-if="$api.isSuperuser(role)"
      class="header"
    >
      COMPANY
    </v-subheader>

    <v-list
      expand
      nav
      dense
    >
      <v-select
        v-if="$api.isSuperuser(role)"
        :value="company"
        :items="companyList"
        item-text="name"
        item-value="id"
        label="Select Company"
        class="input--company mx-1"
        @input="doUpdateSelectedCompany"
      />

      <v-list-item-group>
        <v-list-item
          v-for="(item, i) in menuList"
          :key="i"
          :to="item.to"
          class="menu-link"
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { find } from 'lodash'
import { mapState, mapActions } from 'vuex'
import { EV_CHANGE_SELECTED_COMPANY, TOGGLE_DRAWER, UPDATE_APP_DATA } from '../../store/modules/app'

export default {
  name: 'DashboardCoreDrawer',
  props: {
    expandOnHover: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({}),
  computed: {
    drawer: {
      get () {
        return this.$store.state.app.drawer
      },
      set (val) {
        this.$store.commit(TOGGLE_DRAWER, val)
      },
    },
    ...mapState({
      company: (state) => state.app.appData.company,
      companyList: (state) => state.app.appData.companies,
      rootMenuList: (state) => state.app.user.rootMenuList,
      menuList: (state) => state.app.user.menuList,
    }),
  },
  methods: {
    ...mapActions({
      async doUpdateSelectedCompany (dispatch, company) {
        const { companyList } = this
        const companyName = (find(companyList, { id: company }) || {}).name
        await dispatch(UPDATE_APP_DATA, { company, companyName })
        await dispatch(EV_CHANGE_SELECTED_COMPANY)
      },
    }),
  },
}
</script>
<style lang="sass" scoped>
@import "@/sass/_app"

.header
  @include font(400)
  color: #fff
  font-size: 18px
  background: #2277BA 0% 0% no-repeat padding-box
  &--admin
    background: #643290 0% 0% no-repeat padding-box
.input
  &--company
    @include font(400, 14px, 'Roboto')
.menu-link
  .v-icon
    @include font(700, 20px)
    color: #2F96DE
  .v-list-item__title
    @include font(400, 12px, 'Roboto')
    color: #484848
  &:hover
    .v-list-item__title
      color: darken(#484848, 40)
    .v-icon
      color: darken(#2F96DE, 40)
</style>
