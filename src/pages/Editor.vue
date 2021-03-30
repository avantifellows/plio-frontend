<template>
  <!--- base grid -->
  <div class="flex relative justify-center">
    <div
      class="grid grid-cols-1 md:grid-cols-2 items-stretch w-full"
      :class="{ 'opacity-50 pointer-events-none': blurMainScreen }"
    >
      <!--- preview grid -->
      <div class="flex flex-col ml-5 mr-5">
        <!--- plio link -->
        <URL :link="plioLink" class="justify-center m-4"></URL>

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
        <div class="flex justify-between mt-10">
          <!--- button to go back to home -->
          <icon-button
            :titleConfig="backButtonTitleConfig"
            :iconConfig="backButtonIconConfig"
            :buttonClass="backButtonClass"
            @click="returnToHome"
          ></icon-button>
          <!--- publish button -->
          <icon-button
            :titleConfig="publishButtonTitleConfig"
            :class="publishButtonClass"
            v-tooltip.right="publishButtonTooltip"
            @click="publishButtonClicked"
          ></icon-button>
        </div>
      </div>

      <!--- input grid -->
      <div class="grid grid-rows-6 grid-cols-1 m-5 justify-start">
        <div class="row-start-1 row-span-1 grid gap-y-4">
          <div class="flex w-full justify-between">
            <!--- publish/draft badge -->
            <simple-badge
              :text="capitalize(status)"
              :badgeClass="statusBadgeClass"
              v-tooltip.top="statusBadgeTooltip"
            ></simple-badge>
            <!--- text to show updated time status -->
            <p class="text-xs lg:text-sm text-gray-500" :class="syncStatusClass">
              {{ syncStatusText }}
            </p>
          </div>

          <!--- video link -->
          <input-text
            :placeholder="videoInputPlaceholder"
            :title="videoInputTitle"
            :validation="videoInputValidation"
            v-model:value="videoURL"
            ref="videoLink"
            :boxStyling="'pl-4'"
          ></input-text>

          <!--- plio title -->
          <input-text
            :placeholder="titleInputPlaceholder"
            :title="titleInputTitle"
            v-model:value="plioTitle"
            ref="title"
            :boxStyling="'pl-4'"
          ></input-text>

          <div>
            <p>current time: {{ currentTimestamp }}</p>
            <p>item index: {{ currentItemIndex }}</p>
            <p>video length: {{ videoDuration }}</p>
          </div>
        </div>
        <!--- item editor  -->
        <div class="row-start-2 row-span-3 py-2">
          <item-editor
            v-if="hasAnyItems"
            v-model:itemList="items"
            v-model:selectedItemIndex="currentItemIndex"
            @update:selectedItemIndex="navigateToItem"
            :videoDuration="videoDuration"
          ></item-editor>
        </div>
      </div>
    </div>
    <dialog-box
      class="absolute"
      v-if="showDialogBox"
      :title="dialogTitle"
      :description="dialogDescription"
      :confirmButtonConfig="dialogConfirmButtonConfig"
      :cancelButtonConfig="dialogCancelButtonConfig"
      @confirm="dialogConfirmed"
      @cancel="dialogCancelled"
    ></dialog-box>
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
import ItemEditor from "@/components/Editor/ItemEditor.vue";
import PlioService from "@/services/API/Plio.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import DialogBox from "@/components/UI/Alert/DialogBox";
import { mapActions, mapState } from "vuex";

// used for deep cloning objects
// var cloneDeep = require("lodash.clonedeep");

export default {
  name: "Editor",
  components: {
    InputText,
    URL,
    SliderWithMarkers,
    VideoPlayer,
    ItemEditor,
    IconButton,
    SimpleBadge,
    DialogBox,
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
      status: "draft", // whether the plio is in draft/publish mode
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
      videoURL: "", // full video url
      lastUpdated: new Date(), // time when the last update to remote was made
      minUpdateInterval: 1000, // minimum time in milliseconds between updates
      changeInProgress: false, // whether a change is in progress but has not been saved yet
      saveInterval: 5000, // time interval
      isBeingPublished: false, // whether the current plio is in the process of being published
      showDialogBox: false, // whether to show dialog box
      dialogTitle: "", // title for the dialog box
      dialogDescription: "", // description for the dialog box
      dialogConfirmButtonConfig: {}, // config for the confirm button of the dialog box
      dialogCancelButtonConfig: {}, // config for the cancel button of the dialog box
      hasUnpublishedChanges: false,
      // whether there are changes which have not been published
      // once plio is published, we don't automatically save changes
      // this tracks if there are unpublished changes
    };
  },
  async created() {
    // fetch plio details
    await this.loadPlio();

    // periodically check if anything has not been updated yet
    // and update it
    this.savingInterval = setInterval(() => {
      // if anything was changed but not updated, update it
      if (this.changeInProgress) {
        this.savePlio();
      }
    }, this.saveInterval);
  },
  beforeUnmount() {
    // clear interval
    clearInterval(this.savingInterval);
  },
  watch: {
    items: {
      handler() {
        this.itemTimestamps = this.getItemTimestamps(this.items);
        this.checkAndSavePlio();
      },
      deep: true,
    },
    itemTimestamps() {
      this.itemTimestamps.forEach((itemTimestamp, index) => {
        this.items[index]["time"] = itemTimestamp;
      });
      // handle item sorting and marker positioning
      // when time is changed from the time input boxes
      this.handleTimeUpdateFromEditor();
    },
    videoURL(newVideoURL) {
      // invoked when the video link is updated
      var linkValidation = this.isVideoLinkValid(newVideoURL);
      this.videoInputValidation["isValid"] = linkValidation["valid"];
      if (!linkValidation["valid"]) return;

      if (this.isVideoIdValid && linkValidation["ID"] != this.videoId) {
        this.$refs.playerObj.player.destroy();
      }
      this.videoId = linkValidation["ID"];
      this.checkAndSavePlio();
    },
    plioTitle() {
      // invoked when the plio title is update
      this.checkAndSavePlio();
    },
  },
  computed: {
    ...mapState(["uploading"]),
    isPublishButtonEnabled() {
      // whether the publish button is enabled
      if (!this.isPublished) return this.isVideoIdValid;
      return this.hasUnpublishedChanges;
    },
    blurMainScreen() {
      // whether to blur the main screen with opacity
      return this.isBeingPublished || this.showDialogBox;
    },
    statusBadgeClass() {
      // class for the status badge
      var badgeClass = {
        "text-green-500 border-green-500": this.isPublished,
        "border-black text-black": !this.isPublished,
        "text-xs": true,
        "lg:text-base": true,
      };
      return badgeClass;
    },
    statusBadgeTooltip() {
      // tooltip for the status badge
      if (!this.isPublished)
        return "This plio is currently in draft mode and only accessible to you. To make it publicly accessible, publish the plio";
      return "This plio has been published and is publicly accessible";
    },
    syncStatusText() {
      // text to show the sync status
      if (this.uploading) return "Updating...";
      else return "Updated at: " + this.lastUpdatedStr;
    },
    syncStatusClass() {
      // class for the sync status text
      return {
        "text-red-500": this.isPublished && this.hasUnpublishedChanges,
      };
    },
    backButtonIconConfig() {
      // config for icon of back button
      return {
        enabled: true,
        iconName: "chevron-left-solid",
        iconClass: "w-4 h-4 ml-2 text-primary",
      };
    },
    backButtonClass() {
      // classes for the back button
      return "bg-gray-100 hover:bg-gray-200 rounded-md";
    },
    backButtonTitleConfig() {
      // config for text of back button
      return {
        value: "Home",
        class: "p-4 text-primary font-bold",
      };
    },
    publishButtonTitleConfig() {
      // config for text of back button
      return {
        value: this.publishButtonText,
        class: "bg-green-500 p-4 text-white rounded-md font-bold hover:bg-green-600",
      };
    },
    publishButtonText() {
      // text for the publish button
      if (!this.isPublished) return "Publish Plio";
      return "Publish Changes";
    },
    publishButtonClass() {
      // class for the publish button
      return { "opacity-50 cursor-not-allowed": !this.isPublishButtonEnabled };
    },
    publishButtonTooltip() {
      // tooltip text for publish button
      if (!this.isPublished) {
        if (!this.isPublishButtonEnabled) return "Enter a valid video URL first";
        return "Click to publish the plio";
      }
      if (!this.isPublishButtonEnabled) return "No unpublished changes yet";
      return "Click to publish your changes";
    },
    lastUpdatedStr() {
      // lastUpdated as a human readable string
      return this.lastUpdated.toLocaleString();
    },
    hasAnyItems() {
      // whether there are any itesm
      return this.items.length != 0;
    },
    isPublished() {
      // whether the plio has been pubished
      return this.status == "published";
    },
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
    publishDialogTitle() {
      // title for the dialog box that appears when publishing a
      // draft plio or publishing changes to a published plio
      if (this.isPublished) {
        return "Are you sure you want to publish your changes?";
      }
      return "Are you sure you want to publish the plio?";
    },
    publishDialogDescription() {
      // description for the dialog box that appears when publishing a
      // draft plio or publishing changes to a published plio
      if (this.isPublished) {
        return "The plio will be permananently changed once you publish the changes";
      }
      return "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question";
    },
    publishInProgressDialogTitle() {
      // title for the dialog box that appears when the
      // publishing for a plio is in progress
      if (this.isPublished) {
        return "Publishing the changes..";
      }
      return "Publishing the plio...";
    },
  },
  methods: {
    ...mapActions(["startUploading", "stopUploading"]),
    returnToHome() {
      // returns the user back to Home
      this.$router.push({ name: "Home" });
    },
    capitalize(string) {
      // capitalize first letter of string and return
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    navigateToItem(itemIndex) {
      var selectedTimestamp = this.items[itemIndex].time;
      if (selectedTimestamp != null) {
        this.currentTimestamp = selectedTimestamp;
        this.itemSelected(itemIndex);
      }
    },
    handleTimeUpdateFromEditor() {
      // sort the items according to new timestamps
      // and reset the currentItemIndex
      if (this.currentItemIndex != null) {
        var currentItem = this.items[this.currentItemIndex];
        this.sortItems();
        this.currentItemIndex = this.items.indexOf(currentItem);
      }
    },
    sortItems() {
      // sort items based on ascending time values
      this.items.sort(function (a, b) {
        return a["time"] - b["time"];
      });
    },
    itemMarkerTimestampDragEnd(itemIndex) {
      // invoked when the drag on the marker for an item is completed
      var itemTimestamp = this.itemTimestamps[itemIndex];
      this.items[itemIndex]["time"] = itemTimestamp;
      // sort the items based on timestamp
      this.sortItems();
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
      if (!this.plioTitle) this.plioTitle = player.config.title;
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
    async loadPlio() {
      // fetch plio details
      PlioService.getPlio(this.plioId).then((response) => {
        var plioDetails = response.data.plioDetails;
        this.items = plioDetails.items || [];
        this.videoId = plioDetails.video_id || "";
        this.videoURL = plioDetails.video_url || "";
        this.plioTitle = plioDetails.plio_title || "";
        this.status = plioDetails.status;
        if (plioDetails.updated_at != undefined && plioDetails.updated_at != "")
          this.lastUpdated = new Date(plioDetails.updated_at);
        this.hasUnpublishedChanges = false;
      });
    },
    checkAndSavePlio() {
      // ensures that requests are made after a minimum time interval
      // don't update changes automatically once published
      if (this.isPublished) {
        this.hasUnpublishedChanges = true;
        return;
      }
      this.changeInProgress = true;
      var time = new Date();
      // only update after a certain interval between last and current update
      if (time - this.lastUpdated >= this.minUpdateInterval) {
        this.savePlio();
      }
    },
    savePlio() {
      // saves the plio data on remote
      this.changeInProgress = false;
      this.startUploading();
      this.lastUpdated = new Date();
      var plioValue = {
        video_id: this.videoId,
        video_url: this.videoURL,
        plio_title: this.plioTitle,
        video_duration: this.videoDuration,
        items: this.items,
        status: this.status,
        updated_at: this.lastUpdated,
      };
      return PlioService.updatePlio(plioValue, this.plioId).then(() => {
        this.stopUploading();
      });
    },
    publishPlio() {
      // mark the plio as published if in draft mode
      // and update the changes only if already published
      this.isBeingPublished = true;
      this.status = "published";
      this.savePlio().then(() => {
        this.isBeingPublished = false;
        this.showDialogBox = false;
        this.hasUnpublishedChanges = false;
      });
    },
    publishButtonClicked() {
      // invoked when the publish button is clicked
      // set dialog properties
      this.dialogTitle = this.publishDialogTitle;
      this.dialogDescription = this.publishDialogDescription;
      this.dialogConfirmButtonConfig = {
        text: "Yes",
        class:
          "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        text: "No",
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      };
      // show the dialogue
      this.showDialogBox = true;
    },
    dialogConfirmed() {
      // invoked when the confirm button of the dialog box is clicked
      // update the dialog properties
      this.dialogConfirmButtonConfig = {
        class: "hidden",
      };
      this.dialogCancelButtonConfig = {
        class: "hidden",
      };
      this.dialogDescription = "";
      this.dialogTitle = this.publishInProgressDialogTitle;
      // publish the plio or its changes
      this.publishPlio();
    },
    dialogCancelled() {
      // invoked when the cancel button of the dialog box is clicked
      this.showDialogBox = false;
    },
  },
};
</script>
