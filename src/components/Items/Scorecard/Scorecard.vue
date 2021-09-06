<template>
  <div class="flex flex-col bg-peach w-full h-full overflow-hidden">
    <div class="flex justify-center w-2/3 mx-auto my-auto h-full py-8">
      <div class="flex flex-col justify-center" id="">
        <!-- scorecard greeting -->
        <div class="text-center text-base md:text-xl lg:text-2xl font-extrabold">
          {{ plioTitle }}
        </div>

        <!-- scorecard greeting -->
        <div class="text-center text-sm md:text-lg lg:text-xl font-extrabold">
          {{ greeting }}
        </div>

        <!-- canvas element for drawing the confetti -->
        <canvas id="confetticanvas" class="fixed z-50"></canvas>

        <!-- circular progress bar -->
        <CircularProgress
          class="relative mx-auto"
          :radius="circularProgressRadius"
          :progress="localProgressPercentage"
          :stroke="circularProgressStroke"
          :progressNumberIndicator="progressNumberIndicator"
          :key="reRenderKey"
        >
        </CircularProgress>

        <!-- metric boxes -->
        <div class="flex flex-row justify-between gap-4">
          <div
            v-for="metric in metrics"
            class="w-full rounded-2xl bg-pastel-yellow grid grid-rows-2 lg:grid-rows-3 border-2"
            :key="metric"
          >
            <div class="lg:row-span-2 w-full h-full flex flex-row justify-center gap-3">
              <inline-svg
                :src="getIconSource(metric.icon.source)"
                class="h-4 md:h-6 lg:h-10 w-4 md:w-6 lg:w-10 place-self-center"
                :class="metric.icon.color"
              ></inline-svg>
              <p class="text-base md:text-2xl lg:text-4xl font-bold my-auto">
                {{ metric.value }}
              </p>
            </div>
            <div class="text-center text-sm md:text-base lg:text-xl font-medium">
              {{ metric.description }}
            </div>
          </div>
        </div>

        <!-- action buttons -->
        <div class="place-self-center mt-3">
          <icon-button
            :titleConfig="watchAgainButtonTitleConfig"
            :buttonClass="watchAgainButtonClass"
            @click="watchAgain"
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
const confettiHandler = confetti.create(confettiCanvas, { resize: true });

export default {
  name: "Scorecard",
  components: {
    CircularProgress,
    IconButton,
  },
  props: {
    metrics: {
      // details of all the metrics to show
      // format of one metric --
      // {
      //   name: "METRIC_NAME",
      //   icon: {
      //     source: "SVG_NAME.svg",
      //     color: "TAILWIND_CLASSES",
      //   },
      //   value: VALUE_TO_SHOW,
      //   description: DESCRIPTION_TO_SHOW,
      // },
      default: () => [],
      type: Array,
    },
    progressPercentage: {
      // progress to show on the progress bar in %
      default: 0,
      type: Number,
    },
    greeting: {
      // greeting of the scorecard
      default: "Hooray! Congratulations on completing the Plio!",
      type: String,
    },
    showScorecard: {
      // indicator of when the scorecard has popped up
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
      localProgressPercentage: 0, // local value of progress
      showConfetti: false, // to show confetti or not
      progressNumberIndicator: {
        // what to show in between the progress bar
        enabled: true,
        additionalText: "Accuracy",
      },
      // variable to store the animation frame request
      // used when confetti popping has to be stopped
      animationFrameRequest: null,
      innerWidth: window.innerWidth, // variable to hold the width of window
      reRenderKey: 0, // a key to re-render a component
    };
  },
  watch: {
    showScorecard(value) {
      if (value) {
        // if scorecard pops up then wait some time to update the
        // `localProgressPercentage`. This makes the progress bar animate
        setTimeout(() => {
          this.localProgressPercentage += this.progressPercentage;
          this.showConfetti = true;
        }, 500);

        // Also, throw some confetti in there
        this.throwConfetti();
      } else {
        // if scorecard is not visible anymore, reset things
        this.localProgressPercentage = 0;
        this.showConfetti = false;
      }
    },
  },
  created() {
    // reactively handle screen resizing
    window.addEventListener("resize", this.handleScreenSizeChange);
  },
  mounted() {},
  unmounted() {
    window.removeEventListener("resize", this.handleScreenSizeChange);
  },
  computed: {
    circularProgressRadius() {
      // reactively control the radius of the circular progress bar
      // according to the screen width
      if (this.innerWidth >= 1200) return 150;
      else if (this.innerWidth < 1200 && this.innerWidth >= 1024) return 120;
      else if (this.innerWidth < 1024 && this.innerWidth >= 768) return 100;
      else if (this.innerWidth < 768 && this.innerWidth >= 640) return 80;
      return 50;
    },
    circularProgressStroke() {
      // reactively control the stroke of the circular progress bar
      // according to the screen width
      if (this.innerWidth >= 1200) return 20;
      else if (this.innerWidth < 1200 && this.innerWidth >= 1024) return 18;
      else if (this.innerWidth < 1024 && this.innerWidth >= 768) return 15;
      else if (this.innerWidth < 768 && this.innerWidth >= 640) return 12;
      return 8;
    },
    watchAgainButtonTitleConfig() {
      // config for the text of the watch again button
      return {
        value: "Watch again",
        class: "text-white text-sm sm:text-base lg:text-lg font-bold",
      };
    },
    watchAgainButtonClass() {
      // class for the watch again button
      return "bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none";
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
    throwConfetti() {
      // keep throwing some confetti until our specified time runs out
      var end = Date.now() + 10 * 1000;
      var colors = ["#ff718d", "#fdff6a"];

      const frame = () => {
        confettiHandler({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confettiHandler({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          // store the animation frame request in a variable
          // so we can cancel it later on
          this.req = requestAnimationFrame(frame);
        }
      };
      frame();
    },
    watchAgain() {
      // when watch again is clicked
      this.$emit("watch-again");
    },
    resetConfetti() {
      // remove all the confetti
      cancelAnimationFrame(this.req);
    },
  },
  emits: ["watch-again"],
};
</script>

<style lang="postcss"></style>
