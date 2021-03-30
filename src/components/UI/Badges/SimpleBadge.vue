<template>
  <div>
    <span class="px-4 py-2 rounded-full border" :class="badgeClass">
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
      default: () => "border-black text-black text-base",
    },
  },
};
</script>
