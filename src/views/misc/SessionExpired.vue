<template>
  <v-app class="main-container app-bg">
    <base-forbidden code="session" />
  </v-app>
</template>

<script>
import { initComponent } from '../../lib'

export default initComponent('SessionExpired', {
  isPage: true,
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
</style>
