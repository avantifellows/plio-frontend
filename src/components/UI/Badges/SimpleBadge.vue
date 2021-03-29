<template>
  <div>
    <span class="px-4 py-2 text-base rounded-full border" :class="badgeClass">
      {{ text }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: "'",
    },
    badgeClass: {
      default: () => "border-black text-black",
    },
  },
};
</script>
