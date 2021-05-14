<template>
  <!--- base grid -->
  <div class="flex relative justify-center">
    <div
      class="grid grid-cols-1 md:grid-cols-2 items-stretch w-full"
      :class="{ 'opacity-30 pointer-events-none': blurMainScreen }"
    >
      <!--- preview grid -->
      <div class="flex flex-col ml-5 mr-5">
        <!--- plio link -->
        <URL
          :link="plioLink"
          class="justify-center m-4"
          :urlStyleClass="urlStyleClass"
          :isUnderlined="true"
        ></URL>

        <div class="justify-center">
          <!--- video preview -->
          <div v-if="!isVideoIdValid" class="flex justify-center">
            <div class="flex relative justify-center">
              <img src="@/assets/images/plain.svg" />
              <img
                src="@/assets/images/play.svg"
                class="absolute place-self-center w-12 h-12"
              />
            </div>
          </div>
          <div v-else>
            <video-player
              :videoId="videoId"
              :plyrConfig="plyrConfig"
              @update="videoTimestampUpdated"
              @ready="playerReady"
              @play="playerPlayed"
              ref="videoPlayer"
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
              :isDragDisabled="isPublished"
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
            class="shadow-lg"
            v-tooltip.right="publishButtonTooltip"
            @click="publishButtonClicked"
          ></icon-button>
        </div>
      </div>

      <!--- input grid -->
      <div class="flex flex-col m-5 justify-start">
        <div class="grid gap-y-4">
          <div class="flex w-full justify-between">
            <!--- publish/draft badge -->
            <simple-badge
              :text="statusBadge"
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
            :boxStyling="videoLinkInputStyling"
            :isDisabled="isPublished"
            v-tooltip.top="videoLinkTooltip"
          ></input-text>

          <!--- plio title -->
          <input-text
            :placeholder="titleInputPlaceholder"
            :title="titleInputTitle"
            v-model:value="plioTitle"
            ref="title"
            :boxStyling="'pl-4'"
          ></input-text>
        </div>

        <div class="flex justify-center py-2 mt-10">
          <!-- big add item button -->
          <div class="w-2/3" v-if="currentItemIndex == null">
            <icon-button
              :iconConfig="addItemIconConfig"
              :titleConfig="addItemTitleConfig"
              :buttonClass="addItemButtonClass"
              @click="addNewItem"
              :disabled="addItemDisabled"
              v-tooltip="addItemTooltip"
            ></icon-button>
          </div>
          <!--- item editor  -->
          <item-editor
            v-if="hasAnyItems && currentItemIndex != null"
            v-model:itemList="items"
            v-model:selectedItemIndex="currentItemIndex"
            @update:selectedItemIndex="navigateToItem"
            :videoDuration="videoDuration"
            @delete-selected-item="deleteItemButtonClicked"
            @delete-option="deleteOption"
            :isInteractionDisabled="isPublished"
            @error-occurred="setErrorOccurred"
            @error-resolved="setErrorResolved"
          ></item-editor>
        </div>
      </div>
    </div>
    <dialog-box
      class="fixed top-1/3"
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
import InputText from "@/components/UI/Text/InputText.vue";
import URL from "@/components/UI/Text/URL.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import ItemEditor from "@/components/Editor/ItemEditor.vue";
import PlioAPIService from "@/services/API/Plio.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import Utilities from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import DialogBox from "@/components/UI/Alert/DialogBox";
import { mapActions, mapState } from "vuex";

// used for deep cloning objects
// var cloneDeep = require("lodash.clonedeep");

// difference in seconds between consecutive checks for item pop-up
var POP_UP_CHECKING_FREQUENCY = 0.5;
var POP_UP_PRECISION_TIME = POP_UP_CHECKING_FREQUENCY * 1000;

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
    org: {
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
      dialogAction: "",
      hasUnpublishedChanges: false,
      // whether there are changes which have not been published
      // once plio is published, we don't automatically save changes
      // this tracks if there are unpublished changes
      addItemIconConfig: {
        // config for icon of add item button
        enabled: true,
        iconName: "plus-solid",
        iconClass: "text-white h-5 w-5 mr-3",
      },
      addItemTitleConfig: {
        // config for title of add item button
        value: this.$t("editor.buttons.add_question"),
      },
      // index of the option to be deleted; -1 means nothing to be deleted
      optionIndexToDelete: -1,
      videoDBId: null, // store the DB id of video object linked to the plio
      plioDBId: null, // store the DB id of plio object
      anyErrorsPresent: false, // store if any errors are present or not
      lastCheckTimestamp: 0, // time in milliseconds when the last check for item pop-up took place
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
        this.itemTimestamps = ItemFunctionalService.getItemTimestamps(this.items);
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
      // or when item is added using the add item button
      this.checkAndFixItemOrder();
      if (this.items != null && this.currentItemIndex != null)
        this.currentTimestamp = this.items[this.currentItemIndex].time;
    },
    videoURL(newVideoURL) {
      // invoked when the video link is updated
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(newVideoURL);
      this.videoInputValidation["isValid"] = linkValidation["valid"];
      if (!linkValidation["valid"]) return;

      if (this.isVideoIdValid && linkValidation["ID"] != this.videoId) {
        this.player.destroy();
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
    ...mapState("sync", ["uploading"]),
    itemType() {
      // type of the current item - null if no item is selected
      if (!this.isItemSelected) return null;
      return this.items[this.currentItemIndex].type;
    },
    statusBadge() {
      // text for the status badge
      return this.$t(`generic.status.${this.status}`);
    },
    videoInputValidation() {
      // video link validation display config
      return {
        enabled: this.videoURL,
        isValid: false,
        validMessage: this.$t("editor.video_input.validation.valid"),
        invalidMessage: this.$t("editor.video_input.validation.invalid"),
      };
    },
    urlStyleClass() {
      // style for the URL
      return "text-sm sm:text-md lg:text-lg h-full text-yellow-600 font-bold tracking-tighter";
    },
    player() {
      // returns the player instance
      return this.$refs.videoPlayer.player;
    },
    correctOptionIndex() {
      // get the index of the correct answer from options list
      return this.items[this.currentItemIndex].details.correct_answer;
    },
    isPublishButtonEnabled() {
      // whether the publish button is enabled

      // enable publish button if video id is valid
      // and no errors are present
      if (!this.isPublished) return this.isVideoIdValid && !this.anyErrorsPresent;

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
        "px-4 py-2": true,
      };
      return badgeClass;
    },
    statusBadgeTooltip() {
      // tooltip for the status badge
      if (!this.isPublished) return this.$t("tooltip.editor.status.draft");
      return this.$t("tooltip.editor.status.published");
    },
    syncStatusText() {
      // text to show the sync status
      if (this.uploading) return "Updating...";
      else return this.$t("editor.updated") + ": " + this.lastUpdatedStr;
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
      return "bg-gray-100 hover:bg-gray-200 rounded-md shadow-lg ring-primary";
    },
    backButtonTitleConfig() {
      // config for text of back button
      return {
        value: this.$t("editor.buttons.home"),
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
      if (!this.isPublished) return this.$t("editor.buttons.publish.draft");
      return this.$t("editor.buttons.publish.published");
    },
    publishButtonClass() {
      // class for the publish button
      return [
        {
          "opacity-50 cursor-not-allowed pointer-events-none": !this
            .isPublishButtonEnabled,
        },
        `rounded-md ring-green-500`,
      ];
    },
    publishButtonTooltip() {
      // tooltip text for publish button
      if (!this.isPublished) {
        if (!this.isPublishButtonEnabled)
          return this.$t("tooltip.editor.publish.draft.disabled");
        return this.$t("tooltip.editor.publish.draft.enabled");
      }
      if (!this.isPublishButtonEnabled)
        return this.$t("tooltip.editor.publish.published.disabled");
      return this.$t("tooltip.editor.publish.published.enabled");
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
      return Utilities.getPlioLink(this.plioId, this.org);
    },
    isVideoIdValid() {
      // whether the video Id is valid
      return this.videoId != "";
    },
    publishDialogTitle() {
      // title for the dialog box that appears when publishing a
      // draft plio or publishing changes to a published plio
      if (this.isPublished) {
        return this.$t("editor.dialog.publish.published.title");
      }
      return this.$t("editor.dialog.publish.draft.title");
    },
    publishDialogDescription() {
      // description for the dialog box that appears when publishing a
      // draft plio or publishing changes to a published plio
      if (this.isPublished) {
        return this.$t("editor.dialog.publish.published.description");
      }
      return this.$t("editor.dialog.publish.draft.description");
    },
    publishInProgressDialogTitle() {
      // title for the dialog box that appears when the
      // publishing for a plio is in progress
      if (this.isPublished) {
        return this.$t("editor.dialog.publishing.published.title");
      }
      return this.$t("editor.dialog.publishing.draft.title");
    },
    addItemButtonClass() {
      // styling class for add item button
      // disabled the button if plio is published
      var classObject = [
        { "cursor-not-allowed": this.addItemDisabled },

        `rounded-md font-bold p-5 h-12 w-full bg-primary-button ring-primary
        hover:bg-primary-button-hover disabled:opacity-50 shadow-lg`,
      ];
      return classObject;
    },
    addItemDisabled() {
      // whether adding item is disabled
      return this.isPublished || !this.isVideoIdValid;
    },
    addItemTooltip() {
      // tooltip for the add item button
      if (this.isPublished) return this.$t("tooltip.editor.add_item.published");
      return this.$t("tooltip.editor.add_item.draft");
    },
    videoLinkInputStyling() {
      // styling classes for the video link input box
      return ["pl-4 disabled:opacity-50", { "cursor-not-allowed": this.isPublished }];
    },
    videoLinkTooltip() {
      // tooltip for the video link input box
      if (this.isPublished) return this.$t("tooltip.editor.video_input.published");
      return undefined;
    },
  },
  methods: {
    ...mapActions("sync", ["startUploading", "stopUploading"]),
    returnToHome() {
      // returns the user back to Home
      this.$router.push({ name: "Home", params: { org: this.org } });
    },
    navigateToItem(itemIndex) {
      if (itemIndex == null) return;

      var selectedTimestamp = this.items[itemIndex].time;
      if (selectedTimestamp != null) {
        this.currentTimestamp = selectedTimestamp;
        this.itemSelected(itemIndex);
      }
    },
    checkAndFixItemOrder() {
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
      var timeBeforeDragEnded = this.items[itemIndex].time;
      var itemTimestamp = this.itemTimestamps[itemIndex];

      // check if the time after drag is valid and if not, set the item time
      // back to the one before the drag
      // else proceed with the new time
      if (
        !ItemFunctionalService.isTimestampValid(
          itemTimestamp,
          this.itemTimestamps,
          itemIndex
        )
      ) {
        this.items[itemIndex]["time"] = timeBeforeDragEnded;
        itemTimestamp = timeBeforeDragEnded;
        this.showCannotAddItemDialog();
      } else {
        this.items[itemIndex]["time"] = itemTimestamp;
      }
      // sort the items based on timestamp
      this.sortItems();
      // update itemTimestamps based on new sorted items
      this.itemTimestamps = ItemFunctionalService.getItemTimestamps(this.items);
      // update everything else
      this.currentItemIndex = this.itemTimestamps.indexOf(itemTimestamp);
      this.currentTimestamp = itemTimestamp;
      this.updatePlayerTimestamp(itemTimestamp);
      this.markItemSelected(this.currentItemIndex);
    },
    checkItemToSelect(timestamp) {
      // checks if an item is to be selected and marks/unmarks accordingly
      if (Math.abs(timestamp - this.lastCheckTimestamp) < POP_UP_CHECKING_FREQUENCY)
        return;
      this.lastCheckTimestamp = timestamp;
      var selectedItemIndex = ItemFunctionalService.checkItemPopup(
        timestamp,
        this.itemTimestamps,
        POP_UP_PRECISION_TIME
      );
      if (selectedItemIndex != null) {
        this.markItemSelected(selectedItemIndex);
      } else this.markNoItemSelected();
    },
    updatePlayerTimestamp(timestamp) {
      // update player time to the given timestamp
      this.player.currentTime = timestamp;
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
        this.player.pause();
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
    playerReady() {
      // set variables once the player instance is ready
      this.videoDuration = this.player.duration;
      if (!this.plioTitle) this.plioTitle = this.player.config.title;
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
    async loadPlio() {
      // fetch plio details
      await PlioAPIService.getPlio(this.plioId).then((plioDetails) => {
        this.items = plioDetails.items || [];
        this.videoURL = plioDetails.video_url || "";
        this.plioTitle = plioDetails.plioTitle || "";
        this.status = plioDetails.status;
        if (plioDetails.updated_at != undefined && plioDetails.updated_at != "")
          this.lastUpdated = new Date(plioDetails.updated_at);
        this.hasUnpublishedChanges = false;
        this.videoDBId = plioDetails.videoDBId;
        this.plioDBId = plioDetails.plioDBId;
      });
    },
    checkAndSavePlio() {
      // ensures that requests are made after a minimum time interval
      // don't update changes automatically once published
      if (this.isPublished) {
        this.hasUnpublishedChanges = true;
        return;
      }
      // don't save plio if video URL is empty or if any errors are present
      if (this.anyErrorsPresent || !this.isVideoIdValid) return;

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
        name: this.plioTitle,
        status: this.status,
        items: this.items,
        videoDBId: this.videoDBId,
        url: this.videoURL,
        duration: this.videoDuration,
      };
      return PlioAPIService.updatePlio(plioValue, this.plioId).then(() => {
        this.stopUploading();
        return;
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
        enabled: true,
        text: this.$t("generic.yes"),
        class:
          "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: true,
        text: this.$t("generic.no"),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      };
      // closing the dialog executes this action
      this.dialogAction = "publish";
      // show the dialogue
      this.showDialogBox = true;
    },
    dialogConfirmed() {
      // invoked when the confirm button of the dialog box is clicked
      this.showDialogBox = false;
      this.dialogDescription = "";

      // call separate methods depening on the dialog action that
      // was set
      if (this.dialogAction == "publish") this.confirmPublish();
      else if (this.dialogAction == "deleteItem") this.confirmDeleteItem();
      else if (this.dialogAction == "deleteOption") this.confirmDeleteOption();
      else if (this.dialogAction == "closeDialog") this.showDialogBox = false;

      // reset the dialog action value
      this.dialogAction = "";
    },
    dialogCancelled() {
      // invoked when the cancel button of the dialog box is clicked
      this.showDialogBox = false;
      if (this.dialogAction == "deleteOption") this.cancelDeleteOption();
    },
    cancelDeleteOption() {
      // invoked when the cancel button of the dialog box for deleting option is clicked
      this.optionIndexToDelete = -1; // reset the option index to be deleted
    },
    showCannotAddItemDialog() {
      // set up the dialog properties when user tries to add an item
      // at an invalid time
      this.dialogTitle = this.$t("editor.dialog.cannot_add_question.title");
      this.dialogDescription = this.$t("editor.dialog.cannot_add_question.description");
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.got_it"),
        class:
          "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };

      // carry out the closeDialog action when dialog is closed
      this.dialogAction = "closeDialog";
      // show the dialogue
      this.showDialogBox = true;
    },
    showCannotDeleteOptionDialog() {
      // set up the dialog properties when user tries to delete an option
      // for a question with only 2 options
      this.dialogTitle = this.$t("editor.dialog.cannot_delete_option.title");
      this.dialogDescription = this.$t("editor.dialog.cannot_delete_option.description");
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.got_it"),
        class:
          "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };

      // carry out the closeDialog action when dialog is closed
      this.dialogAction = "closeDialog";
      // show the dialogue
      this.showDialogBox = true;
    },
    confirmPublish() {
      this.showDialogBox = true;
      this.dialogTitle = this.publishInProgressDialogTitle;
      this.dialogConfirmButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };
      this.dialogCancelButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };
      // publish the plio or its changes
      this.publishPlio();
    },
    confirmDeleteItem() {
      // delete the selected item after user confirms
      this.deleteSelectedItem();
    },
    confirmDeleteOption() {
      // invoked when the confirm button of the dialog box for deleting option is clicked
      // there should always be at least 2 options, allow deletion only
      // if the number of options is >= 3
      if (this.items[this.currentItemIndex].details.options.length < 3) {
        this.showCannotDeleteOptionDialog();
        return;
      }

      // delete the option
      this.items[this.currentItemIndex].details.options.splice(
        this.optionIndexToDelete,
        1
      );
      // if the deleted option was the correct answer, reset the correct answer
      if (this.optionIndexToDelete == this.correctOptionIndex) {
        this.items[this.currentItemIndex].details.correct_answer = 0;
      }
      this.optionIndexToDelete = -1; // reset the option index to be deleted
    },
    getItemTypeForNewItem() {
      // returns the type of item being added when add item button is clicked
      return "question";
    },
    getQuestionTypeForNewQuestion() {
      // returns the type of question being added when add item button is clicked
      // only "mcq" questions are supported as of now
      return "mcq";
    },
    getMetadataForNewItem() {
      // returns a metadata object which contains only the name of the source from where
      // the question is coming from.
      // currently the source is only "default" as questions will be created on the editor only
      var meta = {};
      meta["source"] = {};
      meta["source"]["name"] = "default";
      return meta;
    },
    getDetailsForNewQuestion() {
      // barebones question structure
      var details = {};
      details["correct_answer"] = "0";
      details["text"] = "";
      details["type"] = this.getQuestionTypeForNewQuestion();
      details["options"] = ["", ""];
      return details;
    },
    addNewItem() {
      this.player.pause();
      const currentTimestamp = this.currentTimestamp;
      // newItem object will store the information of the newly created
      // item and the question
      var newItem = {};

      // check if the time where user is trying to add an item is valid or not
      if (
        !ItemFunctionalService.isTimestampValid(currentTimestamp, this.itemTimestamps)
      ) {
        this.showCannotAddItemDialog();
        return;
      }

      // create item, then create the question, then update local states
      ItemAPIService.createItem({
        plio: this.plioDBId,
        type: this.getItemTypeForNewItem(),
        time: currentTimestamp,
        meta: this.getMetadataForNewItem(),
      })
        .then((createdItem) => {
          // storing the newly created item into "newItem"
          newItem = createdItem;
          if (createdItem.type == "question") {
            var questionDetails = this.getDetailsForNewQuestion();
            questionDetails.item = createdItem.id;
            return QuestionAPIService.createQuestion(questionDetails);
          }
        })
        .then((createdQuestion) => {
          // storing the newly created question into "newItem"
          newItem.details = createdQuestion;
          // push it into items, update the itemTimestamps and currentItemIndex
          this.items.push(newItem);
          this.itemTimestamps = ItemFunctionalService.getItemTimestamps(this.items);
          this.currentItemIndex = this.itemTimestamps.indexOf(currentTimestamp);
          this.markItemSelected(this.currentItemIndex);
        });
    },
    deleteItemButtonClicked() {
      // invoked when the delete item button is clicked
      // set dialog properties
      this.dialogTitle = this.$t(`editor.dialog.delete_item.${this.itemType}.title`);
      this.dialogDescription = this.$t(
        `editor.dialog.delete_item.${this.itemType}.description`
      );
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.yes"),
        class:
          "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: true,
        text: this.$t("generic.no"),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      };
      // set the action to be carried out
      this.dialogAction = "deleteItem";
      // show the dialogue
      this.showDialogBox = true;
    },
    deleteSelectedItem() {
      // remove current item from the item list
      // set currentItemIndex to null to hide the item editor
      var itemToDelete = this.items.splice(this.currentItemIndex, 1);
      ItemAPIService.deleteItem(itemToDelete[0].id);
      this.currentItemIndex = null;
      this.showDialogBox = false;
    },
    deleteOption(optionIndex) {
      // invoked when delete option button is clicked
      // set dialog properties
      this.dialogTitle = this.$t("editor.dialog.delete_option.title");
      this.dialogDescription = "";
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.yes"),
        class: `bg-primary-button hover:bg-primary-button-hover
          focus:outline-none focus:ring-0`,
      };
      this.dialogCancelButtonConfig = {
        enabled: true,
        text: this.$t("generic.no"),
        class: `bg-white hover:bg-gray-100 focus:outline-none
          text-primary`,
      };

      // set the index to delete, set the dialog action, show the dialog
      this.optionIndexToDelete = optionIndex;
      this.dialogAction = "deleteOption";
      this.showDialogBox = true;
    },
    setErrorOccurred() {
      // invoked when some error is present
      this.anyErrorsPresent = true;
    },
    setErrorResolved() {
      // invoked when erros have been resolved
      this.anyErrorsPresent = false;
    },
  },
};
</script>
