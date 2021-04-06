<template>
  <span>
    <span v-if="!hideLoader">
      <v-sheet v-if="!isLoaded" class="pos-absolute full-width full-height flex-fill">
        <div class="pos-relative">
          <v-progress-circular color="blue" width="2" size="24" indeterminate />
        </div>
        <div class="headline">Loading...please wait...</div>
      </v-sheet>
    </span>
    <router-view />
  </span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  computed: {
    hideLoader () {
      const { auth } = this.$route.meta
      return auth === false
    },
    ...mapState({
      isLoaded (state) {
        const { isRestored, isReady } = state.app
        return isRestored === true && isReady === true
      },
    }),
  },
}
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.v-sheet
  display: flex
  flex-direction: row
  flex-wrap: nowrap
  justify-content: center
  align-items: center
  align-content: center
.v-progress-circular
  margin-right: 10px
.headline
  @include font(300, 20px)
</style>
