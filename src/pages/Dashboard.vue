<template>
  <div
    class="flex flex-col px-6 bp-500:px-6 sm:px-8 lg:px-32 xl:px-40 py-6 md:py-8 xl:py-10 bg-peach"
  >
    <div class="flex flex-col bp-500:grid bp-500:grid-cols-4 lg:grid-cols-5">
      <!-- thumbnail -->
      <div
        class="bp-500:w-full flex bp-500:block bp-500:self-center justify-center"
      >
        <p
          v-if="pending"
          class="animate-pulse h-24 md:h-32 xl:h-42 my-2 md:my-4 lg:my-0 xl:my-6 w-full place-self-center bg-gray-500 rounded-md"
        ></p>
        <img
          v-else
          :src="videoThumbnailURL"
          class="rounded-md h-48 bp-500:h-auto"
          data-test="thumbnail"
          alt="Video thumbnail"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />
      </div>
      <div
        class="col-span-3 lg:col-span-4 flex flex-col justify-between mt-4 bp-500:mr-0 bp-500:ml-8 lg:ml-14 space-y-2 sm:space-y-0 lg:space-y-2"
      >
        <div>
          <!-- publish date -->
          <p class="text-xs bp-500:text-sm sm:text-md md:text-lg text-gray-500">
            {{ lastUpdatedDisplayText }}
          </p>
          <!-- title -->
          <p
            class="text-lg sm:text-xl lg:text-2xl xl:text-3xl tracking-tight font-bold text-yellow-900 truncate"
            :class="plioTitleClass"
            data-test="title"
          >
            {{ plioTitleToDisplay }}
          </p>
        </div>
        <div class="grid grid-cols-2 bp-500:flex bp-500:space-x-2">
          <!-- play plio -->
          <icon-button
            :titleConfig="playButtonTextConfig"
            :buttonClass="playButtonClass"
            :class="plioActionButtonsClass"
            @click="playPlio"
            data-test="play"
          ></icon-button>

          <!-- edit button -->
          <icon-button
            :titleConfig="editButtonTextConfig"
            :buttonClass="editButtonClass"
            :class="plioActionButtonsClass"
            @click="editPlio"
            data-test="edit"
          ></icon-button>
        </div>
      </div>
    </div>
    <!-- summary -->
    <div
      class="flex flex-col sm:grid sm:grid-cols-8 bg-peach-light mt-4 sm:mt-8 lg:mt-10 mb-4 sm:mb-8 lg:mb-10 px-2 bp-420:px-4 py-4 bp-500:py-8 sm:p-10 rounded-lg"
    >
      <div class="grid grid-cols-2 sm:flex sm:flex-col col-span-2">
        <div class="flex flex-col items-center sm:items-start">
          <!-- number of viewers -->
          <div
            v-if="pending"
            class="w-full flex flex-col justify-center sm:justify-start animate-pulse"
          >
            <p
              class="h-2 w-1/2 place-self-center sm:place-self-start bg-yellow-900 rounded-md"
            ></p>
            <p
              class="h-4 w-1/2 place-self-center sm:place-self-start bg-yellow-900 rounded-md mt-1"
            ></p>
          </div>
          <div v-else>
            <p :class="textMetricTitleClass">
              {{ $t("dashboard.summary.number_of_viewers") }}
            </p>
            <p :class="textMetricValueClass" data-test="numViewers">
              {{ numViewers }}
            </p>
          </div>
        </div>

        <!-- average watch time -->
        <div class="flex flex-col items-center sm:items-start sm:mt-10">
          <div
            v-if="pending"
            class="w-full flex flex-col justify-center sm:justify-start animate-pulse"
          >
            <p
              class="h-2 w-1/2 place-self-center sm:place-self-start bg-yellow-900 rounded-md"
            ></p>
            <p
              class="h-4 w-1/2 place-self-center sm:place-self-start bg-yellow-900 rounded-md mt-1"
            ></p>
          </div>
          <div v-else>
            <p :class="textMetricTitleClass">
              {{ $t("dashboard.summary.avg_watch_time") }}
            </p>
            <p :class="textMetricValueClass" data-test="watchTime">
              {{ averageWatchTime }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-6 flex flex-col">
        <div class="grid grid-cols-2 w-full mt-4 bp-420:mt-6 sm:mt-0">
          <div class="flex flex-col mx-2 bp-500:mx-4">
            <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
              <!-- completion rate -->
              <div
                v-if="pending"
                class="w-full flex flex-col justify-center animate-pulse py-4"
              >
                <p
                  class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"
                ></p>
                <p
                  class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"
                ></p>
              </div>
              <div v-else>
                <!-- value -->
                <p
                  :class="getCardMetricValueClass(completionRate)"
                  data-test="completion"
                >
                  {{ completionRate }}
                </p>
                <div :class="cardMetricTitleClass">
                  <!-- title -->
                  <p>
                    {{ $t("dashboard.summary.completion_rate.title") }}
                  </p>
                  <div
                    class="flex relative"
                    v-tooltip="$t('tooltip.dashboard.summary.completion_rate')"
                  >
                    <!-- info icon -->
                    <inline-svg
                      :src="questionIcon"
                      class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                    ></inline-svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
                <!-- one minute retention -->
                <div
                  v-if="pending"
                  class="w-full flex flex-col justify-center animate-pulse py-4"
                >
                  <p
                    class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"
                  ></p>
                  <p
                    class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"
                  ></p>
                </div>
                <div v-else>
                  <!-- value -->
                  <p
                    :class="getCardMetricValueClass(oneMinuteRetention)"
                    data-test="retention"
                  >
                    {{ oneMinuteRetention }}
                  </p>
                  <div :class="cardMetricTitleClass">
                    <!-- title -->
                    <p>
                      {{ $t("dashboard.summary.one_minute_retention.title") }}
                    </p>
                    <div
                      class="flex relative"
                      v-tooltip="
                        $t('tooltip.dashboard.summary.one_minute_retention')
                      "
                    >
                      <!-- info icon -->
                      <inline-svg
                        :src="questionIcon"
                        class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                      ></inline-svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col mx-2 bp-500:mx-4">
            <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
              <!-- accuracy -->
              <div
                v-if="pending"
                class="w-full flex flex-col justify-center animate-pulse py-4"
              >
                <p
                  class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"
                ></p>
                <p
                  class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"
                ></p>
              </div>
              <div v-else>
                <!-- value -->
                <p
                  :class="getCardMetricValueClass(accuracy)"
                  data-test="accuracy"
                >
                  {{ accuracy }}
                </p>
                <div :class="cardMetricTitleClass">
                  <!-- title -->
                  <p>
                    {{ $t("dashboard.summary.accuracy.title") }}
                  </p>
                  <div
                    class="flex relative"
                    v-tooltip="$t('tooltip.dashboard.summary.accuracy')"
                  >
                    <!-- info icon -->
                    <inline-svg
                      :src="questionIcon"
                      class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                    ></inline-svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
                <!-- number of questions answered -->
                <div
                  v-if="pending"
                  class="w-full flex flex-col justify-center animate-pulse py-4"
                >
                  <p
                    class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"
                  ></p>
                  <p
                    class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"
                  ></p>
                </div>
                <div v-else>
                  <!-- value -->
                  <p
                    :class="getCardMetricValueClass(numQuestionsAnswered)"
                    data-test="questionAnswered"
                  >
                    {{ numQuestionsAnswered }}
                  </p>
                  <div :class="cardMetricTitleClass">
                    <!-- title -->
                    <p>
                      {{ $t("dashboard.summary.num_questions_answered.title") }}
                    </p>
                    <div
                      class="flex relative"
                      v-tooltip="
                        $t('tooltip.dashboard.summary.num_questions_answered')
                      "
                    >
                      <!-- info icon -->
                      <inline-svg
                        :src="questionIcon"
                        class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                      ></inline-svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="hasSurveyQuestion"
          class="pt-4 bp-320:pt-4 pr-4 bp-320:pl-2 h-10 md:h-3"
          data-test="surveyQuestionWarning"
        >
          <p
            class="text-primary text-xsm md:text-xs text-center bp-420:text-right leading-none"
          >
            *{{ $t("dashboard.summary.survey_mode_warning") }}
          </p>
        </div>
      </div>
    </div>
    <!-- download report button -->
    <icon-button
      :iconConfig="downloadReportButtonIconConfig"
      :titleConfig="downloadReportButtonTextConfig"
      :buttonClass="downloadReportButtonClass"
      class="rounded-md shadow-lg bp-500:mb-8 sm:mb-20 md:mb-10 xl:mb-0"
      @click="downloadReport"
      data-test="download"
      v-tooltip="$t('tooltip.dashboard.buttons.download_report')"
    ></icon-button>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import IconButton from "@/components/UI/Buttons/IconButton";
import { mapActions, mapState } from "vuex";

export default {
  props: {
    plioId: {
      default: "",
      type: String,
    },
    workspace: {
      default: "",
      type: String,
    },
  },
  components: {
    IconButton,
  },
  data() {
    return {
      videoId: "", // video ID for the youtube video linked to the plio
      plioTitle: "", // title for the current plio
      lastUpdated: "", // date when the plio was last updated,
      // style for the text of the url component
      urlStyleClass:
        "sm:tracking-normal text-xs bp-500:text-sm md:text-md lg:text-lg font-bold text-yellow-600",
      urlCopyButtonClass: "text-yellow-600", // style for the copy button of the url component
      plioMetrics: {}, // holds all the metrics for the plio
      downloadReportButtonIconConfig: {
        // config for the loading icon on the download report button
        enabled: false,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 object-scale-down text-white",
      },
      // styling class for the title of the first type of metric
      textMetricTitleClass:
        "text-yellow-900 text-xsm bp-420:text-xs bp-500:text-sm",
      // styling class for the value of the first type of metric
      textMetricValueClass:
        "text-yellow-900 text-center sm:text-left text-xl lg:text-2xl xl:text-3xl font-bold",
      // styling class for the title of the second type of metric
      cardMetricTitleClass:
        "w-full text-center text-xs md:text-sm text-yellow-900 mt-2 flex justify-center flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-center",
      questionIcon: require("@/assets/images/question-circle-regular.svg"),
      plioActionButtonsClass: "rounded-md shadow-lg mx-1 bp-500:mx-0",
      invalidValuePlaceholder: "N/A",
    };
  },
  async created() {
    // fetch plio details
    this.startLoading();
    await this.fetchData();
  },
  computed: {
    ...mapState("sync", ["pending"]),
    hasSurveyQuestion() {
      return this.plioMetrics["has_survey_question"];
    },
    // styling class for the first type of metric
    numViewers() {
      // total number of unique viewers
      return this.plioMetrics["unique_viewers"] || 0;
    },
    averageWatchTime() {
      // for how long did the users watch the plio on average
      return this.formatTime(
        Math.round(this.plioMetrics["average_watch_time"] || 0)
      );
    },
    accuracy() {
      // average accuracy on the plio
      if (this.plioMetrics["accuracy"] != null)
        return Math.trunc(this.plioMetrics["accuracy"]) + "%";
      return this.invalidValuePlaceholder;
    },
    completionRate() {
      // what % of users completed the plio
      if (this.plioMetrics["percent_completed"] != null)
        return Math.trunc(this.plioMetrics["percent_completed"]) + "%";
      return this.invalidValuePlaceholder;
    },
    oneMinuteRetention() {
      // what % of users were retained after the 1 minute mark
      if (this.plioMetrics["percent_one_minute_retention"] != null)
        return (
          Math.trunc(this.plioMetrics["percent_one_minute_retention"]) + "%"
        );
      return this.invalidValuePlaceholder;
    },
    numQuestionsAnswered() {
      // number of questions answered on average by a user
      if (this.plioMetrics["average_num_answered"] != null)
        return Math.round(this.plioMetrics["average_num_answered"]);
      return this.invalidValuePlaceholder;
    },
    playButtonTextConfig() {
      return {
        value: this.$t("dashboard.buttons.play"),
        class: "text-sm md:text-md lg:text-lg text-white p-2",
      };
    },
    playButtonClass() {
      return "bg-primary hover:bg-primary-hover rounded-lg ring-primary px-2";
    },
    editButtonTextConfig() {
      return {
        value: this.$t("dashboard.buttons.edit"),
        class: "text-sm md:text-md lg:text-lg text-black p-2",
      };
    },
    editButtonClass() {
      return "bg-yellow-400 hover:bg-yellow-500 rounded-lg ring-primary px-2";
    },
    downloadReportButtonTextConfig() {
      // config for the text of the download report button
      return {
        value: this.$t("dashboard.buttons.download_report"),
        class: "text-sm sm:text-lg text-white p-2 sm:p-4",
      };
    },
    downloadReportButtonClass() {
      // class for the download report button
      return "bg-primary hover:bg-primary-hover rounded-lg ring-primary px-2 w-full bp-420:w-60";
    },
    videoThumbnailURL() {
      // link to the thumbnail for the video linked to the plio
      if (this.videoId)
        return VideoFunctionalService.getYouTubeVideoThumbnailURL(this.videoId);
      return "";
    },
    lastUpdatedString() {
      // lastUpdated as a human readable string
      return this.lastUpdated.toLocaleString();
    },
    lastUpdatedDisplayText() {
      // text for showing last updated date
      return this.$t("dashboard.updated") + ": " + this.lastUpdatedString;
    },
    plioTitleToDisplay() {
      return (
        this.plioTitle ||
        this.$t("generic.placeholders.empty_title_placeholder")
      );
    },
    isPlioTitleEmpty() {
      return !this.plioTitle;
    },
    plioTitleClass() {
      return {
        "opacity-50": this.isPlioTitleEmpty,
      };
    },
  },
  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    async fetchData() {
      this.loadPlio();
      await this.loadMetrics();
    },
    // styling class for the second type of metric
    getCardMetricValueClass(metricValue) {
      return [
        {
          "text-2xl bp-500:text-4xl xl:text-6xl":
            !this.isCardMetricValueInvalid(metricValue),
          "text-xl bp-500:text-2xl xl:text-3xl my-1 bp-500:my-2 xl:my-4":
            this.isCardMetricValueInvalid(metricValue),
        },
        `w-full text-center font-bold text-yellow-900`,
      ];
    },
    isCardMetricValueInvalid(metricValue) {
      return metricValue == this.invalidValuePlaceholder;
    },
    formatTime(timeInSeconds) {
      // convert time from seconds to a human readable format
      if (timeInSeconds == null || isNaN(timeInSeconds)) return null;
      if (!timeInSeconds) return "0 secs";
      var hours = Math.floor(timeInSeconds / 3600);
      var minutes = Math.floor((timeInSeconds % 3600) / 60);
      var seconds = timeInSeconds % 60;
      var formattedTime = "";
      if (hours != 0) formattedTime += `${hours} hrs`;
      if (minutes != 0) formattedTime += ` ${minutes} mins`;
      if (seconds != 0) formattedTime += ` ${seconds} secs`;
      return formattedTime.trim();
    },
    loadPlio() {
      // fetch plio details
      PlioAPIService.getPlio(this.plioId).then((plioDetails) => {
        if (plioDetails.status != "published")
          this.$router.replace({ name: "404" });
        this.videoId = VideoFunctionalService.getYouTubeVideoIdfromURL(
          plioDetails.videoURL
        );
        this.plioTitle = plioDetails.plioTitle;
        this.lastUpdated = new Date(plioDetails.updatedAt);
      });
    },
    async loadMetrics() {
      let response = await PlioAPIService.getMetrics(this.plioId);
      this.plioMetrics = response.data;
      this.$mixpanel.track("Visit Dashboard", {
        "Plio UUID": this.plioId,
        "Plio Average Watch Time": this.averageWatchTime,
        "Plio Number of Viewers": this.numViewers,
        "Plio Retention At 1 Minute": this.oneMinuteRetention,
        "Plio Accuracy": this.accuracy,
        "Plio Completion Rate": this.completionRate,
        "Plio Num Questions Answered": this.numQuestionsAnswered,
      });

      this.stopLoading();
    },
    editPlio() {
      this.$router.push({
        name: "Editor",
        params: { plioId: this.plioId, workspace: this.workspace },
      });
    },
    playPlio() {
      this.$router.push({
        name: "Player",
        params: { plioId: this.plioId, workspace: this.workspace },
      });
    },
    downloadReport() {
      // downloads a zip file containing the report for the plio
      this.downloadReportButtonIconConfig.enabled = true;
      PlioAPIService.getPlioReport(this.plioId).then((response) => {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([response.data]));
        link.download = `plio-data-${this.plioId}.zip`;
        link.click();
        this.downloadReportButtonIconConfig.enabled = false;
      });
    },
  },
};
</script>
