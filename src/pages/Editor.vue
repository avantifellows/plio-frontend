<template>
  <!--- base grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 items-stretch">
    <!--- preview grid -->
    <div class="flex flex-col ml-5 mr-5">
      <!--- plio link -->
      <URL :link="plioLink" class="justify-center m-1"></URL>

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
            ref="playerObj"
          ></video-player>

          <!--- slider with question markers -->
          <slider-with-markers
            :end="videoDuration"
            :step="sliderStep"
            v-model:value="currentTimestamp"
            v-model:markerPositions="itemTimestamps"
            @marker-selected="itemSelected"
            @marker-drag-end="itemMarkerTimestampDragEnd"
            @update="sliderUpdated"
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
          v-model:value="videoURL"
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
// How precisely should the question pop-up logic
// be measured. Time in milliseconds
const POP_UP_PRECISION_TIME = 50;

import InputText from "@/components/UI/Text/InputText.vue";
import URL from "@/components/UI/Text/URL.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import Button from "primevue/button";
import ItemEditor from "@/components/Editor/ItemEditor.vue";

// used for deep cloning objects
// var cloneDeep = require("lodash.clonedeep");

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
  props: {
    plioId: {
      default: "",
      type: String,
    },
  },
  data() {
    return {
      items: [], // list of all items created for this plio
      videoDuration: 0,
      videoId: "", // ID of the YouTube video
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
      sliderStep: 0.1, // timestep for the slider
      itemTimestamps: [], // stores the list of the timestamps of all items
      videoURL: "",
    };
  },
  created() {
    this.videoURL = "https://www.youtube.com/watch?v=uVAbT9r1UOY&ab_channel=TapeATale";
    this.items = [
      {
        time: 40,
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
        time: 80,
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
    ];
  },
  watch: {
    items() {
      this.itemTimestamps = this.getItemTimestamps(this.items);
    },
    itemTimestamps() {
      this.itemTimestamps.forEach((itemTimestamp, index) => {
        this.items[index]["time"] = itemTimestamp;
      });
    },
    videoURL(newVideoURL) {
      // invoked when the video link is updated
      var linkValidation = this.isVideoLinkValid(newVideoURL);
      this.videoInputValidation["isValid"] = linkValidation["valid"];
      if (!linkValidation["valid"]) return;

      if (this.isVideoIdValid && linkValidation["ID"] != this.videoId) {
        this.$refs.player.player.destroy();
      }
      this.videoId = linkValidation["ID"];
    },
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
    isVideoIdValid() {
      // whether the video Id is valid
      return this.videoId != "";
    },
  },
  methods: {
    itemMarkerTimestampDragEnd(itemIndex) {
      // invoked when the drag on the marker for an item is completed
      var itemTimestamp = this.itemTimestamps[itemIndex];
      this.items[itemIndex]["time"] = itemTimestamp;
      // sort the items based on timestamp
      this.items.sort(function (a, b) {
        return a["time"] - b["time"];
      });
      // update itemTimestamps based on new sorted items
      this.itemTimestamps = this.getItemTimestamps(this.items);
      // update everything else
      this.currentItemIndex = this.itemTimestamps.indexOf(itemTimestamp);
      this.currentTimestamp = itemTimestamp;
      this.updatePlayerTimestamp(itemTimestamp);
      this.markItemSelected(this.currentItemIndex);
    },
    checkItemToSelect(timestamp) {
      var itemSelected = false;
      // checks if any item is to be marked selected for the given timestamp
      this.itemTimestamps.every((itemTimestamp, index) => {
        // if the seeker is within "POP_UP_PRECISION_TIME" of the
        // specific item time, then mark the item as selected
        if (
          timestamp < itemTimestamp &&
          timestamp >= itemTimestamp - POP_UP_PRECISION_TIME / 1000
        ) {
          // mark that some item has been selected at this timestamp
          itemSelected = true;
          this.markItemSelected(index);
          // breaks the loop
          return false;
        } else {
          // go on to check the next item
          return true;
        }
      });
      if (!itemSelected) {
        this.markNoItemSelected();
      }
    },
    updatePlayerTimestamp(timestamp) {
      // update player time to the given timestamp
      this.$refs.playerObj.player.currentTime = timestamp;
    },
    sliderUpdated(timestamp) {
      // invoked when the time slider is updated
      this.updatePlayerTimestamp(timestamp);
      this.checkItemToSelect(timestamp);
    },
    itemSelected(itemIndex) {
      // invoked when an item marker has been selected
      this.updatePlayerTimestamp(this.currentTimestamp);
      this.markItemSelected(itemIndex);
    },
    markItemSelected(itemIndex) {
      // mark the item at the given index as selected
      if (itemIndex != null) {
        this.isItemSelected = true;
        this.$refs.playerObj.player.pause();
        this.currentItemIndex = itemIndex;
      }
    },
    markNoItemSelected() {
      // mark that no item has been currently selected
      this.isItemSelected = false;
      this.currentItemIndex = null;
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
      this.checkItemToSelect(timestamp);
    },
    playerReady(player) {
      // set variables once the player instance is ready
      this.videoDuration = player.duration;
      this.plioTitle = player.config.title;
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
    getItemTimestamps(items) {
      // returns the list of timestamps of the items
      var positions = [];

      items.forEach((item) => {
        positions.push(item.time);
      });

      return positions;
    },
  },
};
</script>
