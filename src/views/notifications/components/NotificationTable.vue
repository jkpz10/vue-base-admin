<template>
  <v-card class="wp wp--table pos-relative pa-2 mr-1" outlined rounded="md">
    <v-overlay :value="info.isFetching" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <div class="d-flex justify-space-between align-center">
      <div class="d-flex flex-column ml-2 mt-2">
        <h4 class="text--card text--card__title">
          {{ title }}
        </h4>
      </div>
      <div class="d-flex align-center">
        <v-text-field
          v-model="search"
          hint="Hit enter for result. Case sensitive."
          label="Search"
          prepend-inner-icon="mdi-magnify"
          class="input--search pr-4"
          clearable
          @keyup.enter="doUpdateSearch"
          @click:clear="doClearSearch"
        />
        <div class="pos-relative d-flex flex-row-reverse">
          <v-btn class="inde btn btn--export mr-2" elevation="0" @click="doExport">
            Export <v-icon color="white" right v-text="'mdi-export-variant'" />
          </v-btn>
        </div>
      </div>
    </div>
    <v-data-table
      :headers="headers"
      :items="items"
      :options.sync="options"
      :footer-props="footerProps"
      :server-items-length="paging._total"
      class="tablelist tablelist--users"
    >
      <template v-slot:item.undread="{ item }">
        <div class="d-flex justify-center" style="width: 30px;">
          <v-icon class="body-2" :color="isRead(item)">
            mdi-circle
          </v-icon>
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <div style="width: 100px;">
          <v-btn
            small
            color="#6432906A" min-width="30" max-width="30" min-height="30" max-height="30" elevation="0"
            @click="doViewItem(item)"
          >
            <v-icon class="body-2 text-h4">
              mdi-message
            </v-icon>
          </v-btn>
          <v-btn
            small
            color="#4AD991" min-width="30" max-width="30" min-height="30" max-height="30" elevation="0"
            @click="doViewItem(item)"
          >
            <v-icon class="body-2 text-h4">
              mdi-eye
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { isEqual, pick } from 'lodash'
import { initComponent } from '../../../lib'
import { INSTANCE_KEY_FAILED_READINESS, INSTANCE_KEY_ENTRY, INSTANCE_KEY_RESPONSE, INSTANCE_KEY_QUARANTINE, INSTANCE_KEY_WFH, INSTANCE_KEY_SICKDAY } from '../../../store/modules/notification'

export default initComponent('NotificationTable', {
  props: {
    doRefresh: {
      type: Function,
      default: () => ({}),
    },
    doExport: {
      type: Function,
      default: () => ({}),
    },
    doViewItem: {
      type: Function,
      default: () => ({}),
    },
    isRead: {
      type: Function,
      default: () => ({}),
    },
  },
  data () {
    return {
      headers: [
        {
          text: 'UNREAD',
          value: 'undread',
          class: 'body-2',
          align: 'center',
        },
        {
          text: 'NAME',
          value: 'user_name',
          class: 'body-2',
        },
        {
          text: 'DATE',
          value: 'date',
          class: 'body-2',
        },
        {
          text: 'TIME',
          value: 'time',
          class: 'body-2',
        },
        {
          text: 'Email',
          value: 'user_email',
          class: 'body-2',
        },
        {
          text: 'PHONE',
          value: 'phone',
          class: 'body-2',
        },
        {
          text: 'DEPARTMENT',
          value: 'user_department',
          class: 'body-2',
        },
        {
          text: 'ACTION',
          value: 'actions',
          filterable: false,
          class: 'body-2',
        },
      ],
    }
  },
  computed: {
    search: {
      get () {
        const { paging } = this.info
        return paging.q
      },
      async set (q) {
        const { info } = this
        return this.doUpdateData(info.key, { ...info, paging: { q } })
      },
    },
    options: {
      get () {
        const { paging } = this.info
        const { _limit: itemsPerPage, _page: page } = paging
        return { page, itemsPerPage }
      },
      async set (p) {
        const { info } = this
        const paging = {
          _limit: p.itemsPerPage,
          _page: p.page,
          sort: [p.sortBy, p.sortDesc],
        }
        if (!isEqual(paging, pick(info.paging, '_limit,_page,sort'.split(',')))) {
          await this.doUpdateData(info.key, { ...info, paging })
          await this.doRefresh()
        }
      },
    },
    q () {
      const { info } = this
      return info.paging.q
    },
    items () {
      const { info } = this
      return info.items
    },
    paging () {
      const { info } = this
      return info.paging
    },
    isFetching () {
      const { info } = this
      return info.isFetching
    },
    title () {
      const { info } = this
      const mapping = {
        [INSTANCE_KEY_FAILED_READINESS]: 'Failed Readiness',
        [INSTANCE_KEY_ENTRY]: 'Missed Submission',
        [INSTANCE_KEY_RESPONSE]: 'Current Response',
        [INSTANCE_KEY_QUARANTINE]: 'Quarantine',
        [INSTANCE_KEY_WFH]: 'Work from Home',
        [INSTANCE_KEY_SICKDAY]: 'Home Not Working',
      }
      return mapping[info.key]
    },
  },
  methods: {
    async doClearSearch () {
      this.search = ''
      await this.doRefresh()
    },
    async doUpdateSearch () {
      const { info } = this
      await this.doUpdateData(info.key, { ...info, paging: { _page: 1 } })
      await this.doRefresh()
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--form
    &__right
      width: auto
</style>
