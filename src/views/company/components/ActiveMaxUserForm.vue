<template>
  <v-row>
    <v-col cols="12" class="pb-0">
      <h2 class="text-h2 font-weight-light">
        Users
      </h2>
    </v-col>
    <v-col cols="6" class="pt-0">
      <div class="d-flex">
        <!-- <v-overlay :value="false" absolute z-index="1">
          <v-progress-circular indeterminate size="36" />
        </v-overlay> -->
        <v-text-field
          label="Active User"
          :rules="rules"
          hide-details="auto"
          class="pr-4"
        />
        <v-text-field
          label="Max Users"
          :rules="rules"
          hide-details="auto"
          class="pl-4"
        />
      </div>
    </v-col>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:default="dialog">
        <v-card class="ma-0">
          <v-toolbar
            color="primary"
            dark
            class="text-h3"
          >
            <span v-if="dialog_item.dialog == 0">{{ dialog_item.active_user.title }}</span>
            <span v-else>{{ dialog_item.max_user.title }}</span>
          </v-toolbar>
          <v-card-text>
            <div class="text-h4 pa-3">
              <span v-if="dialog_item.dialog == 0">{{ dialog_item.active_user.text }}</span>
              <span v-else>{{ dialog_item.max_user.text }}</span>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="dialog.value = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-row>
</template>

<script>
import { initComponent } from '../../../lib'
export default initComponent('ActiveMaxUserForm', {
  data: () => ({
    rules: [
      value => !!value || 'Required.',
      value => (value && value.length >= 3) || 'Min 3 characters',
    ],
    dialog: false,
    dialog_item: {
      dialog: 1, // 0 = active_user , 1 = max_user
      active_user: {
        title: 'Max user count reach',
        text: `Expecting only ${'REMAINING_SLOT_COUNT'} in your excel file.`,
      },
      max_user: {
        title: 'Max user count reach',
        text: `You can no longer add ${'NAME_OF_THE_USER'}, please consult VitaCorpo on how to increase your limit.`,
      },
    },
  }),
  methods: {

  },
})
</script>

<style>

</style>
