<template>
  <div :class="containerClass">
    <!-- skip button -->
    <icon-button
      v-if="isSkipEnabled"
      :titleConfig="skipButtonTitleConfig"
      @click="skipClicked"
      :class="{ hidden: isAnswerSubmitted || previewMode }"
      :buttonClass="skipButtonClass"
      data-test="skip"
    ></icon-button>
    <!-- minimize button -->
    <icon-button
      v-if="isVideoPlayerElementPresent"
      :titleConfig="minimizeButtonTitleConfig"
      :buttonClass="minimizeButtonClass"
      @click="minimizeModal"
      data-test="minimize"
      id="minimize"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  data() {
    return {
      // styling class for the skip button
      skipButtonClass:
        "bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-full",
    };
  },
  components: { IconButton },
  computed: {
    /** whether the id of the video player element is valid */
    isVideoPlayerElementPresent() {
      return this.videoPlayerElementId != null;
    },
    /** main styling class for this component */
    containerClass() {
      return [
        {
          "px-6 md:px-8 xl:px-12": !this.previewMode,
          "pr-4": this.previewMode,
        },
        "flex w-full bg-white justify-end p-1 space-x-2 mt-2",
      ];
    },
    /** styling class for the minimize button */
    minimizeButtonClass() {
      return [
        {
          "sm:p-2 sm:px-10 lg:p-4 lg:px-10 px-4": !this.previewMode,
          "p-1 lg:p-2 px-2": this.previewMode,
        },
        "bg-primary hover:bg-primary-hover p-1 rounded-md h-full shadow-xl",
      ];
    },
    /** config for the title of minimize button */
    minimizeButtonTitleConfig() {
      return {
        value: this.$t("editor.buttons.show_video"),
        class: this.previewMode
          ? "text-white text-xs lg:text-sm"
          : "text-white text-md sm:text-base lg:text-xl font-bold",
      };
    },
    /** config for the title of skip button */
    skipButtonTitleConfig() {
      return {
        value: this.$t("player.question.skip"),
        class: "text-white text-md sm:text-base lg:text-xl font-bold",
      };
    },
  },
  props: {
    /** whether the answer has been submitted */
    isAnswerSubmitted: {
      default: false,
      type: Boolean,
    },
    /** whether the modal is in fullscreen */
    isFullscreen: {
      default: false,
      type: Boolean,
    },
    /** whether the item modal will be shown in editor's mini-preview mode */
    previewMode: {
      default: false,
      type: Boolean,
    },
    /** id of the DOM element corresponding to video player */
    videoPlayerElementId: {
      default: null,
      type: String,
    },
    isSkipEnabled: {
      default: true,
      type: Boolean,
    },
  },
  methods: {
    skipClicked() {
      this.$emit("skip-question");
    },
    minimizeModal() {
      // on the click of the minimize button, emit the event with a
      // payload containing the position data of the minimize button
      this.$emit("toggle-minimize", this.calculateButtonPosition(this.isFullscreen));
    },
    calculateButtonPosition(isFullscreen = false) {
      // calculate the following position values (in px)
      // centerX, centerY - (X,Y) co-ordinates of the center of minimize button
      // leftX, leftY - (X,Y) co-ordinates of the left most end of minimize button
      var minimizeBtnPositions = document
        .getElementById("minimize")
        .getBoundingClientRect();
      var plyrInstancePositions = document
        .getElementById(this.videoPlayerElementId)
        .getBoundingClientRect();

      return this.getLeftCenterCoordinates(
        minimizeBtnPositions,
        plyrInstancePositions,
        isFullscreen
      );
    },
    getLeftCenterCoordinates(
      minimizeBtnPositions = {},
      plyrInstancePositions = {},
      isFullscreen = false
    ) {
      // get left and center coordinates
      var widthMinimizeBtn = minimizeBtnPositions.right - minimizeBtnPositions.left;
      var heightMinimizeBtn = minimizeBtnPositions.bottom - minimizeBtnPositions.top;
      var centerOfMinimizeBtnX =
        (isFullscreen
          ? minimizeBtnPositions.left
          : minimizeBtnPositions.left - plyrInstancePositions.left) +
        widthMinimizeBtn / 2;
      var centerOfMinimizeBtnY =
        (isFullscreen
          ? minimizeBtnPositions.top
          : minimizeBtnPositions.top - plyrInstancePositions.top) +
        heightMinimizeBtn / 2;
      var leftOfMinimizeBtnX = isFullscreen
        ? minimizeBtnPositions.left
        : minimizeBtnPositions.left - plyrInstancePositions.left;
      var leftOfMinimizeBtnY = isFullscreen
        ? minimizeBtnPositions.top
        : minimizeBtnPositions.top - plyrInstancePositions.top;

      return {
        centerX: centerOfMinimizeBtnX,
        centerY: centerOfMinimizeBtnY,
        leftX: leftOfMinimizeBtnX,
        leftY: leftOfMinimizeBtnY,
      };
    },
  },
  emits: ["skip-question", "toggle-minimize"],
};
</script>
