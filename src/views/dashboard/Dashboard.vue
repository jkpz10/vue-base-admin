<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6">
        <Chart1 title="Online" />
      </v-col>
      <v-col cols="12" md="6">
        <Chart1 title="Visits" />
      </v-col>
      <v-col cols="12" md="6">
        <Chart1 title="New Users" />
      </v-col>
      <v-col cols="12" md="6">
        <Chart1 title="Verified" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <VTable title="Title Here"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src

//Components
import Chart1 from './components/widgets/ChartOne'
import VTable from './components/widgets/Table'

export default {
  name: 'Dashboard',
  components : {
    Chart1,
    VTable,
  }
}
</script>
