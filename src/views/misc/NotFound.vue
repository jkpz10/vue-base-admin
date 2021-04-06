<template>
  <v-app class="main-container app-bg">
    <base-forbidden code="notfound" />
  </v-app>
</template>

<script>
import { initComponent } from '../../lib'

export default initComponent('NotFound', {
  isPage: true,
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
</style>
