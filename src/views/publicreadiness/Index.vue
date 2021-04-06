<template>
  <v-container id="workplace_readiness" tag="section">
    <v-overlay :value="isFetching || isSaving" absolute z-index="1">
      <v-progress-circular indeterminate size="36" />
    </v-overlay>
    <v-row no-gutters>
      <v-col cols="12" md="3">
        <v-card class="wp wp--temperature py-2 px-3 mr-1" outlined rounded="md">
          <div class="wp--avatar pos-relative">
            <v-img
              eager
              :lazy-src="tempImg[0]"
              :src="tempImg[1]"
              width="100"
              class="icon pos-absolute"
            />
          </div>
          <div class="caption d-flex justify-center">
            <div>
              <div class="text--title text-h4 font-weight-light">
                Temperature
              </div>
              <div class="text-subtitle font-weight-thin">
                {{ company && company.name }}
              </div>
            </div>
          </div>
          <p class="text--p pt-8">
            This is the workplace readiness standard for body temperature.
            Workers who temperature reading is higher than this will fall
            workplace readiness.
          </p>
          <v-select
            :value="readiness.temp"
            :items="tempList"
            item-text="l"
            item-value="i"
            label="Body Temperature Threshold"
            class="input--text"
            @input="(x) => temp = x"
          />
          <v-btn
            class="button--temp light-blue darken-1 white--text"
            tile block elevation="0"
            @click="() => doSaveReadiness('temp')"
          >
            Save
          </v-btn>
        </v-card>
        <v-card class="wp wp--spo2 py-2 px-3 mr-1" outlined rounded="md">
          <div class="wp--avatar pos-relative">
            <v-img
              eager
              :lazy-src="spo2Img[0]"
              :src="spo2Img[1]"
              width="100"
              class="icon pos-absolute"
            />
          </div>
          <div class="caption d-flex justify-center">
            <div>
              <div class="text--title text-h4 font-weight-light">
                Blood Oxygen Level
              </div>
              <div class="text-subtitle font-weight-thin">
                {{ company && company.name }}
              </div>
            </div>
          </div>
          <p class="text--p pt-8">
            This is the workplace readiness standard for blood oxygen level.
            This level is a degree below normal threshold. Workers normal
            will be computed by an average of their last 10 readings that met
            workplace readiness (with the highest and lowest values removed).
            Employees whose blood oxygen reading is outside the normal
            threshold will fail workplace readiness.
          </p>
          <v-select
            :value="readiness.spo2"
            :items="spo2List"
            item-text="l"
            item-value="i"
            label="Body Oxygen Saturation Threshold"
            class="input--text"
            @input="(x) => spo2 = x"
          />
          <v-btn
            class="button--spo2 light-blue darken-1 white--text"
            tile block elevation="0"
            @click="() => doSaveReadiness('spo2')"
          >
            Save
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-card class="wp wp--questionnaire py-2 px-3 mr-1" outlined rounded="md">
          <v-row>
            <v-col cols="12" sm="8">
              <div class="text--title text-h4 font-weight-light">
                Workplace Readiness Survey
              </div>
              <p class="text--p font-weight-bold">
                Surveys are verified against 2 criteria, Required Questions and Weight Point Threshold.
              </p>
              <p class="text--p">
                <strong>Required Questions:</strong> If a respondents answer do not match the correct answer of a required question the respondent
                immediately fails workplace readiness.
              </p>
              <p class="text--p">
                <strong>Weight Point Threshold:</strong> Each question is given a weight point.
                If a respondents does do not answer correctly to reach the weight point threshold the respondent fails workplace readiness.
              </p>
              <div class="d-flex flex-row-reverse">
                <v-btn elevation="0" class="mr-1 inde btn btn--add" @click="doAdd">
                  Add Question <v-icon color="white" right v-text="'mdi-plus'" />
                </v-btn>
              </div>
              <v-tabs v-model="currentTab" fixed-tabs>
                <v-tab v-for="(n) in tabs" :key="n.id" class="caption">
                  {{ n.text }}
                </v-tab>
              </v-tabs>
              <v-tabs-items v-model="currentTab">
                <v-tab-item v-for="(n) in tabs" :key="n.id">
                  <v-list v-if="items[n.id].length > 0" dense>
                    <v-list-item-group color="primary">
                      <v-list-item v-for="(q) in items[n.id]" :key="q.id" @click="doEdit(q)">
                        <v-list-item-content class="border">
                          <v-list-item-title v-text="q.question" />
                        </v-list-item-content>
                        <v-list-item-icon>
                          <v-icon>mdi-chevron-right</v-icon>
                        </v-list-item-icon>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                  <p v-else class="body-2 pa-4 mt-5 text-center">
                    No created questions yet
                  </p>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                :value="readiness.survey_weight"
                :items="sweightList"
                item-text="l"
                item-value="i"
                label="Weight Point Threshold"
                class="input--text"
                @input="(x) => sweight = x"
              />
              <div class="d-flex flex-row-reverse">
                <v-btn elevation="0" class="mr-1 inde btn btn--save" @click="() => doSaveReadiness('survey_weight')">
                  Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
                </v-btn>
              </div>
              <div v-if="isShowForm" class="mt-4">
                <question-form
                  :info="item"
                  :is-saving="isSaving"
                  :do-save="doAddOrUpdate"
                  :do-cancel="doCancel"
                  :do-update-data="doUpdateData"
                />
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { range, isEmpty, set, cloneDeep, get, filter, find, indexOf } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { REQUEST_QUESTION_ADD, REQUEST_QUESTION_LIST, REQUEST_QUESTION_UPDATE, REQUEST_READINESS_GET, REQUEST_READINESS_UPDATE, TAB_ACTIVE, TAB_SAVED, UPDATE_READINESS_STATE } from '../../store/modules/readiness'
import QuestionForm from './components/QuestionForm'
import { initComponent } from '../../lib'

export default initComponent('PublicReadiness', {
  isPage: true,
  components: {
    QuestionForm,
  },
  props: {
    public: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      tabs: [
        {
          id: TAB_ACTIVE,
          text: 'Active Questions',
        },
        {
          id: TAB_SAVED,
          text: 'Saved Questions',
        }],
      tempList: range(98.6, 102, 0.1).map(x => ({ l: x.toFixed(1), i: Number(x.toFixed(1)) })),
      spo2List: range(1, 15, 0.5).map(x => ({ l: x.toFixed(1), i: Number(x.toFixed(1)) })),
      sweightList: range(1, 100, 1).map(x => ({ l: x.toFixed(1), i: Number(x.toFixed(1)) })),
      spo2: 0,
      temp: 0,
      sweight: 0,
      tempImg: [
        require('@/assets/temp.png'),
        require('@/assets/temp@2x.png')],
      spo2Img: [
        require('@/assets/bDkSno.png'),
        require('@/assets/bDkSno@2x.png'),
      ],
    }
  },
  computed: {
    currentTab: {
      get () {
        const id = get(this.$store.state.readiness, 'activeTab', TAB_ACTIVE)
        return indexOf(this.tabs, find(this.tabs, { id }))
      },
      async set (v) {
        const { commit } = this.$store
        const t = this.tabs[v]
        if (t && t.id) return commit(UPDATE_READINESS_STATE, { activeTab: t.id })
      },
    },
    ...mapState({
      readiness: (state) => state.readiness.readiness,
      company: (state) => state.readiness.company,
      items: (state) => {
        const items = get(state, 'readiness.items', [])
        return {
          [TAB_ACTIVE]: filter(items, (i) => i.is_active),
          [TAB_SAVED]: filter(items, (i) => !i.is_active),
        }
      },
      item: (state) => state.readiness.item,
      isFetching: (state) => state.readiness.isFetching,
      isSaving: (state) => state.readiness.isSaving,
      isShowForm: (state) => {
        const { isFormAdd, isFormEdit } = state.readiness
        return isFormAdd || isFormEdit
      },
      isAddMode: (state) => state.readiness.isFormAdd,
      isEditMode: (state) => state.readiness.isFormEdit,
    }),
  },
  methods: {
    async onReady () {
      const { dispatch, commit, state } = this.$store
      let company
      if (this.public) {
        const { publicCompany = {} } = state.app.appData
        if (isEmpty(publicCompany)) throw new Error('Public company not loaded.')
        company = publicCompany
      } else {
        company = this.getCompanyInfo(state.app.appData.company)
      }

      await commit(UPDATE_READINESS_STATE, {
        company,
        isFormAdd: false,
        isFormEdit: false,
      })
      await Promise.all([
        dispatch(REQUEST_QUESTION_LIST),
        dispatch(REQUEST_READINESS_GET),
      ])
    },
    async onCompanyChanged () {
      if (this.isCurrentPage()) {
        await this.onReady()
      }
    },
    ...mapActions({
      async doSaveReadiness (dispatch, key) {
        const { state, commit } = this.$store
        const readiness = cloneDeep(state.readiness.readiness)
        const mapping = {
          survey_weight: this.sweight || readiness.survey_weight,
          temp: this.temp || readiness.temp,
          spo2: this.spo2 || readiness.spo2,
        }
        set(readiness, key, mapping[key])
        await commit(UPDATE_READINESS_STATE, { readiness })
        return dispatch(REQUEST_READINESS_UPDATE)
      },
      async doAddOrUpdate (dispatch) {
        const { isFormAdd } = this.$store.state.readiness
        return dispatch(isFormAdd ? REQUEST_QUESTION_ADD : REQUEST_QUESTION_UPDATE)
      },
    }),
    async doAdd () {
      const { commit } = this.$store
      const item = {
        choices: [
          {
            is_correct: true,
            value: 'Yes',
          },
          {
            is_correct: false,
            value: 'No',
          },
        ],
        question: '',
        weight: 1,
        is_active: true,
      }
      return commit(UPDATE_READINESS_STATE, { item, isFormAdd: true, isFormEdit: false })
    },
    async doEdit (item) {
      const { commit } = this.$store
      return commit(UPDATE_READINESS_STATE, { item, isFormAdd: false, isFormEdit: true })
    },
    async doCancel () {
      const { commit } = this.$store
      return commit(UPDATE_READINESS_STATE, { item: {}, isFormAdd: false, isFormEdit: false })
    },
    async doUpdateData (val, key) {
      const { commit, state } = this.$store
      const item = cloneDeep(state.readiness.item)
      if (['is_active', 'is_required'].includes(key)) {
        if ([undefined, null].includes(val)) {
          val = false
        }
      }
      set(item, key, val)
      return commit(UPDATE_READINESS_STATE, { item })
    },
  },
})
</script>
<style lang="sass">
@import '@/sass/_mixins'
#workplace_readiness
  .input--text
    @include font(300, 11px)
    &.input--checkbox label
      @include font(400, 11px)
      color: #333
  .wp--avatar
    height: 1px
    .icon
      top: -38px
      left: 10px
  .button
    &--temp, &--spo2
      position: absolute
      bottom: -2px
      margin-left: -12px !important
      border-bottom-left-radius: 4px
      border-bottom-right-radius: 4px
  .wp
    .text--title
      font-family: 'Roboto', sans-serif
    .text--p
      color: #4A4A4A
      @include font(300, 11px)
      line-height: 16px
    .caption
      padding-top: 18px
      div
        margin-left: 10px
        text-align: center
    &--temperature, &--spo2
      padding-bottom: 30px !important
    &--temperature
      margin-top: 28px
    &--questionnaire
      margin-top: 28px
    &--spo2
      margin-top: 50px
      .caption div
        margin-left: 20px
</style>
