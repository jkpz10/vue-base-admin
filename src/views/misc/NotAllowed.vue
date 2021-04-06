<template>
  <v-app class="main-container app-bg">
    <base-forbidden code="forbidden" />
  </v-app>
</template>

<script>
import { initComponent } from '../../lib'

export default initComponent('NotAllowed', {
  isPage: true,
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
</style>
