<template>
  <v-sheet color="#EFEBE9" class="wp wp--scrollable wp--scrollable__y pa-4">
    <p class="c2">
      <span class="c1">HIPAA COMPLIANT AUTHORIZATION FOR THE RELEASE OF PATIENT INFORMATION PURSUANT TO 45 CFR
        164.508 </span>
    </p>
    <p class="c2 c3">
      <span class="c1" />
    </p>
    <p class="c2">
      <span class="c1">TO:</span>
    </p>
    <p class="c2">
      <span class="c1">VitaCorpo, LLC</span>
    </p>
    <p class="c2">
      <span class="c1">3419 High Hamptons Dr</span>
    </p>
    <p class="c2">
      <span class="c1">Charlotte, NC 28210</span>
    </p>
    <p class="c2 c3">
      <span class="c1" />
    </p>
    <p class="c2">
      <span class="c1">I authorize and request the disclosure of all protected information for the purpose of
        review and evaluation in connection with a legal claim. I expressly request that the designated record custodian
        of all covered entities under HIPAA identified above disclose full and complete protected medical information
        including the following:</span>
    </p>
    <p class="c2">
      <span class="c1">&nbsp;All medical records, meaning every page in my record, including but not limited
        to: office notes, face sheets, history and physical, consultation notes, progress notes, nurse&#39;s notes, social
        worker records, clinic records, treatment plans, admission records, discharge summaries, requests for and reports
        of consultations, documents, correspondence, test results, statements, questionnaires/histories, correspondence,
        photographs, videotapes, and records received by other medical providers. All employment, personnel or wage
        records. All laboratory, histology, cytology, pathology, records and specimens; radiology records and films
        including videos/CDs/films/reels and reports. I authorize the release or disclosure of this type of information.
        This protected health information is disclosed for the following purposes: Daily Health Screening</span>
    </p>
    <p class="c2">
      <span class="c1">&nbsp;</span>
    </p>
    <p class="c2">
      <span class="c1">This authorization is given in compliance with the federal consent requirements for
        release of alcohol or substance abuse records of 42 CFR 2.31, the restrictions of which have been specifically
        considered and expressly waived. You are authorized to release the above records to the following representatives
        of defendants in the above-entitled matter who have agreed to pay reasonable charges made by you to supply copies
        of such records: </span>
    </p>
    <p class="c2 c3">
      <span class="c1" />
    </p>
    <p class="c2">
      <span class="c1">I understand the following: See CFR &sect;164.508(c)(2)(i-iii) </span>
    </p>
    <p class="c2">
      <span class="c1">a. I have a right to revoke this authorization in writing at any time, except to the
        extent information has been released in reliance upon this authorization. </span>
    </p>
    <p class="c2">
      <span class="c1">b. The information released in response to this authorization may be re-disclosed to
        other parties. </span>
    </p>
    <p class="c2">
      <span class="c1">c. My treatment or payment for my treatment cannot be conditioned on the signing of
        this authorization. Any facsimile, copy or photocopy of the authorization shall authorize you to release the
        records requested herein. This authorization shall be in force and effect until two years from date of execution
        at which time this authorization expires. </span>
    </p>
  </v-sheet>
</template>

<script>
import { initComponent } from '../../../lib'

export default initComponent('HipaaContent', {})
</script>

<style lang="sass" scoped>
@import '@/sass/_mixins'
.wp
  &--scrollable__y
    min-height: 100px
    max-height: 400px
    position: relative
</style>
