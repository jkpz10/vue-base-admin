<template>
  <div class="pos-relative">
    <v-expansion-panels v-model="panel">
      <v-expansion-panel>
        <v-expansion-panel-header color="#592C85" class="text--panel white--text">
          User Meta Fields
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <validation-observer ref="observer" v-slot="{ invalid }">
            <v-overlay :value="isSaving" absolute z-index="1">
              <v-progress-circular indeterminate size="36" />
            </v-overlay>
            <div v-for="(c, i) in meta" :key="i">
              <validation-provider
                v-slot="{ errors }"
                :name="c.label"
                rules="required"
              >
                <v-select
                  :label="c.label"
                  :value="c.value"
                  :error-messages="errors"
                  :items="c.choices"
                  hide-details="auto"
                  @input="(x) => doUpdateValue(c, x)"
                />
              </validation-provider>
            </div>
            <div class="d-flex justify-end pt-2">
              <v-btn elevation="0" class="mr-0 inde btn btn--save" :disabled="invalid" @click="doSave">
                Save <v-icon color="white" right v-text="'mdi-content-save-outline'" />
              </v-btn>
            </div>
          </validation-observer>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { initComponent } from '../../../lib'

export default initComponent('EditUserFields', {
  data: () => ({ panel: 0 }),
  props: {
    meta: {
      type: Array,
      default: [],
    },
  },
  computed: {
    user () {
      return this.info.user
    },
    ...mapState({}),
  },
  methods: {
    async doUpdateValue (item, value) {
      await this.doUpdateData({ ...item, value })
    },
  },
})
</script>

<style lang="sass"></style>
