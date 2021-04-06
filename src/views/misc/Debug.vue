<template>
  <v-app class="main-container app-bg">
    <v-container>
      <v-card class="wp wp--debug">
        <strong>Debugger:</strong> Superuser use only
      </v-card>
      <v-row>
        <v-col>
          <v-card class="wp wp--debug">
            Create Fake user tru Sign Up
          </v-card>
        </v-col>
        <v-col>
          <v-card class="wp wp--debug">
            Create Fake Events
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { initComponent } from '../../lib'

export default initComponent('Debug', {
  isPage: true,
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
.wp
  &--debug
    padding: 4px 8px
</style>
