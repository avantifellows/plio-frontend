<template>
  <div
    class="flex flex-col px-6 bp-500:px-6 sm:px-8 lg:px-32 xl:px-40 py-6 md:py-8 xl:py-10 bg-peach"
  >
    <div class="flex flex-col bp-500:grid bp-500:grid-cols-4 lg:grid-cols-5">
      <!-- thumbnail -->
      <div class="bp-500:w-full flex bp-500:block bp-500:self-center">
        <p
          v-if="pending"
          class="animate-pulse h-24 md:h-32 xl:h-42 my-2 md:my-4 lg:my-0 xl:my-6 w-full place-self-center bg-gray-500 rounded-md"
        ></p>
        <img v-else :src="videoThumbnailURL" class="rounded-md" />
      </div>
      <div
        class="col-span-3 lg:col-span-4 flex flex-col justify-between mt-4 bp-500:mr-0 bp-500:ml-8 lg:ml-14"
      >
        <div>
          <!-- publish date -->
          <p class="text-xs bp-500:text-sm sm:text-md md:text-lg text-gray-500">
            {{ lastUpdatedDisplayText }}
          </p>
          <!-- title -->
          <p
            class="text-lg sm:text-2xl lg:text-3xl xl:text-4xl tracking-tight font-bold text-yellow-900"
            :class="plioTitleClass"
          >
            {{ displayPlioTitle }}
          </p>
        </div>
        <div class="flex flex-col bp-420:flex-row bp-500:flex-col sm:flex-row">
          <!-- url -->
          <URL
            :link="plioLink"
            :urlStyleClass="urlStyleClass"
            :urlCopyButtonClass="urlCopyButtonClass"
            :isUnderlined="true"
          ></URL>
          <!-- edit button -->
          <icon-button
            :titleConfig="editButtonTextConfig"
            :buttonClass="editButtonClass"
            class="rounded-md shadow-lg bp-420:ml-4 bp-500:ml-0 sm:ml-4 mt-4 bp-420:mt-0 bp-500:mt-4 sm:mt-0"
            @click="editPlio"
          ></icon-button>
        </div>
      </div>
    </div>
    <!-- summary -->
    <div
      class="flex flex-col sm:grid sm:grid-cols-8 bg-peach-light mt-4 sm:mt-8 lg:mt-10 mb-4 sm:mb-8 lg:mb-10 px-2 bp-420:px-4 py-8 sm:p-10 rounded-lg"
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
            <p :class="textMetricValueClass">
              {{ numberOfViewers }}
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
            <p :class="textMetricValueClass">
              {{ averageWatchTime }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-6 grid grid-cols-2 mt-4 bp-420:mt-6 sm:mt-0">
        <div class="flex flex-col mx-2 bp-500:mx-4">
          <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
            <!-- completion rate -->
            <div v-if="pending" class="w-full flex flex-col justify-center animate-pulse">
              <p class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"></p>
              <p class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"></p>
            </div>
            <div v-else>
              <!-- value -->
              <p :class="cardMetricValueClass">
                {{ completionRate }}
              </p>
              <div :class="cardMetricTitleClass">
                <!-- title -->
                <p>
                  {{ $t("dashboard.summary.completion_rate.title") }}
                </p>
                <div class="flex relative">
                  <!-- info icon -->
                  <inline-svg
                    :src="require('@/assets/images/info.svg')"
                    class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                    @mouseover="showCompletedHelpText = true"
                    @mouseout="showCompletedHelpText = false"
                    @touchmove="showCompletedHelpText = true"
                    @touchend="showCompletedHelpText = false"
                  ></inline-svg>
                  <!-- info text -->
                  <p
                    class="bg-black text-white rounded-md p-2 absolute ml-4 w-28 z-10"
                    v-if="showCompletedHelpText"
                  >
                    {{ $t("dashboard.summary.completion_rate.tooltip") }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
              <!-- one minute retention -->
              <div
                v-if="pending"
                class="w-full flex flex-col justify-center animate-pulse"
              >
                <p class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"></p>
                <p class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"></p>
              </div>
              <div v-else>
                <!-- value -->
                <p :class="cardMetricValueClass">
                  {{ oneMinuteRetention }}
                </p>
                <div :class="cardMetricTitleClass">
                  <!-- title -->
                  <p>
                    {{ $t("dashboard.summary.one_minute_retention.title") }}
                  </p>
                  <div class="flex relative">
                    <!-- info icon -->
                    <inline-svg
                      :src="require('@/assets/images/info.svg')"
                      class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                      @mouseover="showRetentionHelpText = true"
                      @mouseout="showRetentionHelpText = false"
                      @touchmove="showRetentionHelpText = true"
                      @touchend="showRetentionHelpText = false"
                    ></inline-svg>
                    <!-- info text -->
                    <p
                      class="bg-black text-white rounded-md p-2 absolute ml-4 w-28"
                      v-if="showRetentionHelpText"
                    >
                      {{ $t("dashboard.summary.one_minute_retention.tooltip") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col mx-2 bp-500:mx-4">
          <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
            <!-- accuracy -->
            <div v-if="pending" class="w-full flex flex-col justify-center animate-pulse">
              <p class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"></p>
              <p class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"></p>
            </div>
            <div v-else>
              <!-- value -->
              <p :class="cardMetricValueClass">
                {{ accuracy }}
              </p>
              <div :class="cardMetricTitleClass">
                <!-- title -->
                <p>
                  {{ $t("dashboard.summary.accuracy.title") }}
                </p>
                <div class="flex relative">
                  <!-- info icon -->
                  <inline-svg
                    :src="require('@/assets/images/info.svg')"
                    class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                    @mouseover="showAccuracyHelpText = true"
                    @mouseout="showAccuracyHelpText = false"
                    @touchmove="showAccuracyHelpText = true"
                    @touchend="showAccuracyHelpText = false"
                  ></inline-svg>
                  <!-- info text -->
                  <p
                    class="bg-black text-white rounded-md p-2 absolute mt-4 -ml-14 bp-500:-ml-8 lg:ml-4 lg:mt-0 w-32 bp-500:w-40 z-10"
                    v-if="showAccuracyHelpText"
                  >
                    {{ $t("dashboard.summary.accuracy.tooltip") }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
              <!-- number of questions answered -->
              <div
                v-if="pending"
                class="w-full flex flex-col justify-center animate-pulse"
              >
                <p class="h-10 w-1/2 place-self-center bg-yellow-900 rounded-md"></p>
                <p class="h-4 w-1/2 place-self-center bg-yellow-900 rounded-md mt-1"></p>
              </div>
              <div v-else>
                <!-- value -->
                <p :class="cardMetricValueClass">
                  {{ numQuestionsAnswered }}
                </p>
                <div :class="cardMetricTitleClass">
                  <!-- title -->
                  <p>
                    {{ $t("dashboard.summary.num_questions_answered.title") }}
                  </p>
                  <div class="flex relative">
                    <!-- info icon -->
                    <inline-svg
                      :src="require('@/assets/images/info.svg')"
                      class="h-4 w-4 text-yellow-900 fill-current hover:cursor-pointer"
                      @mouseover="showQuestionsAnsweredHelpText = true"
                      @mouseout="showQuestionsAnsweredHelpText = false"
                      @touchmove="showQuestionsAnsweredHelpText = true"
                      @touchend="showQuestionsAnsweredHelpText = false"
                    ></inline-svg>
                    <!-- info text -->
                    <p
                      class="bg-black text-white rounded-md p-2 absolute ml-4 w-20 bp-420:w-28"
                      v-if="showQuestionsAnsweredHelpText"
                    >
                      {{ $t("dashboard.summary.num_questions_answered.tooltip") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- download report button -->
    <icon-button
      :iconConfig="downloadReportButtonIconConfig"
      :titleConfig="downloadReportButtonTextConfig"
      :buttonClass="downloadReportButtonClass"
      class="rounded-md shadow-lg bp-500:mb-8 sm:mb-20 md:mb-7"
      @click="downloadReport"
    ></icon-button>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import Utilities from "@/services/Functional/Utilities.js";
import URL from "@/components/UI/Text/URL";
import IconButton from "@/components/UI/Buttons/IconButton";
import { mapActions, mapState } from "vuex";

export default {
  props: {
    plioId: {
      default: "",
      type: String,
    },
    org: {
      default: "",
      type: String,
    },
  },
  components: {
    URL,
    IconButton,
  },
  data() {
    return {
      videoID: "", // video ID for the youtube video linked to the plio
      plioTitle: "", // title for the current plio
      lastUpdated: "", // date when the plio was last updated,
      // style for the text of the url component
      urlStyleClass:
        "sm:tracking-normal text-xs bp-500:text-sm md:text-md lg:text-lg font-bold text-yellow-600",
      urlCopyButtonClass: "text-yellow-600", // style for the copy button of the url component
      plioAnalytics: {}, // holds all the analytics data for the plio
      downloadReportButtonIconConfig: {
        // config for the loading icon on the download report button
        enabled: false,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 object-scale-down text-white",
      },
      // styling class for the first type of metric
      textMetricValueClass:
        "text-yellow-900 text-center sm:text-left text-xl lg:text-2xl xl:text-3xl font-bold",
      // styling class for the title of the first type of metric
      textMetricTitleClass: "text-yellow-900 text-xsm bp-420:text-xs bp-500:text-sm",
      // styling class for the second type of metric
      cardMetricValueClass:
        "w-full text-center text-2xl bp-500:text-4xl xl:text-6xl font-bold text-yellow-900",
      // styling class for the title of the second type of metric
      cardMetricTitleClass:
        "w-full text-center text-xs md:text-sm text-yellow-900 mt-2 flex justify-center flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-center",
      showAccuracyHelpText: false, // whether to show the help text for the accuracy metric
      showCompletedHelpText: false, // whether to show the help text for the % completed metric
      showRetentionHelpText: false, // whether to show the help text for the retention metric
      showQuestionsAnsweredHelpText: false, // whether to show the help text for the questions answered metric
    };
  },
  async created() {
    // fetch plio details
    this.startLoading();
    await this.fetchData();
  },
  computed: {
    ...mapState("sync", ["pending"]),
    numberOfViewers() {
      // total number of unique viewers
      return this.plioAnalytics["viewers"] || 0;
    },
    averageWatchTime() {
      // for how long did the users watch the plio on average
      return this.formatTime(Math.round(this.plioAnalytics["average-watch-time"] || 0));
    },
    accuracy() {
      // average accuracy on the plio
      if (this.plioAnalytics["accuracy"] != null)
        return Math.trunc(this.plioAnalytics["accuracy"]) + "%";
      return "0%";
    },
    completionRate() {
      // what % of users completed the plio
      if (this.plioAnalytics["percent-complete"] != null)
        return Math.trunc(this.plioAnalytics["percent-complete"]) + "%";
      return "0%";
    },
    oneMinuteRetention() {
      // what % of users were retained after the 1 minute mark
      if (this.plioAnalytics["1-min-retention"] != null)
        return Math.trunc(this.plioAnalytics["1-min-retention"]) + "%";
      return "0%";
    },
    numQuestionsAnswered() {
      // number of questions answered on average by a user
      if (this.plioAnalytics["num-questions-answered"] != null)
        return Math.round(this.plioAnalytics["num-questions-answered"]);
      return "0%";
    },
    editButtonTextConfig() {
      // config for the text of the edit plio button
      return {
        value: this.$t("dashboard.buttons.edit"),
        class: "text-sm md:text-md lg:text-lg text-black p-2",
      };
    },
    editButtonClass() {
      // class for the edit plio button
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
    plioLink() {
      // prepare the link for the plio from the plio ID
      return Utilities.getPlioLink(this.plioId, this.org);
    },
    videoThumbnailURL() {
      // link to the thumbnail for the video linked to the plio
      if (this.videoID) return `https://img.youtube.com/vi/${this.videoID}/sddefault.jpg`;
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
    displayPlioTitle() {
      // plio title to be displayed
      return this.plioTitle || this.$t("generic.placeholders.empty_title_placeholder");
    },
    isPlioTitleEmpty() {
      // whether the plio title empty
      return !this.plioTitle;
    },
    plioTitleClass() {
      // class for the plio title
      return {
        "opacity-50": this.isPlioTitleEmpty,
      };
    },
  },
  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    async fetchData() {
      // load the plio and then it's analytics data
      this.loadPlio();
      this.loadAnalytics();
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
        if (plioDetails.status != "published") this.$router.replace({ name: "404" });
        this.videoID = this.getVideoIDfromURL(plioDetails.video_url);
        this.plioTitle = plioDetails.plioTitle;
        this.lastUpdated = new Date(plioDetails.updated_at);
      });
    },
    async loadAnalytics() {
      // load the data through analytics API and save it in the respective keys
      // this.plioAnalytics["viewers"] = await PlioAPIService.getUniqueUsersCount(
      //   this.plioId
      // );
      // this.plioAnalytics["average-watch-time"] = await PlioAPIService.getAverageWatchTime(
      //   this.plioId
      // );
      // this.plioAnalytics[
      //   "num-questions-answered"
      // ] = await PlioAPIService.getNumQuestionsAnswered(this.plioId);
      // this.plioAnalytics["percent-complete"] = await PlioAPIService.getPercentComplete(
      //   this.plioId
      // );
      // this.plioAnalytics["accuracy"] = await PlioAPIService.getAccuracy(this.plioId);
      // this.plioAnalytics["1-min-retention"] = await PlioAPIService.getOneMinuteRetention(
      //   this.plioId
      // );
      await PlioAPIService.getDashboardMetrics(this.plioId);
      this.stopLoading();
    },
    getVideoIDfromURL(videoURL) {
      // gets the video Id from the YouTube URL
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(videoURL);
      return linkValidation["ID"];
    },
    editPlio() {
      // route to the editor
      this.$router.push({
        name: "Editor",
        params: { plioId: this.plioId, org: this.org },
      });
    },
    downloadReport() {
      // downloads a zip file containing the report for the plio
      this.downloadReportButtonIconConfig.enabled = true;
      PlioAPIService.getPlioDataDump(this.plioId).then((response) => {
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
