<template>
  <v-container
    id="entryList"
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title>
            {{ reportListTitle }}

            <v-spacer />

            <v-btn
              small
              depressed
              color="info"
            >
              EXPORT
              <v-btn
                icon
                color="white"
                class="p-0"
                @click="exportExcel"
              >
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                sm="4"
                md="3"
                lg="2"
                class="pb-0"
              >
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                  class="py-0 my-0"
                  @change="getReportData"
                />
              </v-col>
              <v-col
                cols="12"
                sm="4"
                md="3"
                lg="2"
                class="pb-0"
              >
                <v-menu
                  v-model="dateFromMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateFrom"
                      label="Date From"
                      readonly
                      v-bind="attrs"
                      class="py-0 my-0"
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="dateFrom"
                    @input="dateFromMenu = false"
                    @change="getReportData"
                  />
                </v-menu>
              </v-col>
              <v-col
                cols="12"
                sm="4"
                md="3"
                lg="2"
                class="pb-0"
              >
                <v-menu
                  v-model="dateToMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateTo"
                      label="Date To"
                      readonly
                      v-bind="attrs"
                      class="py-0 my-0"
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="dateTo"
                    @input="dateToMenu = false"
                    @change="getReportData"
                  />
                </v-menu>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="pb-0 pt-0"
              >
                <label class="body-1 pr-2 d-block">Type</label>
                <v-checkbox
                  v-model="reportTypeFilter"
                  label="Entry"
                  value="entry"
                  class="py-0 my-0 d-inline-flex"
                />

                <v-checkbox
                  v-model="reportTypeFilter"
                  label="Send"
                  value="send"
                  class="py-0 my-0 d-inline-flex"
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="pb-0 pt-0"
              >
                <label class="body-1 pr-2 d-block">Readiness</label>
                <v-checkbox
                  v-model="readinessFilter"
                  label="True"
                  value="true"
                  class="py-0 my-0 d-inline-flex"
                />

                <v-checkbox
                  v-model="readinessFilter"
                  label="False"
                  value="false"
                  class="py-0 my-0 d-inline-flex"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="3"
                class="pb-0"
              >
                <v-select
                  v-model="userFilter"
                  :items="userListData"
                  item-text="text"
                  item-value="value"
                  required
                  class="purple-input"
                  label="Filter User"
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="3"
                class="pb-0"
              >
                <v-select
                  v-model="departmentFilter"
                  :items="departmentListData"
                  item-text="text"
                  item-value="value"
                  required
                  class="purple-input"
                  label="Filter Department"
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="3"
                class="pb-0"
              >
                <v-select
                  v-model="facilityFilter"
                  :items="facilityListData"
                  item-text="text"
                  item-value="value"
                  required
                  class="purple-input"
                  label="Filter Facility"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="reportListData"
              :loading="isLoadingreportListData"
              loading-text="Loading Data..."
            >
              <template v-slot:item="row">
                <tr
                  :id="row.item.id"
                >
                  <td class="body-2">
                    {{ row.item.created_at | moment("lll") }}
                  </td>
                  <td class="body-2">
                    {{ row.item.type }}
                  </td>
                  <td class="body-2">
                    {{ row.item.type === 'entry' ? 'true' : row.item.readiness_approved }}
                  </td>
                  <td class="body-2">
                    {{ row.item.user_name }}
                  </td>
                  <td class="body-2">
                    {{ row.item.user_department }}
                  </td>
                  <td class="body-2">
                    {{ row.item.facility_name }}
                  </td>
                  <td class="body-2">
                    {{ row.item.type === 'send' ? '' : row.item.approved_by }}
                  </td>
                  <td class="body-2">
                    {{ row.item.user_reporting_mgr }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Reporting',
  data () {
    return {
      companyID: this.$cookies.get('_VCUcid'),
      dateFromMenu: false,
      dateToMenu: false,
      dateFrom: new Date().toISOString().substr(0, 10),
      dateTo: new Date().toISOString().substr(0, 10),
      search: '',
      reportTypeFilter: ['entry', 'send'],
      readinessFilter: ['true', 'false'],
      facilityFilter: 'all',
      facilityListData: [],
      departmentFilter: 'all',
      departmentListData: [],
      userFilter: 'all',
      userListData: [],
      headers: [
        {
          text: 'DATE',
          value: 'created_at',
          class: 'body-2',
        },
        {
          text: 'TYPE',
          value: 'type',
          class: 'body-2 text-center',
        },
        {
          text: 'READINESS',
          value: 'readiness_approved',
          class: 'body-2 text-center',
        },
        {
          text: 'USER',
          value: 'user_name',
          class: 'body-2',
        },
        {
          text: 'DEPARTMENT',
          value: 'user_department',
          class: 'body-2',
        },
        {
          text: 'FACILITY',
          value: 'facility_name',
          class: 'body-2',
        },
        {
          text: 'ADMITTED BY',
          value: 'approver_name',
          class: 'body-2',
        },
        {
          text: 'REPORTING MANAGER',
          value: 'user_reporting_mgr',
          class: 'body-2',
        },
      ],
      isLoadingreportListData: true,
      reportListTitle: 'Reporting',
      reportListData: [],
      reportListDataTMP: [],
    }
  },
  computed: {
  },
  watch: {
    reportTypeFilter (val) {
      if (val !== null && val !== undefined) {
        this.customFilter()
      }
    },
    readinessFilter (val) {
      if (val !== null && val !== undefined) {
        this.customFilter()
      }
    },
    userFilter (val) {
      if (val !== null && val !== undefined) {
        this.customFilter()
      }
    },
    facilityFilter (val) {
      if (val !== null && val !== undefined) {
        this.customFilter()
      }
    },
    departmentFilter (val) {
      if (val !== null && val !== undefined) {
        this.customFilter()
      }
    },
  },
  mounted: function () {
    var self = this.$data

    self.dateFrom = this.$moment().format('YYYY-MM-DD')
    self.dateTo = this.$moment().format('YYYY-MM-DD')

    this.getUserList()
    this.getFacilityList()
    this.getDepartmentList()
    this.getReportData()
  },
  methods: {
    getUserList: function () {
      var self = this.$data

      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/user/company/' + this.$cookies.get('_VCUcid'),
      }).then(function (response) {
        // console.log(response)
        self.userListData.push({
          text: 'All',
          value: 'all',
        })

        response.data.data.items.map(function (itemData) {
          self.userListData.push({
            text: itemData.name,
            value: itemData.id,
          })
        })
      }, (error) => {
        console.log(error)
      })
    },
    getFacilityList: function () {
      var self = this.$data

      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/facility',
      }).then(function (response) {
        // console.log(response)
        self.facilityListData.push({
          text: 'All',
          value: 'all',
        })

        response.data.data.items.map(function (itemData) {
          self.facilityListData.push({
            text: itemData.name,
            value: itemData.id,
          })
        })
      }, (error) => {
        console.log(error)
      })
    },
    getDepartmentList: function () {
      var self = this.$data
      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/department',
      }).then(function (response) {
        // console.log(response)
        self.departmentListData.push({
          text: 'All',
          value: 'all',
        })

        response.data.data.items.map(function (itemData) {
          self.departmentListData.push({
            text: itemData.name,
            value: itemData.name,
          })
        })
      }, (error) => {
        console.log(error)
      })
    },
    getReportData: function () {
      var pageFunctions = this
      var self = this.$data

      self.isLoadingreportListData = true

      var paramsData = {}

      paramsData.from = this.$moment(self.dateFrom).utc().toISOString()
      paramsData.to = this.$moment(self.dateT).utc().toISOString()
      paramsData.report = 1

      if (self.search !== null && self.search !== undefined && self.search.length > 0) {
        paramsData.q = self.search
      }

      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/events/' + self.companyID + '/date-range',
        params: paramsData,
      }).then(function (response) {
        // console.log(response.data.data.items)
        self.reportListDataTMP = response.data.data.items
        pageFunctions.customFilter()
        self.isLoadingreportListData = false
      }, (error) => {
        console.log(error)
        // this.$router.push('/signout')
        self.isLoadingreportListData = false
      })
    },
    customFilter: function () {
      var self = this.$data

      if (self.reportTypeFilter.length > 0 && self.readinessFilter.length > 0) {
        if (self.reportListDataTMP.length > 0) {
          self.reportListData = self.reportListDataTMP.filter(function (item) {
            let readinessApproved = item.type === 'entry' ? true : item.readiness_approved
            readinessApproved = String(readinessApproved)

            // console.log(self.readinessFilter + ' --- ' + readinessApproved)
            // console.log(self.reportTypeFilter.indexOf(item.type) + ' --- ' + self.readinessFilter.indexOf(readinessApproved))
            if (
              self.reportTypeFilter.indexOf(item.type) !== -1 &&
              self.readinessFilter.indexOf(readinessApproved) !== -1 &&
              (self.userFilter === 'all' || self.userFilter === item.user_id) &&
              (self.facilityFilter === 'all' || self.facilityFilter === item.facility_id) &&
              (self.departmentFilter === 'all' || self.departmentFilter === item.user_department)
            ) {
              return item
            }
          })
        }
      } else {
        self.reportListData = []
      }
    },
    exportExcel: function () {},
  },
}
</script>
