<template>
  <div class="flex w-full bg-white justify-end p-1 md:p-3">
    <icon-button
      :iconConfig="closeButtonIconConfig"
      @click="closeClicked"
      :class="{ invisible: isAnswerSubmitted }"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
export default {
  components: { IconButton },
  computed: {
    closeButtonIconConfig() {
      return {
        enabled: true,
        iconName: "times-solid",
        iconClass:
          "text-red-600 bg-white h-5 w-5 sm:h-10 sm:w-10 shadow-none hover:bg-gray-200",
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
    closeClicked() {
      this.$emit("close-question");
    },
  },
  emits: ["close-question"],
};
</script>
