<template>
  <v-bt
    elevation="2"
  >
  {{text}}
  </v-bt>
</template>

<script>
export default {
  name: "Text",
  props: ["text"]
};
</script>