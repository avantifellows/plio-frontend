<template>
  <div class="flex w-full bg-white justify-end p-1">
    <!-- skip button -->
    <icon-button
      :iconConfig="skipButtonIconConfig"
      @click="skipClicked"
      :class="{ hidden: isAnswerSubmitted }"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
export default {
  components: { IconButton },
  computed: {
    skipButtonIconConfig() {
      return {
        enabled: true,
        iconName: "times-solid",
        iconClass:
          "text-red-600 bg-white h-2 w-2 sm:h-8 sm:w-8 md:h-8 md:w-8 shadow-none hover:bg-gray-200",
      };
    },
  },
  props: {
    isAnswerSubmitted: {
      // whether the answer has been submitted
      default: false,
      type: Boolean,
    },
  },
  methods: {
    skipClicked() {
      this.$emit("skip-question");
    },
  },
  emits: ["skip-question"],
};
</script>
