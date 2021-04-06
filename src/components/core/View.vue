<template>
  <v-content
    class="align-start"
  >
    <v-container
      class="fill-height main-container"
      fluid
    >
      <router-view />
    </v-container>
  </v-content>
</template>

<script>
export default {
  name: 'DashboardCoreView',
}
</script>
