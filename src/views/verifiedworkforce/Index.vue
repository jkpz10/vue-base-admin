<template>
  <v-app
    v-if="showListofVerifiedUser"
    id="VerifiedWorkersList"
  >
    <dashboard-core-scan-app-bar />
    <v-container
      class="fill-height"
      fluid
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          v-if="verifiedWorkforceData.length > 0"
          cols="12"
          sm="11"
          md="10"
        >
          <v-card>
            <v-row
              v-for="(vfData, index) in verifiedWorkforceData"
              :key="`fruit-${index}`"
            >
              <v-col
                cols="4"
                sm="6"
                md="4"
                lg="4"
                xl="3"
              >
                <v-avatar
                  size="150"
                  style="position:absolute; top: -10px; left: -50px; border:5px solid #fff;"
                >
                  <img
                    v-if="vfData.user_img !== undefined"
                    :src="vfData.user_img"
                  >
                  <img
                    v-else
                    src="@/assets/default-user-avatar.jpg"
                  >
                </v-avatar>

                <v-avatar
                  color="success"
                  style="position:absolute; top: 60px; left: 65px;"
                >
                  <v-icon dark>
                    mdi-check
                  </v-icon>
                </v-avatar>
              </v-col>
              <v-col
                cols="7"
                sm="8"
                md="8"
              >
                <p class="pl-1">
                  {{ vfData.name }}
                </p>
                <b class="pl-1 mb-0">Last Verified</b>
                <p class="pl-1 mb-0">
                  Today
                </p>
                <p class="pl-1 mb-0">
                  {{ new Date(vfData.created_at).toLocaleString() }}
                </p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col
          v-else
          cols="12"
          sm="11"
          md="3"
        >
          <v-card>
            <v-row>
              <v-col
                cols="12"
              >
                <v-alert
                  color="warning"
                  class="white--text text-center ma-2"
                >
                  No Entries for Today
                </v-alert>

                <v-btn
                  small
                  depressed
                  color="primary"
                  class="ma-2"
                  @click="showListofVerifiedUser = false"
                >
                  Go Back
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>

  <v-app
    v-else
    id="VerifiedWorkersFacilityList"
  >
    <dashboard-core-scan-app-bar />
    <v-container
      class="fill-height"
      fluid
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="7"
          md="3"
          lg="4"
        >
          <v-card class="elevation-12">
            <v-toolbar
              color="primary"
              dark
              flat
            >
              <v-row
                no-gutters
                style="height: 64px;"
              >
                <v-col
                  cols="12"
                  sm="6"
                  align-self="center"
                  class="display-2"
                >
                  Select Facility
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  align-self="center"
                >
                  <v-img
                    src="@/assets/company-logo.png"
                    height="60"
                    contain
                  />
                </v-col>
              </v-row>
            </v-toolbar>
            <v-card-text>
              <v-form
                ref="form"
                v-model="formValid"
                lazy-validation
              >
                <v-select
                  v-model="facilitySelected"
                  :rules="facilitySelectedRules"
                  :items="facilityListData"
                  item-text="text"
                  item-value="value"
                  required
                  class="purple-input"
                  label="Select Facility"
                />
              </v-form>
              <v-alert
                v-if="showMessageAlert"
                color="error"
                class="white--text text-center mb-0"
              >
                {{ showMessage }}
              </v-alert>
            </v-card-text>
            <v-card-actions
              class="px-5 pt-0"
              style="height:80px;"
            >
              <v-progress-circular
                v-if="processingUpdate"
                indeterminate
                color="primary"
                class="my-3 mr-3"
              />
              <v-btn
                v-if="processingUpdate === false"
                color="primary"
                right
                absolute
                @click="validate"
              >
                Select <v-icon right>
                  mdi-send
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  name: 'VerifiedWorkForce',
  components: {
    DashboardCoreScanAppBar: () => import('@/components/core/ScanAppBar'),
  },
  data () {
    return {
      companyID: this.$cookies.get('_VCUcid'),
      dateToday: new Date(),
      showMessageAlert: false,
      showMessage: '',
      formValid: false,
      facilityListData: [],
      facilitySelected: '',
      facilitySelectedRules: [
        v => !!v || 'Facility is required',
      ],
      processingUpdate: false,
      showListofVerifiedUser: false,
      userListData: [],
      verifiedWorkforceData: [],
    }
  },
  mounted: function () {
    this.getUserList()
    this.getFacilityList()
  },
  methods: {
    getUserList: function () {
      var self = this.$data
      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/user',
      }).then(function (response) {
        // console.log(response.data.data.items)
        self.userListData = response.data.data.items
      }, (error) => {
        console.log(error)
      })
    },
    getFacilityList: function () {
      var self = this.$data

      self.processingUpdate = true

      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/facility',
      }).then(function (response) {
        // console.log(response)
        self.facilityListData = response.data.data.items.map(function (itemData) {
          return {
            text: itemData.name,
            value: itemData.id,
          }
        })

        self.processingUpdate = false
      }, (error) => {
        console.log(error)
        // this.$router.push('/signout')
      })
    },
    validate () {
      var self = this
      this.$refs.form.validate()

      if (self.formValid === true && self.facilitySelected !== '') {
        self.processingUpdate = true
        self.showListofVerifiedUser = true
        this.getVerifiedWorkforceToday()
      }
    },
    getVerifiedWorkforceToday: function () {
      var self = this.$data

      self.processingUpdate = true

      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/events/' + self.companyID,
        params: {
          today: self.dateToday.toISOString(),
          no_paging: 1,
        },
      }).then(function (response) {
        self.processingUpdate = false

        self.verifiedWorkforceData = []

        var verifiedWorkforceDataArr = []

        response.data.data.items.map(function (itemData) {
          if (self.facilitySelected === itemData.facility_id && itemData.type === 'entry') {
            var userDataArr = self.userListData.filter(function (userData) {
              if (itemData.user_id === userData.id) {
                return userData
              }
            })

            verifiedWorkforceDataArr.push({
              created_at: itemData.created_at,
              name: itemData.user_name,
              user_img: userDataArr[0].url,
            })
          }
        })

        self.verifiedWorkforceData = verifiedWorkforceDataArr

        console.log(self.facilitySelected)
        console.log(self.verifiedWorkforceData)
      }, (error) => {
        console.log(error)
        self.processingUpdate = false
      })
    },
  },
}
</script>
