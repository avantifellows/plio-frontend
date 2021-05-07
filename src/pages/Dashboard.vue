<template>
  <div class="flex flex-col mx-6 sm:mx-24 md:mx-32 lg:mx-40 mt-6 md:mt-8 lg:mt-10">
    <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <!-- thumbnail -->
      <div>
        <img :src="videoThumbnailURL" />
      </div>
      <div class="col-span-2 md:col-span-3 lg:col-span-4 flex">
        <!-- publish date -->
        <div></div>
        <!-- title -->
        <div></div>
        <div class="flex">
          <!-- url -->
          <div></div>
          <!-- edit -->
          <div></div>
        </div>
      </div>
    </div>
    <!-- summary -->
    <div></div>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import VideoFunctionalService from "@/services/Functional/Video.js";

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
  data() {
    return {
      items: [], // list of all items created for this plio
      videoID: "", // video ID for the youtube video linked to the plio
      plioTitle: "", // title for the current plio
      lastUpdated: "", // date when the plio was last updated
    };
  },
  async created() {
    // fetch plio details
    await this.loadPlio();
  },
  computed: {
    videoThumbnailURL() {
      // link to the thumbnail for the video linked to the plio
      return `https://img.youtube.com/vi/${this.videoID}/sddefault.jpg`;
    },
  },
  methods: {
    async loadPlio() {
      // fetch plio details
      await PlioAPIService.getPlio(this.plioId).then((plioDetails) => {
        if (plioDetails.status != "published") this.$router.replace({ name: "404" });
        this.items = plioDetails.items || [];
        this.videoID = this.getVideoIDfromURL(plioDetails.video_url);
        this.plioTitle = plioDetails.plioTitle || "";
        this.lastUpdated = new Date(plioDetails.updated_at).toDateString();
      });
    },
    getVideoIDfromURL(videoURL) {
      // gets the video Id from the YouTube URL
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(videoURL);
      return linkValidation["ID"];
    },
  },
};
</script>
