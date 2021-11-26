<template>
  <div class="flex flex-col bg-peach w-full h-full overflow-hidden">
    <div class="flex justify-center w-full mx-auto my-auto h-full py-4" id="container">
      <div
        class="flex flex-col justify-center w-5/6"
        :class="{
          'space-y-8': !isCircularProgressShown && !this.isMobileLandscape,
          'space-y-4': !isCircularProgressShown && this.isMobileLandscape,
        }"
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
import { mapState, mapActions } from "vuex";

const confetti = require("canvas-confetti");
const confettiCanvas = document.getElementById("confetticanvas");
const confettiHandler = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
});
const PROGRESS_BAR_ANIMATION_DELAY_TIME = 500; // a time delay to be used for animating the progress bar
const MOBILE_SCREEN_HEIGHT_THRESHOLD = 500; // the maximum height of the screen in pixels that is classified as a mobile screen

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
      default: 0,
      type: Number,
    },
    /** progress to show on the progress bar (in %) */
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
      isPortrait: isScreenPortrait(), // whether the screen is in portrait mode
      isMobileLandscape: this.checkMobileLandscapeMode(), // whether the screen corresponds to a mobile screen in landscape mode
    };
  },
  watch: {
    isShown(value) {
      if (value) {
        // if scorecard pops up then wait some time to update the
        // progress bar percentage to make the progress bar animate
        setTimeout(() => {
          this.localProgressBarPercentage = this.progressPercentage;
        }, PROGRESS_BAR_ANIMATION_DELAY_TIME);

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
    ...mapState("generic", ["windowInnerHeight"]),
    /**
     * returns the text to be shared for % accuracy and number of questions answered
     */
    resultTextToShare() {
      // the structure of the sentence changes for different languages
      if (i18n.global.locale == "hi") {
        // e.g. मैंने आज के प्लायों पर 100% सटीकता के साथ 4 प्रश्नों का उत्तर दिया
        return `${this.$t("player.scorecard.share.result.1")} ${
          this.progressBarResult.value
        }% ${this.progressBarResult.title.toLowerCase()} ${this.$t(
          "player.scorecard.share.result.2"
        )} ${this.numQuestionsAnsweredText} ${this.$t(
          "player.scorecard.share.result.3"
        )}`;
      }

      // e.g. I answered 4 questions with 100% accuracy on Plio today
      return `${this.$t("player.scorecard.share.result.1")} ${
        this.numQuestionsAnsweredText
      } ${this.$t("player.scorecard.share.result.2")} ${
        this.progressBarResult.value
      }% ${this.progressBarResult.title.toLowerCase()} ${this.$t(
        "player.scorecard.share.result.3"
      )}`;
    },
    /**
     * When the scorecard is shared, this method handles whether to use the singular
     * or the plural version of "question" based on the number of questions answered
     */
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
     * Whether the circular progress bar will be visible.
     * If progressPercentage is null, the circular progress
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
        value: Math.round(this.localProgressBarPercentage),
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
    ...mapActions("generic", ["showSpinner", "hideSpinner"]),
    ...Utilities,
    /**
     * checks whether the current screen corresponds to a mobile-sized
     * screen in landscape mode
     */
    checkMobileLandscapeMode() {
      return !this.isPortrait && this.windowInnerHeight < MOBILE_SCREEN_HEIGHT_THRESHOLD;
    },
    /**
     * share the scorecard message on whatsapp
     */
    shareOnWhatsApp() {
      var message = `🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊\n\n🏆 *${this.$t(
        "player.scorecard.share.hooray"
      )}! ${this.$t("player.scorecard.share.completed_plio")}!* 🏆\n\n`;

      // add title if it is non-empty
      if (this.plioTitle != "") message += `🌟 *${this.plioTitle}* 🌟\n\n`;

      // add result text if any question has been answered
      if (this.numQuestionsAnswered != 0) message += `${this.resultTextToShare} 😇\n\n`;
      message += "🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊";

      // required for correctly formatting the string to be used in the URL
      message = encodeURI(message);
      window.open("https://api.whatsapp.com/send/?phone&text=" + message).focus();
    },
    /**
     * shares the scorecard on multiple platforms using the Web Share API on devices where it
     * is supported and falls back to sharing a text-based scorecard otherwise
     */
    shareScorecard() {
      if (!navigator.canShare) {
        // if the web share API is not supported, share a text-based scorecard on WhatsApp
        this.shareOnWhatsApp();
        return;
      }
      this.showSpinner();
      const element = document.getElementById("container");
      /**
       * the image generated by default is of a lower resolution
       * look at this to understand how we increase the resolution of
       * the generated image: https://github.com/tsayen/dom-to-image/issues/21
       */
      const scale = 2;
      domtoimage
        .toBlob(element, {
          bgcolor: "white",
          width: element.clientWidth * scale,
          height: element.clientHeight * scale,
          style: {
            transform: "scale(" + scale + ")",
            "transform-origin": "top center",
          },
          filter: (node) => {
            // ignore DOM elements containing the attribute 'ignore-share-scorecard'
            if (
              node.attributes != undefined &&
              node.attributes["ignore-share-scorecard"] != undefined
            )
              return false;
            return true;
          },
        })
        .then((blob) => {
          // navigator.share requires an array of File objects
          var file = new File([blob], "scorecard.png", { type: blob.type });
          const filesArray = [file];

          /**
           * it is possible that the device supports the Web Share API in general
           * but does not support sharing the file that we have created; if it does
           * not, fall back to sharing the text-based scorecard on WhatsApp
           */
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
              .catch((error) => console.log("Sharing failed", error));
          } else this.shareOnWhatsApp();
          this.hideSpinner();
        });
    },
    /**
     * sets various properties based on the screen size and re-renders
     * components as needed
     */
    handleScreenSizeChange() {
      /**
       * re-render all components that are using the reRenderKey
       * here, Scorecard gets re-rendered to properly place the progress bar
       */
      this.reRenderKey = !this.reRenderKey;

      this.innerWidth = window.innerWidth;
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
