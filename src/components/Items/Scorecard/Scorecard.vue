<template>
  <div class="flex flex-col bg-peach w-full h-full overflow-hidden">
    <div class="flex justify-center w-2/3 mx-auto my-auto h-full py-8">
      <div class="flex flex-col justify-center" id="">
        <!-- scorecard title -->
        <div class="text-center text-2xl font-extrabold">{{ title }}</div>

        <!-- canvas element for drawing the confetti -->
        <canvas id="confetticanvas" class="fixed z-50"></canvas>

        <!-- circular progress bar -->
        <CircularProgress
          class="relative mx-auto"
          :radius="130"
          :progress="localProgressPercentage"
          :stroke="20"
          :progressNumberIndicator="progressNumberIndicator"
        >
        </CircularProgress>

        <!-- metric boxes -->
        <div class="flex flex-row justify-between gap-4">
          <div
            v-for="metric in metrics"
            class="w-full rounded-2xl bg-pastel-yellow grid grid-rows-3 border-2"
            :key="metric"
          >
            <div class="row-span-2 w-full h-full flex flex-row justify-center">
              <inline-svg
                :src="getIconSource(metric.icon.source)"
                class="h-10 w-10 place-self-center"
                :class="metric.icon.color"
              ></inline-svg>
              <p class="text-4xl font-bold my-auto">{{ metric.value }}</p>
            </div>
            <div class="text-center text-xl font-medium">{{ metric.description }}</div>
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
    title: {
      // title of the scorecard
      default: "Hooray! Congratulations on completing the Plio!",
      type: String,
    },
    showScorecard: {
      // indicator of when the scorecard has popped up
      default: false,
      type: Boolean,
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
  created() {},
  mounted() {},
  computed: {
    watchAgainButtonTitleConfig() {
      // config for the text of the watch again button
      return {
        value: "Watch again",
        class: "text-white text-md font-bold",
      };
    },
    watchAgainButtonClass() {
      // class for the watch again button
      return "bg-primary hover:bg-primary-hover px-2 rounded-md shadow-xl";
    },
  },
  methods: {
    ...Utilties,
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
