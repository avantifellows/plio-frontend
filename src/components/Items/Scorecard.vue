<template>
  <div class="flex flex-col bg-peach w-full h-full overflow-hidden">
    <div class="flex justify-center w-2/3 mx-auto my-auto h-full py-8">
      <div
        class="flex flex-col justify-center w-full"
        :class="{ 'gap-4': !isCircularProgressShown }"
      >
        <!-- scorecard greeting -->
        <div
          class="text-center text-lg md:text-xl lg:text-2xl font-extrabold font-sans mb-4"
        >
          {{ greeting }}
        </div>

        <!-- name of the plio -->
        <div class="text-center text-sm md:text-lg lg:text-xl font-extrabold truncate">
          {{ plioTitle }}
        </div>

        <!-- canvas element for drawing the confetti -->
        <canvas id="confetticanvas" class="fixed z-50"></canvas>

        <!-- circular progress bar -->
        <CircularProgress
          v-if="isCircularProgressShown"
          class="relative mx-auto"
          :radius="circularProgressRadius"
          :progressBarPercent="localProgressBarPercentage"
          :stroke="circularProgressStroke"
          :result="progressBarResult"
          :key="reRenderKey"
        >
        </CircularProgress>

        <!-- metric boxes -->
        <div class="flex bp-500:flex-row flex-col justify-center gap-4 px-10">
          <div
            v-for="metric in metrics"
            class="rounded-md bp-500:rounded-2xl bg-yellow-400 grid grid-cols-2 bp-500:grid-rows-2 bp-500:grid-cols-none lg:grid-cols-2 lg:grid-rows-none border-2 px-4 lg:px-6 w-full h-14 bp-500:h-20"
            :key="metric"
          >
            <div
              class="w-full h-full flex flex-row justify-center gap-2 bp-500:mt-2 lg:mt-0"
            >
              <!-- metric icon -->
              <inline-svg
                :src="getImageSource(metric.icon.source)"
                class="h-6 bp-360:h-10 bp-500:h-6 lg:h-10 w-6 bp-360:w-10 bp-500:w-4 md:w-6 lg:w-10 place-self-center"
                :class="metric.icon.class"
              ></inline-svg>
              <!-- numeric value of the metric -->
              <p
                class="text-xl bp-360:text-2xl md:text-3xl lg:text-4xl font-bold my-auto"
              >
                {{ metric.value }}
              </p>
            </div>
            <!-- name of the metric -->
            <div
              class="text-center text-sm bp-320:text-base md:text-base lg:text-xl font-medium my-auto bp-500:whitespace-nowrap lg:whitespace-normal"
            >
              {{ metric.name }}
            </div>
          </div>
        </div>

        <!-- action buttons -->
        <div class="place-self-center mt-3">
          <!-- watch again button -->
          <icon-button
            :titleConfig="watchAgainButtonTitleConfig"
            :buttonClass="watchAgainButtonClass"
            @click="restartVideo"
            data-test="watchAgainButton"
          ></icon-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CircularProgress from "@/components/UI/Progress/CircularProgress.vue";
import Utilties from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

const confetti = require("canvas-confetti");
const confettiCanvas = document.getElementById("confetticanvas");
const confettiHandler = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
});
const confettiDuration = 10; // duration (in seconds) for which the confetti animation should run
var confettiColors = ["#ff718d", "#fdff6a"]; // colors for confetti particles
const waitTime = 500; // a time delay to be used in the code

export default {
  name: "Scorecard",
  components: {
    CircularProgress,
    IconButton,
  },
  props: {
    metrics: {
      /**
       * details of all the metrics to show
       * format of one metric --
       * {
       *   name: "METRIC_NAME",
       *   icon: {
       *     source: "SVG_NAME.svg",
       *     class: "TAILWIND_CLASSES",
       *   },
       *   value: VALUE_TO_SHOW,
       * },
       */
      default: () => [],
      type: Array,
    },
    progressPercentage: {
      // progress to show on the progress bar in %
      default: null,
      type: [Object, Number],
    },
    greeting: {
      // greeting of the scorecard
      default: "",
      type: String,
    },
    isShown: {
      // indicator of whether the scorecard has popped up or not
      default: false,
      type: Boolean,
    },
    plioTitle: {
      // plio's title
      default: "",
      type: String,
    },
  },
  data() {
    return {
      localProgressBarPercentage: 0, // local value of progress
      // variable to store the animation frame request
      // used when confetti popping has to be stopped
      animationFrameRequest: null,
      innerWidth: window.innerWidth, // variable to hold the width of window
      reRenderKey: 0, // a key to re-render a component
      // classes for watch again button
      watchAgainButtonClass:
        "bg-primary hover:bg-primary-hover px-6 py-3 bp-500:p-4 bp-500:pl-10 bp-500:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
    };
  },
  watch: {
    isShown(value) {
      if (value) {
        // if scorecard pops up then wait some time to update the
        // `localProgressBarPercentage`. This makes the progress bar animate
        setTimeout(() => {
          this.localProgressBarPercentage = this.progressPercentage;
        }, waitTime);

        // Also, throw some confetti in there
        this.throwConfetti();
      } else {
        // if scorecard is not visible anymore, reset things
        this.localProgressBarPercentage = 0;
      }
    },
  },
  created() {
    // reactively handle screen resizing
    window.addEventListener("resize", this.handleScreenSizeChange);
  },
  unmounted() {
    window.removeEventListener("resize", this.handleScreenSizeChange);
  },
  computed: {
    /**
     * Wether the circular progress bar will be visible or not.
     * If the progressPercetage prop is null, the circular progress
     * will not be visible
     */
    isCircularProgressShown() {
      if (this.progressPercentage == null) return false;
      return true;
    },
    /** What result to show in the center of the progress bar */
    progressBarResult() {
      return {
        enabled: true,
        title: this.$t("player.scorecard.metric.description.accuracy"),
      };
    },
    /** reactively control the radius of the circular progress bar
     * according to the screen width
     */
    circularProgressRadius() {
      if (this.innerWidth >= 1200) return 200;
      else if (this.innerWidth < 1200 && this.innerWidth >= 1024) return 180;
      else if (this.innerWidth < 1024 && this.innerWidth >= 768) return 160;
      else if (this.innerWidth < 768 && this.innerWidth >= 640) return 140;
      else if (this.innerWidth < 640 && this.innerWidth >= 300) return 120;
      return 100;
    },
    /**
     * reactively control the stroke of the circular progress bar
     * according to the screen width
     */
    circularProgressStroke() {
      if (this.innerWidth >= 1200) return 20;
      else if (this.innerWidth < 1200 && this.innerWidth >= 1024) return 18;
      else if (this.innerWidth < 1024 && this.innerWidth >= 768) return 16;
      else if (this.innerWidth < 768 && this.innerWidth >= 640) return 14;
      else if (this.innerWidth < 640 && this.innerWidth >= 300) return 12;
      return 10;
    },
    // config for the text of the watch again button
    watchAgainButtonTitleConfig() {
      return {
        value: this.$t("player.scorecard.buttons.watchAgain"),
        class: "text-white text-md lg:text-lg font-bold",
      };
    },
  },
  methods: {
    ...Utilties,
    handleScreenSizeChange() {
      // invoked when the screen size is changing
      this.innerWidth = window.innerWidth;

      // re-render all components that are using the reRenderKey
      // here - Scorecard gets rerender -- to properly place the progress bar
      this.reRenderKey = !this.reRenderKey;
    },
    /**
     * Uses the confettiHandler() to instantiate 2 instances of confetti, which keeps
     * repeating using a requestAnimationFrame(). This goes on for a set amount of time
     * defined
     */
    throwConfetti() {
      // keep throwing some confetti until our specified time runs out
      var animationEndTime = Date.now() + confettiDuration * 1000; // 10 seconds

      const frame = () => {
        confettiHandler({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: confettiColors,
        });
        confettiHandler({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: confettiColors,
        });

        if (Date.now() < animationEndTime) {
          // store the animation frame request in a variable
          // so we can cancel it later on
          this.animationFrameRequest = requestAnimationFrame(frame);
        }
      };
      frame();
    },
    restartVideo() {
      // when watch again is clicked
      this.$emit("restart-video");
    },
    resetConfetti() {
      // remove all the confetti
      cancelAnimationFrame(this.animationFrameRequest);
    },
  },
  emits: ["restart-video"],
};
</script>

<style lang="postcss"></style>
