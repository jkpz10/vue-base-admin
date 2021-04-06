<template>
  <v-sheet
    color="white"
    elevation="1"
    :width="width"
    height="100%"
    class="mobile-qr app-bg mobile rounded-0 mx-auto"
  >
    <v-container>
      <v-row>
        <v-col cols="6" class="d-flex align-center">
          <v-icon class="white--text">
            mdi-keyboard-backspace
          </v-icon>
        </v-col>
        <v-col cols="6" class="text-right">
          <v-img
            src="@/assets/company-logo.png"
            height="40"
            contain
            position="right center"
            class=""
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="mt-n14">
          <div class="d-flex align-end">
            <v-avatar
              color="indigo"
              :size="mobileSize == 'sm' ? 100: 123"
              class="pos-relative"
              style="top: 30px; z-index: 1;"
            >
              <img
                v-if="true"
                src="https://cdn.vuetifyjs.com/images/john.jpg"
                alt="Jane"
              >
              <span v-else class="white--text headline">JD</span>
            </v-avatar>
            <div>
              <p class="px-5 mb-3 white--text">
                Jane Doe
              </p>
            </div>
          </div>
          <v-card class="ma-0">
            <v-card-title class="d-flex justify-end text--title">
              <span class="text-capitalize">Work Pass</span>
            </v-card-title>
            <v-container>
              <v-row>
                <v-col cols="6" class="d-flex justify-center">
                  <v-icon class="check-last-verified white--text" :style="`font-size: ${checkSize}px;`">
                    mdi-check
                  </v-icon>
                </v-col>
                <v-col cols="6" class="d-flex flex-column justify-space-around">
                  <div class="font-weight-bold" :class="{'text-h4': mobileSize == 'default', 'text-h6': mobileSize == 'sm'}">
                    Last Verified
                  </div>
                  <div :class="{'text-body-2': mobileSize == 'default', 'text-caption': mobileSize == 'sm'}">
                    <p class="ma-0">
                      Today
                    </p>
                    <p class="ma-0">
                      May 12 7:54 am
                    </p>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-sheet
                    color="white"
                    elevation="1"
                    :width="qrSize"
                    :height="qrSize"
                    class="qr-container mx-auto d-flex align-center justify-center"
                  >
                    <div class="qr-container">
                      QR CODE HERE
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" class="text-center pt-0">
                  <span :class="{'text-body-2': mobileSize == 'default', 'text-caption': mobileSize == 'sm'}">SCAN QR for Entry</span>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import { initComponent } from '@/lib'
export default initComponent('MobileQrView', {
  props: [
    'qrSize', // any number
    'width', // any number px or %
    'checkSize', // any number px
    'mobileSize', // 'sm' or 'default'
  ],
  data: () => ({
  }),
})
</script>

<style scoped lang="sass">
@import '@/sass/_mixins'
.wp
  &--debug
    padding: 4px 8px
.text--title
  background-color: #2F96DE
  color: white
.app-bg.mobile
  background: #673ab7 linear-gradient(180deg, #673ab7 0%, #673ab7 25%, #2277ba 100%) !important
.v-icon.v-icon.check-last-verified
  background: $vc_green
  border-radius: 100%
</style>
