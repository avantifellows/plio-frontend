<!-- src/components/CreatePlioButton.vue -->
<template>
  <div>
    <!-- Desktop version -->
    <icon-button
      v-if="!onMobile"
      :titleConfig="titleConfig"
      :buttonClass="buttonClass"
      class="my-4 border-b-outset border-primary hidden bp-500:inline"
      @click="handleClick"
      :isDisabled="isDisabled"
    />
    <!-- Mobile version -->
    <icon-button
      v-else
      :titleConfig="titleConfig"
      :buttonClass="buttonClass"
      class="bp-500:hidden"
      @click="handleClick"
      :isDisabled="isDisabled"
    />
  </div>
</template>

<script setup>
defineProps({
  onMobile: {
    type: Boolean,
    default: false,
  },
  titleConfig: Object,
  buttonClass: String,
  isDisabled: Boolean,
  handleClick: Function,
});
</script>
