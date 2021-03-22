<template>
  <div class="grid md:grid-cols-2 items-stretch">
    <div class="justify-center ml-5 mr-5">
      <URL
        :link="plioLink"
        @copied="showCopyStatus"
        class="col-span-2 justify-center m-1"
      ></URL>
      <div class="justify-center">
        <video-player
          :videoId="videoId"
          :plyrConfig="plyrConfig"
          :currentTime="currentTimestamp"
          @update="updateVideoTimestamp"
        ></video-player>
        <slider-with-markers
          @update="updateCurrentTimestamp"
          :end="videoLength"
          :step="sliderStep"
          :markerPositions="itemPositions"
          ref="slider"
        ></slider-with-markers>
      </div>
      <div class="justify-center mt-10">
        <Button label="Publish Plio" class="p-button-success" />
      </div>
    </div>
    <div class="grid grid-rows-6 grid-cols-1 m-5 justify-start">
      <div class="row-span-1 grid gap-y-4">
        <input-text
          :placeholder="videoInputPlaceholder"
          :title="videoInputTitle"
        ></input-text>
        <input-text
          :placeholder="titleInputPlaceholder"
          :title="titleInputTitle"
        ></input-text>
      </div>
    </div>
    <toast></toast>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
import URL from "@/components/UI/Text/URL.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import Button from "primevue/button";
import Toast from "primevue/toast";

export default {
  components: {
    InputText,
    URL,
    Button,
    SliderWithMarkers,
    Toast,
    VideoPlayer,
  },
  data() {
    return {
      // TODO: this is just a dummy value
      plioId: "r7R7ErAy2a",
      // TODO: dummy
      items: [{ time: 40 }, { time: 80 }],
      // TODO: dummy
      videoLength: 150,
      // TODO: dummy
      videoId: "bTqVqk7FSmY",
      currentTimestamp: 0,
      currentItemIndex: null, // current item being displayed
      plyrConfig: {
        controls: ["play-large", "play", "volume"],
      },
      // still only integer steps - fix this
      sliderStep: 0.1,
    };
  },
  computed: {
    isDraftCreated() {
      return this.plioId != "";
    },
    videoInputPlaceholder() {
      return this.$t("editor.video_input.placeholder");
    },
    videoInputTitle() {
      return this.$t("editor.video_input.title");
    },
    titleInputPlaceholder() {
      return this.$t("editor.plio_title.placeholder");
    },
    titleInputTitle() {
      return this.$t("editor.plio_title.title");
    },
    plioLink() {
      if (this.plioId == "") {
        return "";
      }
      return process.env.VUE_APP_FRONTEND + "/#/play/" + this.plioId;
    },
    itemPositions() {
      var positions = [];

      this.items.forEach((item) => {
        positions.push(item.time);
      });

      return positions;
    },
  },
  methods: {
    updateCurrentTimestamp(timestamp, markerIndex) {
      this.currentTimestamp = timestamp;
      this.currentItemIndex = markerIndex;
    },
    updateVideoTimestamp(timestamp) {
      this.$refs.slider.timestamp = timestamp;
    },
    showCopyStatus(success) {
      let severity;
      let summary;
      if (success) {
        severity = "success";
        summary = "Link Copied to Clipboard";
      } else {
        severity = "error";
        summary = "Error while copying link to Clipboard";
      }

      this.$toast.add({
        severity: severity,
        summary: summary,
        life: 3000,
      });
    },
  },
};
</script>

<style scoped>
.container {
  margin: 20px auto;
  max-width: 500px;
}
</style>
