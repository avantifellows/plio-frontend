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
          @play="playerPlayed"
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
          @input="videoLinkUpdated"
          ref="videoLink"
        ></input-text>

        <!--- plio title -->
        <input-text
          :placeholder="titleInputPlaceholder"
          :title="titleInputTitle"
          @input="titleUpdated"
          ref="title"
        ></input-text>

        <!--- item editor  -->
        <div>
          <p>current time: {{ currentTimestamp }}</p>
          <p>item index: {{ currentItemIndex }}</p>
          <p>video length: {{ videoDuration }}</p>
        </div>
      </div>
    </div>
    <!-- <toast></toast> -->
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
import URL from "@/components/UI/Text/URL.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import Button from "primevue/button";
// import Toast from "primevue/toast";

export default {
  components: {
    InputText,
    URL,
    Button,
    SliderWithMarkers,
    // Toast,
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
      videoId: "bTqVqk7FSmY", // ID of the YouTube video
      // TODO: dummy
      videoInputValidation: {
        // video link validation display config
        enabled: true,
        isValid: false,
        validMessage: "Link is valid",
        invalidMessage: "Invalid Link",
      },
      isItemSelected: false, // indicated if an item has been selected currently
      plioTitle: "", // title for the current plio
      currentTimestamp: 0, // current timestamp
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
      this.$refs.player.currentTime = timestamp;
      if (markerIndex != null) {
        this.isItemSelected = true;
        this.$refs.player.player.pause();
        this.currentItemIndex = markerIndex;
      }
    },
    videoTimestampUpdated(timestamp) {
      // update the value of slider when the video's timestamp is updated
      if (this.isItemSelected) {
        // handles the case when the marker has been selected (and hence, video should pause)
        // but the emit from the video time update is still on the way
        // if we don't have this, the slider gets another timestamp update
        return;
      }
      this.currentTimestamp = timestamp;
      this.$refs.slider.timestamp = timestamp;
    },
    playerReady(player) {
      // set variables once the player instance is ready
      this.videoDuration = player.duration;
      this.plioTitle = player.config.title;
      this.$refs.title.value = this.plioTitle;
    },
    showCopyStatus() {
      // let severity;
      // let summary;
      // if (success) {
      //   severity = "success";
      //   summary = "Link Copied to Clipboard";
      // } else {
      //   severity = "error";
      //   summary = "Error while copying link to Clipboard";
      // }
      // this.$toast.add({
      //   severity: severity,
      //   summary: summary,
      //   life: 3000,
      // });
    },
    titleUpdated(value) {
      // invoked when the plio title input is updated
      this.plioTitle = value;
    },
    videoLinkUpdated(value) {
      // invoked when the video link is updated
      if (!this.isVideoLinkValid(value)) return;
      this.videoInputValidation["isValid"] = true;
      this.videoId = this.getVideoIdfromTitle(value);
      // TODO: update Plyr
      console.log(this.videoId);
      console.log(this.$refs.player.player.source);
      // this.videoLink = value;
    },
    getVideoIdfromTitle(link) {
      // TODO: dummy
      console.log(link);
      return "uVAbT9r1UOY";
    },
    isVideoLinkValid(link) {
      // checks if the link is valid
      // TODO: dummy
      console.log(link);
      return true;
    },
    playerPlayed() {
      this.isItemSelected = false;
    },
  },
};
</script>
