<template>
  <v-sheet rounded class="wp wp--line_form mt-1 elevation-1" :class="`wp--${type}`">
    <v-overlay :value="isSaving" absolute z-index="2">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-card-title class="d-flex justify-start pa-0">
      <div class="txt--icon d-flex justify-center align-center">
        <v-icon small v-text="icon" />
      </div>
      <div class="txt--title d-flex justify-center align-center">
        {{ title }}
      </div>
    </v-card-title>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <div v-if="[EVENT_TEST].includes(type) && !info.id" class="wp--line_form__content">
        <validation-provider
          v-slot="{ errors }"
          name="Test Type"
          rules="required"
        >
          <v-combobox
            v-model="testType"
            label="Test Type"
            :error-messages="errors"
            :items="testTypes"
            hide-details="auto"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Location Name"
          rules="required"
        >
          <v-text-field
            label="Location Name"
            :value="info.test_location_name"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'test_location_name')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Location Address"
          rules="required"
        >
          <v-text-field
            label="Location Address"
            :value="info.test_location_address"
            :error-messages="errors"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'test_location_address')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Test Result"
          rules="required"
        >
          <v-combobox
            label="Test Result"
            :value="info.test_result"
            :error-messages="errors"
            :items="testResults"
            hide-details="auto"
            @input="(x) => doUpdateData(x, 'test_result')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          name="Date Tested"
          rules="required"
        >
          <v-text-field
            ref="inputDtPickerDt"
            label="Date Tested"
            :value="currentDate"
            :error-messages="errors"
            hide-details
            readonly
            @click="doShowDatePicker"
          />
        </validation-provider>
        <v-switch
          v-model="share"
          label="Share with Employer"
          hide-details
        />
      </div>
      <div v-else class="wp--line_form__content">
        <validation-provider
          v-slot="{ errors }"
          name="Notes"
          rules="required"
        >
          <v-textarea
            label="Notes"
            :value="info.notes"
            :error-messages="errors"
            hide-details
            auto-grow
            rows="2"
            no-resize
            class="ma-0"
            @input="(x) => doUpdateData(x, 'notes')"
          />
        </validation-provider>
        <validation-provider
          v-slot="{ errors }"
          :name="info.id ? 'Ended Date': 'Start Date'"
          rules="required"
        >
          <v-text-field
            ref="inputDtPicker"
            :label="info.id ? 'Ended Date': 'Start Date'"
            :value="currentDate"
            :error-messages="errors"
            hide-details
            readonly
            @click="doShowDatePicker"
          />
        </validation-provider>
        <v-switch
          v-if="!info.id"
          v-model="notify"
          label="Notify User"
          hide-details
        />
      </div>
      <v-menu
        ref="dtPicker"
        v-model="menuDtPicker"
        :close-on-content-click="false"
        transition="scale-transition"
        absolute
        offset-y
        :position-x="xyDatePicker.x"
        :position-y="xyDatePicker.y"
        min-width="290px"
      >
        <v-date-picker
          :value="currentDate.substr(0, 10)"
          :max="maxDate"
          :min="minDate"
          no-title
          scrollable
          @change="updateCustomDate"
        />
      </v-menu>
      <div class="d-flex justify-end py-4 mr-3">
        <v-btn elevation="0" class="inde btn btn--cancel mr-2" @click="doCancel">
          Cancel <v-icon color="white" right v-text="'mdi-close-circle-outline'" />
        </v-btn>
        <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
          Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
        </v-btn>
      </div>
    </validation-observer>
  </v-sheet>
</template>

<script>
import moment from 'moment'
import { get, has, isNumber, find } from 'lodash'
import { EVENT_QUARANTINE, EVENT_RESPONSE, EVENT_SICK_DAY, EVENT_TEST, EVENT_WORK_FROM_HOME, TEST_TYPE_ANTIBODY, TEST_TYPE_ANTIGEN, TEST_TYPE_MOLECULAR } from '../../../../constants'
import { initComponent } from '../../../../lib'
import { AppException } from '../../../../api'

export default initComponent('LineForm', {
  data () {
    return {
      xyDatePicker: { x: 0, y: 0 },
      menuDtPicker: false,
      EVENT_TEST,
      testResults: ['NEGATIVE', 'POSITIVE'],
      testTypes: [
        { value: TEST_TYPE_ANTIGEN, text: 'ANTIGEN' },
        { value: TEST_TYPE_ANTIBODY, text: 'ANTIBODY' },
        { value: TEST_TYPE_MOLECULAR, text: 'MOLECULAR NEGATIVE TEST' },
      ],
    }
  },
  computed: {
    testType: {
      get () {
        const { testTypes, info: { test_type: type } } = this
        return (find(testTypes, { value: type }) || {}).value || type
      },
      async set (v) {
        return this.doUpdateData(v.value, 'test_type')
      },
    },
    maxDate () {
      return has(this.info, 'id') ? null : moment().format('YYYY-MM-DD')
    },
    minDate () {
      return has(this.info, 'id') ? moment(this.info.started_at).format('YYYY-MM-DD') : null
    },
    currentDate () {
      if (this.info.type === EVENT_TEST) {
        return moment(this.info.date_tested).format('YYYY-MM-DD')
      }
      const date = has(this.info, 'id') ? this.info.ended_at : this.info.started_at
      if (!isNumber(date)) {
        throw new AppException('Expecting date to be number.')
      }
      return moment(date).format('YYYY-MM-DD')
    },
    notify: {
      get () {
        const { notify } = this.info
        return notify
      },
      async set (v) {
        return this.doUpdateData(v, 'notify')
      },
    },
    share: {
      get () {
        const { share_to_employer: x } = this.info
        return x
      },
      async set (v) {
        return this.doUpdateData(v, 'share_to_employer')
      },
    },
    type () {
      return this.info.type
    },
    title () {
      const { type } = this.info
      return {
        [EVENT_RESPONSE]: 'Response Interaction',
        [EVENT_QUARANTINE]: 'Quarantine',
        [EVENT_SICK_DAY]: 'Sick Day',
        [EVENT_WORK_FROM_HOME]: 'Work From Home',
        [EVENT_TEST]: 'Test Result',
      }[type] || '--'
    },
    icon () {
      const { type } = this.info
      return get({
        [EVENT_RESPONSE]: 'mdi-play',
        [EVENT_QUARANTINE]: 'mdi-sign-caution',
        [EVENT_WORK_FROM_HOME]: 'mdi-home',
        [EVENT_SICK_DAY]: 'mdi-emoticon-sick-outline',
        [EVENT_TEST]: 'mdi-microscope',
      }, type, 'mdi-adjust')
    },
  },
  methods: {
    async updateCustomDate (value) {
      this.$refs.dtPicker.save()
      const { id, type } = this.info
      let key = id ? 'ended_at' : 'started_at'
      if (type === EVENT_TEST) {
        key = 'date_tested'
      }
      await this.doUpdateData(moment(value).toISOString(), key)
    },
    doShowDatePicker (e) {
      const { type } = this.info
      const { left, top } = this.$refs[type === EVENT_TEST ? 'inputDtPickerDt' : 'inputDtPicker'].$el.getBoundingClientRect()
      this.xyDatePicker = { x: left, y: top }
      this.menuDtPicker = !this.menuDtPicker
    },
  },
})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
$height: 32px
.wp
  overflow: hidden
  &--line_form
    width: 230px
    background-color: #FAFAFA
    &__content
      padding: 4px 16px 10px
  .v-card__title
    height: $height
    color: #383838
    background-color: #fff
    .txt
      &--title, &--icon
        height: $height
      &--title
        @include font(600, 13px)
      &--icon
        width: 30px
        text-align: center
        margin-right: 6px
        .v-icon
          margin-top: -2px
  &--sickday
    .v-card__title
      > div.txt--icon
        background-color: #F5A623
  &--wfh
    .v-card__title
      > div.txt--icon
        background-color: #F8E71C46
  &--quarantine
    .v-card__title
      > div.txt--icon
        background-color: #D0021B7B
  &--response
    .v-card__title
      > div.txt--icon
        background-color: #4A90E2
  &--test
    .v-card__title
      > div.txt--icon
        background-color: #8FB8E0
</style>
