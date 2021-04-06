<template>
  <v-card
    v-bind="$attrs"
    class="user-card v-card--material pa-3"
  >
    <div
      v-if="mode !== 'MODE_ADD'"
      class="d-flex grow flex-wrap"
    >
      <v-avatar
        size="128"
        class="mx-auto v-card--material__avatar elevation-6"
        color="grey"
      >
        <v-img :src="info.url" />
        <v-btn
          x-small
          class="ml-4"
          color="transparent"
        >
          edit
        </v-btn>
        <v-file-input
          v-model="avatar"
          hide-input
          accept="image/*"
          truncate-length="15"
          class="avatar"
        />
      </v-avatar>
    </div>

    <h4
      v-else
      class="card-title font-weight-light mt-2 ml-2 mb-5"
    >
      Add User
    </h4>

    <slot />

    <v-card-text class="mt-n8 text-center">
      <v-select
        v-model="info.company_id"
        :items="companies"
        label="Company"
      />
      <v-text-field
        v-model="info.name"
        label="Name"
      />
      <v-text-field
        v-model="info.email"
        label="Email"
      />
      <v-text-field
        v-model="info.phone"
        label="Phone #"
      />
      <v-select
        v-if="!allUser"
        v-model="info.department"
        :items="departments"
        label="Deparment"
      />
      <v-text-field
        v-else
        readonly
        label="Department"
        :value="info.department"
      />

      <v-text-field
        v-model="info.email"
        label="Reporting Manager"
      />
      <v-select
        v-model="info.group"
        :items="userGroups"
        label="User Group"
      />
      <v-switch
        v-model="info.status"
        value="active"
        :label="$t(`user_status.${userStatus}`)"
      />
    </v-card-text>

    <template v-if="$slots.actions">
      <v-card-actions class="pt-0">
        <slot name="actions" />
      </v-card-actions>
    </template>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import i18n from '../../i18n'
export default {
  name: 'UserCard',

  props: {
    allUser: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    mode: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    avatar: null,
  }),
  computed: {
    userStatus () {
      return this.info.status || 'inactive'
    },
    ...mapState({
      companies: (state) => state.app.companyList.map(item => ({
        text: item.name,
        value: item.id,
      })),
      departments: (state) => [],
      userGroups: (state) => state.app.groupList.map(item => ({
        text: i18n.t(`user_group.${item.name}`),
        value: item.name,
      })),
    }),
  },
}
</script>

<style lang="sass">
  .v-card--material
      min-width: 320px
      &__avatar
        position: relative
        top: -64px
        margin-bottom: -32px
        .v-btn
          position: absolute
          bottom: 1px
          margin: 0px auto
        &__heading
          position: relative
          top: -40px
          transition: .3s ease
          z-index: 1
      .v-input.avatar
          display: none
</style>
