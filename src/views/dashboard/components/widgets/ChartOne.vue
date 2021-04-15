<template>
  <v-card
    elevation="2"
    class="tw-p-3"
  >
    <v-card-title class="tw-flex tw-items-center tw-justify-between">
      <AtomTitle class="tw-text-sm tw-pr-3" :text="title" />
      <div class="tw-flex tw-items-center">
        <AtomText class="tw-pr-3" text="2,053"/>
        <small class="tw-flex tw-items-center tw-text-green-400">
          <v-icon class="tw-text-green-400 tw-text-base tw-pr-1">fa-angle-double-up</v-icon>
          <AtomText text="5.23%"/>
        </small>
      </div>
    </v-card-title>
    <v-sheet
      class=""
      color="white"
      elevation="0"
      max-width="100%"
    >
      <v-sparkline
        :labels="labels"
        :value="value"
        color="black"
        line-width="2"
        padding="8"
        smooth="5"
      ></v-sparkline>
    </v-sheet>
  </v-card>
</template>

<script>

// components
import AtomTitle from '@/components/atoms/Title'
import AtomText from '@/components/atoms/Text'

export default {
  name: 'NewUsers',
  props: [
    'title',
  ],
  components: {
    AtomTitle,
    AtomText,
  },

  data: () => ({
    labels: [
      '12am',
      '3am',
      '6am',
      '9am',
      '12pm',
      '3pm',
      '6pm',
      '9pm',
    ],
    value: [
      200,
      675,
      410,
      390,
      310,
      460,
      250,
      240,
    ],
  }),
}
</script>

<style>

</style>