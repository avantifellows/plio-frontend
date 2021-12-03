<template>
  <div>
    <span class="rounded-full border" :class="badgeClass" data-test="simpleBadge">
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
      default: () => "border-black text-black text-base px-4 py-2",
    },
  },
};
</script>
