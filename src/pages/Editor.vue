<template>
  <!--- base grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 items-stretch">
    <!--- preview grid -->
    <div class="flex flex-col ml-5 mr-5">
      <!--- plio link -->
      <URL :link="plioLink" class="justify-center m-1"></URL>
      <!-- <URL :link="plioLink" class="col-span-2 justify-center m-1"></URL> -->

      <div class="justify-center">
        <!--- video preview -->
        <div v-if="!isVideoIdValid" class="flex justify-center">
          <div class="flex relative justify-center">
            <img src="@/assets/images/plain.svg" />
            <img src="@/assets/images/play.svg" class="absolute place-self-center" />
          </div>
        </div>
        <div v-else>
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
      </div>

      <!--- buttons -->
      <div class="flex justify-center mt-10">
        <Button
          label="Publish Plio"
          class="p-button-success"
          :disabled="!isVideoIdValid"
          v-tooltip.bottom="'Click to publish plio'"
        />
      </div>

      <!-- TEMPORARY - this is just the plio json preview - for testing  -->
      <div class="grid grid-cols-1">
        <pre class="text-sm overflow-auto">
          {{ JSON.stringify(items, null, 2) }}</pre
        >
      </div>
      <!-- TEMPORARY -->
    </div>

    <!--- input grid -->
    <div class="grid grid-rows-6 grid-cols-1 m-5 justify-start">
      <div class="row-start-1 row-span-1 grid gap-y-4">
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
          v-model:value="plioTitle"
          ref="title"
        ></input-text>

        <!--- item editor  -->
        <div>
          <p>current time: {{ currentTimestamp }}</p>
          <p>item index: {{ currentItemIndex }}</p>
          <p>video length: {{ videoDuration }}</p>
        </div>
      </div>
      <div class="row-start-2 row-span-3 py-2">
        <item-editor v-model:itemList="items"></item-editor>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
import URL from "@/components/UI/Text/URL.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import Button from "primevue/button";
// import Toast from "primevue/toast";
import ItemEditor from "@/components/Items/ItemEditor.vue";

export default {
  name: "Editor",
  components: {
    InputText,
    URL,
    Button,
    SliderWithMarkers,
    VideoPlayer,
    ItemEditor,
  },
  data() {
    return {
      // TODO: this is just a dummy value
      plioId: "r7R7ErAy2a",
      // TODO: dummy data
      // items: [{ time: 40 }, { time: 80 }],
      items: [
        {
          time: 2,
          details: {
            type: "mcq_single_answer",
            text:
              "हम इस विडीओ में तंत्रिका उत्तक और तांत्रिका आवेग के बारे में बात करेंगे, क्या आप तैयार है?",
            options: ["हाँ", "नही"],
            correct_answer: 0,
          },
          type: "question",
          metadata: { source: { name: "Default" } },
        },
        {
          time: 36,
          details: {
            type: "mcq_single_answer",
            text:
              "हमारे शरीर में ______________ होते हैं जो उत्तेजित होने और उत्तेजना को शरीर के भीतर एक स्थान से दूसरे स्थान तक बहुत तेजी से संचारित करने के लिए अत्यधिक विशिष्ट होते हैं।",
            options: ["तंत्रिका पेशी", "ऊतक", "WBC", "प्लाज्मा"],
            correct_answer: 0,
          },
          type: "note",
          metadata: { source: { name: "Default" } },
        },
      ],
      // TODO: dummy
      videoDuration: 0,
      // TODO: dummy
      videoId: "", // ID of the YouTube video
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
    isVideoIdValid() {
      // whether the video Id is valid
      return this.videoId != "";
    },
  },
  created() {},
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
    },
    videoLinkUpdated(value) {
      // invoked when the video link is updated
      var linkValidation = this.isVideoLinkValid(value);
      this.videoInputValidation["isValid"] = linkValidation["valid"];
      if (!linkValidation["valid"]) return;

      if (this.isVideoIdValid && linkValidation["ID"] != this.videoId) {
        this.$refs.player.player.destroy();
      }
      this.videoId = linkValidation["ID"];
    },
    isVideoLinkValid(link) {
      // checks if the link is valid
      var pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      var matches = link.match(pattern);
      if (matches) {
        return { valid: true, ID: matches[1] };
      }
      return { valid: false };
    },
    playerPlayed() {
      // invoked when the player is played from a paused state
      this.isItemSelected = false;
    },
  },
};
</script>
