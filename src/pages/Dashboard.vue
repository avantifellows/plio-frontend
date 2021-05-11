<template>
  <div
    class="flex flex-col px-6 bp-500:px-6 sm:px-8 lg:px-32 xl:px-40 py-6 md:py-8 xl:py-10 bg-peach"
  >
    <div class="flex flex-col bp-500:grid bp-500:grid-cols-4 lg:grid-cols-5">
      <!-- thumbnail -->
      <div class="bp-500:w-full flex bp-500:block bp-500:self-center">
        <img :src="videoThumbnailURL" class="rounded-md" />
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
          <p class="text-yellow-900 text-xsm bp-420:text-xs bp-500:text-sm">VIEWERS</p>
          <p class="text-yellow-900 text-xl lg:text-2xl xl:text-3xl font-bold">
            {{ numberOfViewers }}
          </p>
        </div>
        <div class="flex flex-col items-center sm:items-start sm:mt-10">
          <p class="text-yellow-900 text-xsm bp-420:text-xs bp-500:text-sm">
            AVERAGE WATCH TIME
          </p>
          <p
            class="text-yellow-900 text-center sm:text-left text-xl lg:text-2xl xl:text-3xl font-bold"
          >
            {{ averageWatchTime }}
          </p>
        </div>
      </div>
      <div class="col-span-6 grid grid-cols-2 mt-4 bp-420:mt-6 sm:mt-0">
        <div class="flex flex-col mx-2 bp-500:mx-4">
          <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
            <p
              class="w-full text-center text-2xl bp-500:text-4xl xl:text-6xl font-bold text-yellow-900"
            >
              {{ completionRate }}
            </p>
            <p class="w-full text-center text-xs md:text-sm text-yellow-900 mt-2">
              COMPLETED
            </p>
          </div>
          <div class="mt-4">
            <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
              <p
                class="w-full text-center text-2xl bp-500:text-4xl xl:text-6xl font-bold text-yellow-900"
              >
                {{ oneMinuteRetention }}
              </p>
              <p class="w-full text-center text-xs md:text-sm text-yellow-900 mt-2">
                RETENTION AT 1 MINUTE
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-col mx-2 bp-500:mx-4">
          <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
            <p
              class="w-full text-center text-2xl bp-500:text-4xl xl:text-6xl font-bold text-yellow-900"
            >
              {{ accuracy }}
            </p>
            <p class="w-full text-center text-xs md:text-sm text-yellow-900 mt-2">
              ACCURACY
            </p>
          </div>
          <div class="mt-4">
            <div class="bg-white py-4 border-gray-300 border-2 rounded-lg">
              <p
                class="w-full text-center text-2xl bp-500:text-4xl xl:text-6xl font-bold text-yellow-900"
              >
                {{ numQuestionsAnswered }}
              </p>
              <p class="w-full text-center text-xs md:text-sm text-yellow-900 mt-2">
                QUESTIONS ANSWERED
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <icon-button
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
      items: [], // list of all items created for this plio
      videoID: "", // video ID for the youtube video linked to the plio
      plioTitle: "", // title for the current plio
      lastUpdated: "", // date when the plio was last updated,
      urlStyleClass:
        " sm:tracking-normal text-xs bp-500:text-sm md:text-md lg:text-lg font-bold text-yellow-600", // style for the text of the url component
      urlCopyButtonClass: "text-yellow-600", // style for the copy button of the url component
      plioAnalytics: {}, // holds all the analytics data for the plio
      json_data: [
        ["Tony Peña", "New York", "United AB", "1978-03-15"],
        ["Tony Peña", "New York", "United BC", "1978-03-15"],
      ],
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
      if (this.pending) return "-";
      return this.plioAnalytics["viewers"] || 0;
    },
    averageWatchTime() {
      if (this.pending) return "-";
      return this.formatTime(Math.round(this.plioAnalytics["average-watch-time"] || 0));
    },
    accuracy() {
      if (this.pending) return "-";
      if (this.plioAnalytics["accuracy"] != null)
        return this.plioAnalytics["accuracy"] + "%";
      return "0%";
    },
    completionRate() {
      if (this.pending) return "-";
      if (this.plioAnalytics["percent-complete"] != null)
        return this.plioAnalytics["percent-complete"] + "%";
      return "0%";
    },
    oneMinuteRetention() {
      if (this.pending) return "-";
      if (this.plioAnalytics["1-min-retention"] != null)
        return this.plioAnalytics["1-min-retention"] + "%";
      return "0%";
    },
    numQuestionsAnswered() {
      if (this.pending) return "-";
      if (this.plioAnalytics["num-questions-answered"] != null)
        return this.plioAnalytics["num-questions-answered"];
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
      // get the link for the plio from the plio ID
      if (this.plioId == "") {
        return "";
      }
      var baseURL = process.env.VUE_APP_FRONTEND + "/#";
      if (this.org != "") baseURL += "/" + this.org;
      return baseURL + "/play/" + this.plioId;
    },
    videoThumbnailURL() {
      // link to the thumbnail for the video linked to the plio
      return `https://img.youtube.com/vi/${this.videoID}/sddefault.jpg`;
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
      this.loadPlio();
      this.loadAnalytics();
    },
    formatTime(timeInSeconds) {
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
        this.items = plioDetails.items || [];
        this.videoID = this.getVideoIDfromURL(plioDetails.video_url);
        this.plioTitle = plioDetails.plioTitle;
        this.lastUpdated = new Date(plioDetails.updated_at);
      });
    },
    async loadAnalytics() {
      this.plioAnalytics["viewers"] = await PlioAPIService.getUniqueUsersCount(
        this.plioId
      );
      this.plioAnalytics["average-watch-time"] = await PlioAPIService.getAverageWatchTime(
        this.plioId
      );
      this.plioAnalytics[
        "num-questions-answered"
      ] = await PlioAPIService.getNumQuestionsAnswered(this.plioId);
      this.plioAnalytics["percent-complete"] = await PlioAPIService.getPercentComplete(
        this.plioId
      );
      this.plioAnalytics["accuracy"] = await PlioAPIService.getAccuracy(this.plioId);
      this.plioAnalytics["1-min-retention"] = await PlioAPIService.getOneMinuteRetention(
        this.plioId
      );
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
      PlioAPIService.getPlioDataDump(this.plioId).then((response) => {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([response.data]));
        link.download = `plio-data-${this.plioId}.zip`;
        link.click();
      });
    },
  },
};
</script>
