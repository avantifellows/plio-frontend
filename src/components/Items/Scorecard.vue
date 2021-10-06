<template>
  <div class="flex flex-col bg-peach w-full h-full overflow-hidden">
    <div class="flex justify-center w-2/3 mx-auto my-auto h-full py-8">
      <div
        class="flex flex-col justify-center w-full"
        :class="{ 'space-y-8': !isCircularProgressShown }"
      >
        <!-- scorecard greeting -->
        <div
          class="text-center text-lg md:text-xl lg:text-2xl font-extrabold font-sans"
          :class="{ 'mb-4': isCircularProgressShown }"
        >
          {{ greeting }}
        </div>

        <!-- name of the plio -->
        <div class="text-center text-sm md:text-lg lg:text-xl font-medium truncate">
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
        <div
          class="flex bp-500:flex-row flex-col justify-center space-y-1 bp-500:space-x-1 bp-500:space-y-0 px-10 max-w-4xl place-self-center"
        >
          <div
            v-for="metric in metrics"
            class="rounded-md bp-500:rounded-2xl bg-yellow-400 grid grid-cols-2 bp-500:grid-rows-2 bp-500:grid-cols-none lg:grid-cols-2 lg:grid-rows-none border-2 px-4 lg:px-6 w-full h-14 bp-500:h-20 min-w-max"
            :key="metric"
          >
            <div
              class="w-full h-full flex flex-row justify-center space-x-2 bp-500:mt-2 lg:mt-0"
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
              class="text-center text-sm bp-320:text-base md:text-base lg:text-xl font-medium my-auto bp-500:whitespace-nowrap lg:whitespace-normal px-2"
            >
              {{ metric.name }}
            </div>
          </div>
        </div>

        <!-- action buttons -->
        <div
          class="place-self-center flex flex-col mt-8 space-y-8"
          :class="{ 'mt-5': isCircularProgressShown }"
          id="container"
        >
          <!-- whatsapp -->
          <icon-button
            :iconConfig="whatsAppDialogIconConfig"
            @click="shareScorecardOnWhatsApp"
            data-test="whatsapp"
          ></icon-button>

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
import Utilities, { throwConfetti } from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { useToast } from "vue-toastification";

const confetti = require("canvas-confetti");
const confettiCanvas = document.getElementById("confetticanvas");
const confettiHandler = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
});
const progressBarAnimationWaitTime = 500; // a time delay to be used for animating the progress bar

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
      innerWidth: window.innerWidth, // variable to hold the width of window
      reRenderKey: 0, // a key to re-render a component
      // classes for watch again button
      watchAgainButtonClass:
        "bg-primary hover:bg-primary-hover px-6 py-3 bp-500:p-4 bp-500:pl-10 bp-500:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      whatsAppDialogIconConfig: {
        // config for the icon of the whatsapp share button
        enabled: true,
        iconName: "whatsapp",
        iconClass: "text-primary fill-current h-12 w-12",
      },
      toast: useToast(), // use the toast component
    };
  },
  watch: {
    isShown(value) {
      if (value) {
        // if scorecard pops up then wait some time to update the
        // progress bar percentage to make the progress bar animate
        setTimeout(() => {
          this.localProgressBarPercentage = this.progressPercentage;
        }, progressBarAnimationWaitTime);

        // Also, throw some confetti in there
        throwConfetti(confettiHandler);
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
    /** The result to show in the centre of the progress bar */
    progressBarResult() {
      return {
        enabled: true,
        title: this.$t("player.scorecard.metric.description.accuracy"),
      };
    },
    /**
     * reactively control the radius of the circular progress bar
     * according to the screen width
     */
    circularProgressRadius() {
      if (this.innerWidth >= 1200) return 150;
      else if (this.innerWidth < 1200 && this.innerWidth >= 1024) return 130;
      else if (this.innerWidth < 1024 && this.innerWidth >= 768) return 110;
      else if (this.innerWidth < 768 && this.innerWidth >= 640) return 90;
      else if (this.innerWidth < 640 && this.innerWidth >= 380) return 80;
      else if (this.innerWidth < 380 && this.innerWidth >= 300) return 70;
      return 60;
    },
    /**
     * reactively control the stroke of the circular progress bar
     * according to the screen width
     */
    circularProgressStroke() {
      if (this.innerWidth >= 1200) return 22;
      else if (this.innerWidth < 1200 && this.innerWidth >= 1024) return 20;
      else if (this.innerWidth < 1024 && this.innerWidth >= 768) return 18;
      else if (this.innerWidth < 768 && this.innerWidth >= 640) return 14;
      else if (this.innerWidth < 640 && this.innerWidth >= 380) return 12;
      else if (this.innerWidth < 380 && this.innerWidth >= 300) return 10;
      return 8;
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
    ...Utilities,
    shareScorecardOnWhatsApp() {
      // share the scorecard on whatsapp
      // window
      //   .open(
      //     "https://wa.me/send?text=" +
      //       encodeURIComponent(
      //         "https://plio-assets.s3.ap-south-1.amazonaws.com/images/logo.svg"
      //       )
      //   )
      //   .focus();
      // const img = document.createElement("img");
      // img.style.width = "100px";
      // img.style.height = "100px";
      const img = new Image(100, 100);
      img.src = this.getImageSource("copy.svg");
      // img.src = "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg";
      // img.crossorigin = "anonymous";

      // img.onload = () => {
      document.getElementById("container").appendChild(img);
      let canvas = document.createElement("canvas");
      canvas.width = img.offsetWidth;
      canvas.height = img.offsetHeight;

      let context = canvas.getContext("2d");

      // copy image to it (this method allows to cut image)
      context.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        // blob ready, download it
        // let link = document.createElement("a");
        // link.download = "example.png";

        var file = new File([blob], "scorecard");
        const filesArray = [file];
        console.log(filesArray);

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          this.toast.success("inside");
          navigator
            .share({
              files: filesArray,
              title: "Pictures",
              text: "Our Pictures.",
            })
            .then(() => console.log("Share was successful."))
            .catch((error) => console.log("Sharing failed", error));
        } else {
          this.toast.error(`Your system doesn't support sharing files.`);
        }

        // link.href = window.URL.createObjectURL(blob);
        // link.click();

        // // delete the internal blob reference, to let the browser clear memory from it
        // window.URL.revokeObjectURL(link.href);
      }, "image/png");
      // };
      //   console.log(img);
      //   let canvas = document.createElement("canvas");
      //   canvas.width = "100px";
      //   canvas.height = "100px";

      //   let context = canvas.getContext("2d");

      //   console.log(img.clientWidth);
      //   console.log(img.clientHeight);
      //   // copy image to it (this method allows to cut image)
      //   context.drawImage(img, 0, 0);

      //   canvas.toBlob(function (blob) {
      //     // blob ready, download it
      //     let link = document.createElement("a");
      //     link.download = "example.png";

      //     console.log(blob);

      //     link.href = window.URL.createObjectURL(blob);
      //     link.click();

      //     // delete the internal blob reference, to let the browser clear memory from it
      //     window.URL.revokeObjectURL(link.href);
      //   }, "image/png");
      // };
    },
    handleScreenSizeChange() {
      // invoked when the screen size is changing
      this.innerWidth = window.innerWidth;

      // re-render all components that are using the reRenderKey
      // here - Scorecard gets rerender -- to properly place the progress bar
      this.reRenderKey = !this.reRenderKey;
    },
    /**
     * Emits an event to restart the video
     */
    restartVideo() {
      this.$emit("restart-video");
    },
  },
  emits: ["restart-video"],
};
</script>

<style lang="postcss"></style>
