<template>
  <v-card
    v-bind="$attrs"
    :class="classes"
    class="v-card--material pa-3"
  >
    <slot />

    <template v-if="$slots.actions">
      <v-divider class="mt-2" />

      <v-card-actions class="pb-0">
        <slot name="actions" />
      </v-card-actions>
    </template>
  </v-card>
</template>

<script>
export default {
  name: 'MaterialNoHeaderCard',
  props: {
    classes: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="sass">
  .v-card--material
    &__avatar
      position: relative
      top: -64px
      margin-bottom: -32px
</style>
