<template>
  <div class="flex flex-col bg-peach w-full h-full overflow-hidden">
    <div class="flex justify-center w-full mx-auto my-auto h-full py-4" id="container">
      <div
        class="flex flex-col justify-center w-5/6"
        :class="{
          'space-y-8': !isCircularProgressShown & !this.isMobileLandscape,
          'space-y-4': !isCircularProgressShown & this.isMobileLandscape,
          'pointer-events-none': isBackgroundDisabled,
        }"
        @click="preventClick"
      >
        <!-- scorecard greeting -->
        <div
          class="text-center text-lg md:text-xl lg:text-2xl font-extrabold font-sans"
          :class="{ 'mb-4': isCircularProgressShown }"
        >
          {{ greeting }} 🎉
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
          class="relative mx-auto w-full flex justify-center"
          :radius="circularProgressRadius"
          :stroke="circularProgressStroke"
          :result="progressBarResult"
          :key="reRenderKey"
        >
        </CircularProgress>

        <!-- metric boxes -->
        <div
          class="flex bp-500:flex-row flex-col justify-center space-y-1 bp-500:space-x-1 bp-500:space-y-0 px-4 bp-500:px-10 max-w-4xl place-self-center"
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
              class="text-center text-sm bp-320:text-base md:text-base lg:text-xl font-medium my-auto bp-500:whitespace-nowrap lg:whitespace-normal px-2 h-full flex items-center"
            >
              <p>
                {{ metric.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- action buttons -->
        <div
          class="place-self-center mt-8 flex"
          :class="{
            'mt-5': isCircularProgressShown,
            'flex-row space-x-4': !isPortrait,
            'flex-col space-y-4': isPortrait,
          }"
          ignore-share-scorecard
        >
          <!-- watch again button -->
          <icon-button
            :titleConfig="watchAgainButtonTitleConfig"
            :iconConfig="watchAgainIconConfig"
            :buttonClass="watchAgainButtonClass"
            @click="restartVideo"
            data-test="watchAgainButton"
          ></icon-button>

          <!-- share button -->
          <icon-button
            :titleConfig="shareButtonTitleConfig"
            :iconConfig="shareIconConfig"
            :buttonClass="shareButtonClass"
            @click="shareScorecard"
            data-test="share"
          ></icon-button>
        </div>
      </div>
    </div>

    <!-- spinner -->
    <inline-svg
      v-if="isSpinnerShown"
      :src="getImageSource('spinner.svg')"
      class="fixed animate-spin h-10 top-1/2 w-full"
    ></inline-svg>
  </div>
</template>

<script>
import CircularProgress from "@/components/UI/Progress/CircularProgress.vue";
import Utilities, {
  throwConfetti,
  isScreenPortrait,
} from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { useToast } from "vue-toastification";
import domtoimage from "dom-to-image";
import i18n from "@/services/Localisation/i18n.js";

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
    /** number of questions that the user has answered */
    numQuestionsAnswered: {
      type: Number,
      default: 0,
    },
    /** progress to show on the progress bar in % */
    progressPercentage: {
      default: null,
      type: [Object, Number],
    },
    /** greeting of the scorecard */
    greeting: {
      default: "",
      type: String,
    },
    /** whether the scorecard has to be shown */
    isShown: {
      default: false,
      type: Boolean,
    },
    /** plio's title */
    plioTitle: {
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
        "bg-primary hover:bg-primary-hover px-6 py-3 bp-500:p-4 bp-500:px-10 sm:p-6 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      shareButtonClass:
        "bg-red-500 hover:bg-red-600 px-6 py-3 bp-500:p-4 bp-500:px-10 sm:p-6 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      watchAgainIconConfig: {
        // config for the icon of the watch again button
        enabled: true,
        iconName: "publish",
        iconClass: "text-white fill-current h-4 w-4 bp-500:h-6 bp-500:w-6",
      },
      shareIconConfig: {
        // config for the icon of the share button
        enabled: true,
        iconName: "whatsapp-greyscale",
        iconClass: "text-white fill-current h-4 w-4 bp-500:h-6 bp-500:w-6",
      },
      toast: useToast(), // use the toast component
      isSpinnerShown: false,
      isPortrait: isScreenPortrait(),
      isMobileLandscape: this.checkMobileLandscapeMode(),
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
    resultTextToShare() {
      if (i18n.global.locale == "hi") {
        return `${this.$t("player.scorecard.share.result.1")} ${
          this.progressBarResult.value
        }% ${this.progressBarResult.title.toLowerCase()} ${this.$t(
          "player.scorecard.share.result.2"
        )} ${this.numQuestionsAnsweredText} ${this.$t(
          "player.scorecard.share.result.3"
        )} 😇`;
      }

      return `I answered ${this.numQuestionsAnsweredText} with ${
        this.progressBarResult.value
      }% ${this.progressBarResult.title.toLowerCase()} on Plio today 😇`;
    },
    numQuestionsAnsweredText() {
      if (this.numQuestionsAnswered <= 1)
        return `${this.numQuestionsAnswered} ${this.$t(
          "player.scorecard.share.result.question"
        )}`;
      return `${this.numQuestionsAnswered} ${this.$t(
        "player.scorecard.share.result.questions"
      )}`;
    },
    /**
     * whether to disable the background
     */
    isBackgroundDisabled() {
      return this.isSpinnerShown;
    },
    /**
     * Wether the circular progress bar will be visible or not.
     * If the progressPercetage prop is null, the circular progress
     * will not be visible
     */
    isCircularProgressShown() {
      if (this.progressPercentage == null || this.isMobileLandscape) return false;
      return true;
    },
    /** The result to show in the centre of the progress bar */
    progressBarResult() {
      return {
        enabled: true,
        title: this.$t("player.scorecard.metric.description.accuracy"),
        value: this.localProgressBarPercentage,
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
    /** config for the text of the watch again button */
    watchAgainButtonTitleConfig() {
      return {
        value: this.$t("player.scorecard.buttons.watchAgain"),
        class: "text-white text-md sm:text-lg lg:text-xl font-bold",
      };
    },
    /** config for the text of the share button */
    shareButtonTitleConfig() {
      return {
        value: this.$t("player.scorecard.buttons.share"),
        class: "text-white text-md sm:text-lg lg:text-xl font-bold",
      };
    },
  },
  methods: {
    ...Utilities,
    checkMobileLandscapeMode() {
      return !this.isPortrait && window.innerHeight < 500;
    },
    preventClick() {
      event.preventDefault();
    },
    /**
     * share the scorecard message on whatsapp
     */
    shareOnWhatsApp() {
      var message = `🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊\n\n🏆 *${this.$t(
        "player.scorecard.share.hooray"
      )}! ${this.$t("player.scorecard.share.completed_plio")}!* 🏆\n\n`;
      if (this.plioTitle != "") message += `🌟 *${this.plioTitle}* 🌟\n\n`;
      if (this.numQuestionsAnswered != 0) message += `${this.resultTextToShare} 😇\n\n`;
      message += "🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊";

      message = encodeURI(message);
      window.open("https://api.whatsapp.com/send/?phone&text=" + message).focus();
    },
    shareScorecard() {
      if (!navigator.canShare) {
        this.shareOnWhatsApp();
        return;
      }
      this.isSpinnerShown = true;
      const element = document.getElementById("container");
      domtoimage
        .toBlob(element, {
          bgcolor: "white",
          width: element.clientWidth * 2,
          height: element.clientHeight * 2,
          style: {
            transform: "scale(" + 2 + ")",
            "transform-origin": "top center",
          },
          filter: (node) => {
            if (
              node.attributes != undefined &&
              node.attributes["ignore-share-scorecard"] != undefined
            )
              return false;
            else return true;
          },
        })
        .then((blob) => {
          var file = new File([blob], "scorecard.png", { type: blob.type });
          const filesArray = [file];
          if (navigator.canShare({ files: filesArray })) {
            var message = `${this.$t("player.scorecard.share.hooray")}!`;
            if (this.numQuestionsAnswered != 0) message += ` ${this.resultTextToShare}`;
            message += " 🏆";

            navigator
              .share({
                files: filesArray,
                title: "Plio Scorecard",
                text: message,
              })
              .then(() => {
                console.log("Share was successful.");
              })
              .catch((error) => console.log("Sharing failed", error));
          } else this.shareOnWhatsApp();
          this.isSpinnerShown = false;
        });
    },
    handleScreenSizeChange() {
      // invoked when the screen size is changing
      this.innerWidth = window.innerWidth;

      // re-render all components that are using the reRenderKey
      // here - Scorecard gets rerender -- to properly place the progress bar
      this.reRenderKey = !this.reRenderKey;

      this.isPortrait = isScreenPortrait();
      this.isMobileLandscape = this.checkMobileLandscapeMode();
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
