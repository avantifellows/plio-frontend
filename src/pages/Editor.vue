<template>
  <!--- base grid -->
  <div class="grid md:grid-cols-2 items-stretch">
    <!--- preview grid -->
    <div class="justify-center ml-5 mr-5">
      <!--- plio link -->
      <URL
        :link="plioLink"
        @copied="showCopyStatus"
        class="col-span-2 justify-center m-1"
      ></URL>

      <div class="justify-center">
        <!--- video preview -->
        <video-player
          :videoId="videoId"
          :plyrConfig="plyrConfig"
          @update="videoTimestampUpdated"
          @ready="playerReady"
          ref="player"
        ></video-player>

        <!--- slider with question markers -->
        <slider-with-markers
          @update="sliderTimestampUpdated"
          :end="videoDuration"
          :step="sliderStep"
          :markerPositions="itemPositions"
          ref="slider"
        ></slider-with-markers>
      </div>

      <!--- buttons -->
      <div class="justify-center mt-10">
        <Button label="Publish Plio" class="p-button-success" />
      </div>
    </div>

    <!--- input grid -->
    <div class="grid grid-rows-6 grid-cols-1 m-5 justify-start">
      <div class="row-span-1 grid gap-y-4">
        <!--- video link -->
        <input-text
          :placeholder="videoInputPlaceholder"
          :title="videoInputTitle"
          :validation="videoInputValidation"
        ></input-text>

        <!--- plio title -->
        <input-text
          :placeholder="titleInputPlaceholder"
          :title="titleInputTitle"
        ></input-text>

        <!--- item editor  -->
        <div>
          <p>current time: {{ currentTimestamp }}</p>
          <p>item index: {{ currentItemIndex }}</p>
          <p>video length: {{ videoDuration }}</p>
        </div>
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
      videoDuration: 150,
      // TODO: dummy
      videoId: "bTqVqk7FSmY",
      // TODO: dummy
      videoInputValidation: {
        enabled: true,
        isValid: false,
        validMessage: "Link is valid",
        invalidMessage: "Invalid Link",
      },
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
      // whether the draft has been created
      return this.plioId != "";
    },
    videoInputPlaceholder() {
      // placeholder text for the video link input box
      return this.$t("editor.video_input.placeholder");
    },
    videoInputTitle() {
      // title text for the video link input box
      return this.$t("editor.video_input.title");
    },
    titleInputPlaceholder() {
      // placeholder text for the Plio title input box
      return this.$t("editor.plio_title.placeholder");
    },
    titleInputTitle() {
      // title text for the Plio title input box
      return this.$t("editor.plio_title.title");
    },
    plioLink() {
      // prepare the link for the plio from the plio ID
      if (this.plioId == "") {
        return "";
      }
      return process.env.VUE_APP_FRONTEND + "/#/play/" + this.plioId;
    },
    itemPositions() {
      // timestamps of all items in the plio
      var positions = [];

      this.items.forEach((item) => {
        positions.push(item.time);
      });

      return positions;
    },
  },
  methods: {
    sliderTimestampUpdated(timestamp, markerIndex) {
      // update the value of currentTimestamp when the slider is updated
      this.currentTimestamp = timestamp;
      this.currentItemIndex = markerIndex;
      this.$refs.player.currentTime = timestamp;
    },
    videoTimestampUpdated(timestamp) {
      // update the value of slider when the video's timestamp is updated
      this.currentTimestamp = timestamp;
      this.$refs.slider.timestamp = timestamp;
    },
    playerReady(player) {
      // set variables once the player instance is ready
      this.videoDuration = player.duration;
    },
    showCopyStatus(success) {
      // display a toast to indicate if the copy operation was successful
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
