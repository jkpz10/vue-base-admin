<template>
  <v-container
    id="billing"
    tag="section"
  >
    <v-row
      class="d-flex"
      justify="center"
    >
      <v-col cols="12">
        <v-card class="pa-7 my-0">
          <v-card-title class="pl-0">
            Billing
          </v-card-title>
          <v-row>
            <v-col
              cols="12"
              md="5"
            >
              <v-card
                class="mt-0"
                outlined
                tile
                :loading="processingSubscriptionInfo"
              >
                <v-system-bar
                  color="primary"
                  class="pa-2 py-5 white--text text-right"
                >
                  <b class="col-12">PLATFORM SUBSCRIPTION INFO</b>
                </v-system-bar>

                <v-card-text>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      class="body-2"
                    >
                      <b>Subscription Status: </b> {{ subscriptionData.subscription_status }}
                      <br>
                      <b>Subscription Users: </b> {{ subscriptionData.subscription_users }}
                      <br>
                      <b>Active Users: </b> {{ subscriptionData.active_users }}
                      <br>
                      <b>Subscription Period: </b> {{ subscriptionData.subscription_period }}
                      <br>
                      <b>Subscription Adjustment: </b> {{ subscriptionData.subscription_adjustment }}
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      class="body-2"
                    >
                      <b>Renewal Date: </b> {{ subscriptionData.renewal_date }}
                      <br>
                      <b>Subscription Users: </b> {{ subscriptionData.rate_per_user }}
                      <br>
                      <br>
                      <br>
                      <b>Charged at Quarter End </b>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card
                class="ma-0"
                outlined
                tile
                :loading="processingBillingContactData"
              >
                <v-system-bar
                  color="primary"
                  class="pa-2 py-5 white--text text-right"
                >
                  <b class="col-12">BILLING CONTACT</b>
                </v-system-bar>

                <v-card-text
                  class="text--primary"
                >
                  <v-text-field
                    v-model="billingContactData.name"
                    class="purple-input"
                    label="Name"
                    required
                  />
                  <v-text-field
                    v-model="billingContactData.email"
                    class="purple-input"
                    label="Email"
                    required
                  />
                  <v-text-field
                    v-model="billingContactData.phone"
                    class="purple-input"
                    label="Phone #"
                    required
                  />
                  <v-text-field
                    v-model="billingContactData.department"
                    class="purple-input"
                    label="Department"
                    required
                  />
                  <v-text-field
                    v-model="billingContactData.reporting_mgr"
                    class="purple-input"
                    label="Reporting Manager"
                    required
                  />
                </v-card-text>

                <v-card-actions>
                  <v-alert
                    v-if="showMessageAlert"
                    color="info"
                    class="white--text text-center mb-0 pa-2"
                  >
                    {{ showMessage }}
                  </v-alert>
                  <v-spacer />
                  <v-btn
                    v-if="processingBillingContactData == false"
                    depressed
                    color="success"
                    @click="updateBillingContactData()"
                  >
                    Update
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              md="7"
            >
              <v-system-bar
                color="primary"
                class="pa-2 py-5 white--text text-right"
              >
                <b class="col-12">MONTHLY USERS SUMMARY</b>
              </v-system-bar>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="userSummaryData"
                  :loading="isLoadinguserSummaryData"
                  loading-text="Loading Data..."
                >
                  <template v-slot:item="row">
                    <tr
                      :id="row.item.id"
                    >
                      <td class="body-2">
                        {{ row.item.date | moment("MMM DD, YYYY") }}
                      </td>
                      <td class="body-2">
                        {{ row.item.rate }}
                      </td>
                      <td class="body-2">
                        {{ row.item.active_users }}
                      </td>
                      <td class="body-2">
                        {{ row.item.plan_users }}
                      </td>
                      <td class="body-2">
                        {{ row.item.user_difference }}
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import axios from 'axios'

export default {
  name: 'Billing',
  data () {
    return {
      companyID: this.$cookies.get('_VCUcid'),
      headers: [
        {
          text: 'DATE',
          value: 'date',
          class: 'body-2',
        },
        {
          text: 'RATE',
          value: 'rate',
          class: 'body-2',
        },
        {
          text: 'ACTIVE USERS',
          value: 'active_users',
          class: 'body-2',
        },
        {
          text: 'PLAN USERS',
          value: 'plan_users',
          class: 'body-2',
        },
        {
          text: '+/- USERS',
          value: 'user_difference',
          class: 'body-2',
        },
      ],
      processingSubscriptionInfo: true,
      processingBillingContactData: true,
      isLoadinguserSummaryData: true,
      userSummaryData: [],
      subscriptionData: {
        subscription_status: '',
        subscription_users: '',
        active_users: '',
        subscription_period: '',
        subscription_adjustment: '',
        renewal_date: '',
        rate_per_user: '',
      },
      billingContactData: {
        name: '',
        email: '',
        phone: '',
        department: '',
        reporting_mgr: '',
      },
      showMessageAlert: false,
      showMessage: '',
    }
  },
  computed: {
  },
  mounted: function () {
    this.getSubscriptionData()
    this.getBillingContactData()
    this.getUserSummaryData()
  },
  methods: {
    getSubscriptionData: function () {
      var self = this.$data
      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/billing-info',
      }).then(function (response) {
        console.log(response.data.data.item)
        self.subscriptionData = response.data.data.item

        /*
          "id": "string",
          "account_number": "string",
          "subscription_status": "string",
          "subscription_period": "string",
          "rate_per_user": 0,
          "company_id": "string"
          */

        self.processingSubscriptionInfo = false
      }, (error) => {
        console.log(error)
        // this.$router.push('/signout')
      })
    },
    getBillingContactData: function () {
      var self = this.$data
      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/billing-contact',
      }).then(function (response) {
        // console.log(response)
        self.billingContactData = response.data.data.item
        self.processingBillingContactData = false
      }, (error) => {
        console.log(error)
        // this.$router.push('/signout')
      })
    },
    updateBillingContactData: function () {
      var self = this.$data
      self.processingBillingContactData = true

      axios({
        method: 'put',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/billing-contact',
        data: {
          name: self.billingContactData.name,
          email: self.billingContactData.email,
          phone: self.billingContactData.phone,
          department: self.billingContactData.department,
          reporting_mgr: self.billingContactData.reporting_mgr,
        },
      }).then(function (response) {
        // console.log(response)
        self.showMessageAlert = true
        self.showMessage = 'Updated'
        self.processingBillingContactData = false
      }, (error) => {
        console.log(error)
        self.showMessageAlert = true
        self.showMessage = error.response.data.error
        self.processingBillingContactData = false
      })
    },
    getUserSummaryData: function () {
      var self = this.$data
      axios({
        method: 'get',
        url: process.env.VUE_APP_DATA_API_URL + 'admin/company/' + self.companyID + '/user-summary',
      }).then(function (response) {
        // console.log(response)
        self.userSummaryData = response.data.data.item
        self.isLoadinguserSummaryData = false
      }, (error) => {
        console.log(error)
        this.$router.push('/signout')
      })
    },
  },
}
</script>
