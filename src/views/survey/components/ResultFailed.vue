<template>
  <v-card-text class="pt-6 px-8 d-flex flex-column align-start justify-stretch">
    <div class="wp--first">
      Your health survey is complete
    </div>
    <div class="wp--second">
      Contact company admin for next the next steps <strong>{{ info.contact.phone }}</strong>
    </div>
  </v-card-text>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('ResultFailed', {
  data () {
    return {}
  },
  methods: {},
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--icon
    background: #47A8F9
  &--title
    @include font(400, 12px)
    h4
      @include font(400, 10px)
  &--first
    margin: 10px auto 5px
    @include font(400, 14px)
  &--second
    margin-top: 20px
    padding-bottom: 10px
    text-align: center
a
  text-decoration: none
  @include font(600, 12px)
</style>
