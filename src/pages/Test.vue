<template>
  <div>
    <simple-badge text="Hello"></simple-badge>
  </div>
</template>

<script>
import SimpleBadge from "@/components/UI/Badges/SimpleBadge";
export default {
  components: {
    SimpleBadge,
  },
  data() {
    return {
      badgeClass: "text-indigo-500 border-indigo-500",
    };
  },
};
</script>
