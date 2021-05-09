<template>
  <div
    class="flex flex-col px-2 bp-500:px-6 sm:px-8 md:px-24 lg:px-40 py-6 md:py-8 xl:py-10 bg-peach"
  >
    <div class="flex flex-col bp-500:grid bp-500:grid-cols-4 lg:grid-cols-5">
      <!-- thumbnail -->
      <div class="w-1/3 place-self-center bp-500:w-full">
        <img :src="videoThumbnailURL" class="rounded-md" />
      </div>
      <div
        class="col-span-3 lg:col-span-4 flex flex-col justify-between mx-4 mt-4 bp-500:mr-0 ml-8 lg:ml-14"
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
        <div class="flex flex-col sm:flex-row">
          <!-- url -->
          <URL
            :link="plioLink"
            :urlStyleClass="urlStyleClass"
            :urlCopyButtonClass="urlCopyButtonClass"
            isUnderlined="true"
          ></URL>
          <!-- edit button -->
          <icon-button
            :titleConfig="editButtonTextConfig"
            :buttonClass="editButtonClass"
            class="rounded-md shadow-lg mt-4 sm:ml-4 sm:mt-0"
            @click="editPlio"
          ></icon-button>
        </div>
      </div>
    </div>
    <!-- summary -->
    <!-- <div></div> -->
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import URL from "@/components/UI/Text/URL";
import IconButton from "@/components/UI/Buttons/IconButton";

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
    };
  },
  async created() {
    // fetch plio details
    await this.loadPlio();
  },
  computed: {
    editButtonTextConfig() {
      // config for the text of the main create button
      return {
        value: this.$t("dashboard.buttons.edit"),
        class: "text-sm md:text-md lg:text-lg text-black p-2",
      };
    },
    editButtonClass() {
      // class for the create button
      return "bg-yellow-400 hover:bg-yellow-500 rounded-lg ring-primary px-2";
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
    async loadPlio() {
      // fetch plio details
      await PlioAPIService.getPlio(this.plioId).then((plioDetails) => {
        if (plioDetails.status != "published") this.$router.replace({ name: "404" });
        this.items = plioDetails.items || [];
        this.videoID = this.getVideoIDfromURL(plioDetails.video_url);
        this.plioTitle = plioDetails.plioTitle;
        this.lastUpdated = new Date(plioDetails.updated_at);
      });
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
  },
};
</script>
