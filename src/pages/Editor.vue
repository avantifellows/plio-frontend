<template>
  <!--- base grid -->
  <div class="flex relative justify-center md:mx-4 lg:mx-10 xl:mx-20">
    <div
      class="grid grid-cols-1 md:grid-cols-2 items-stretch w-full"
      :class="{ 'opacity-30 pointer-events-none': isBackgroundDisabled }"
      data-test="blurDiv"
    >
      <!--- preview grid -->
      <div
        class="flex flex-col mx-6 z-0"
        :class="{ 'mt-6': !isVideoIdValid }"
        data-test="previewDiv"
      >
        <div
          class="my-8 flex justify-center space-x-1 bp-360:space-x-2 sm:space-x-4"
          v-if="isVideoIdValid"
          data-test="upperButtons"
        >
          <!-- share plio -->
          <icon-button
            v-if="isPublished"
            :titleConfig="sharePlioTitleClass"
            :iconConfig="sharePlioIconConfig"
            :buttonClass="sharePlioButtonClass"
            @click="showSharePlioLinkDialog"
            data-test="sharePlioButton"
          ></icon-button>

          <!-- play plio -->
          <icon-button
            v-if="isPublished"
            :titleConfig="playPlioTitleClass"
            :iconConfig="playPlioIconConfig"
            :buttonClass="playPlioButtonClass"
            @click="redirectToPlayer"
            data-test="playPlioButton"
          ></icon-button>

          <!-- preview plio -->
          <icon-button
            v-if="!isPublished"
            :titleConfig="previewPlioTitleClass"
            :iconConfig="playPlioIconConfig"
            :buttonClass="playPlioButtonClass"
            :isDisabled="uploading"
            @click="togglePlioPreviewMode"
            data-test="previewPlioButton"
          ></icon-button>

          <!-- embed plio -->
          <icon-button
            v-if="isPublished"
            :titleConfig="embedPlioTitleClass"
            :iconConfig="embedPlioIconConfig"
            :buttonClass="embedPlioButtonClass"
            @click="showEmbedPlio"
            data-test="embedPlioButton"
          ></icon-button>
        </div>

        <div class="justify-center" data-test="video">
          <!--- video preview -->
          <div
            v-if="!isVideoIdValid"
            class="flex justify-center"
            data-test="videoPreviewSkeleton"
          >
            <div class="flex relative justify-center items-center w-full">
              <div
                class="w-full h-40 bp-420:h-48 bp-500:h-72 sm:h-96 md:h-64 lg:h-80 xl:h-96 rounded-md bg-gray-300"
              ></div>
              <div class="absolute flex flex-col items-center">
                <img
                  class="w-12 bp-420:w-16 bp-500:w-24 md:w-16 lg:w-24"
                  src="@/assets/images/youtube.png"
                />
                <p class="text-sm bp-420:text-base">{{ $t("generic.preview") }}</p>
              </div>
            </div>
          </div>
          <div v-else data-test="videoPreview">
            <div class="relative">
              <!-- video player -->
              <video-player
                :videoId="videoId"
                :plyrConfig="plyrConfig"
                :id="editorVideoPlayerId"
                @update="videoTimestampUpdated"
                @ready="playerReady"
                @play="playerPlayed"
                ref="videoPlayer"
                class="z-0"
                data-test="videoPlayer"
              ></video-player>
              <!-- maximize button -->
              <transition name="maximize-btn-transition" data-test="transitionMaximize">
                <icon-button
                  v-if="showItemModal && isModalMinimized"
                  :titleConfig="maximizeButtonTitleClass"
                  :buttonClass="maximizeButtonClass"
                  @click="maximizeModal"
                  class="absolute z-20"
                  id="maximizeButton"
                  data-test="maximizeButton"
                ></icon-button>
              </transition>
              <!-- transition for minimizing/maximizing item modal -->
              <transition enter-active-class="grow" leave-active-class="shrink">
                <!-- item modal component -->
                <item-modal
                  v-if="!isModalMinimized"
                  id="editorModal"
                  class="absolute z-10 inset-0 border-2"
                  :class="{ hidden: !showItemModal }"
                  :selectedItemIndex="currentItemIndex"
                  :itemList="items"
                  :previewMode="true"
                  :videoPlayerId="editorVideoPlayerId"
                  @toggle-minimize="minimizeModal"
                  data-test="itemModal"
                ></item-modal>
              </transition>
            </div>
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
        <!-- info for subjective question -->
        <div
          v-if="isQuestionTypeSubjective"
          class="mt-10 w-full p-2 rounded-md border border-yellow-400 flex space-x-4"
        >
          <!-- icon -->
          <inline-svg
            :src="getImageSource('exclamation-circle-solid.svg')"
            class="w-10 h-10 text-yellow-600 fill-current"
          ></inline-svg>
          <!-- text -->
          <p class="text-yellow-600 my-auto">
            {{ $t("editor.headings.subjective_question_warning") }}
          </p>
        </div>

        <!--- buttons -->
        <div
          class="flex justify-center space-x-1 bp-360:space-x-2"
          :class="lowerButtonsContainerClass"
          v-if="isVideoIdValid"
          data-test="lowerButtons"
        >
          <!--- button to go back to home -->
          <icon-button
            :titleConfig="backButtonTitleConfig"
            :iconConfig="homeIconConfig"
            :buttonClass="backButtonClass"
            @click="returnToHome"
            data-test="homeButton"
          ></icon-button>
          <!--- publish button -->
          <icon-button
            :titleConfig="publishButtonTitleConfig"
            :iconConfig="publishButtonIconConfig"
            :class="publishButtonClass"
            class="shadow-lg"
            v-tooltip.right="publishButtonTooltip"
            @click="showPublishConfirmationDialogBox"
            data-test="publishButton"
          ></icon-button>
          <!-- analyze plio -->
          <icon-button
            v-if="isPublished"
            :titleConfig="analyzePlioTitleConfig"
            :iconConfig="analyzePlioIconConfig"
            :buttonClass="analyzePlioButtonClass"
            @click="redirectToDashboard"
            data-test="analyseButton"
          ></icon-button>
        </div>
      </div>

      <!--- input grid -->
      <div class="flex flex-col m-5 justify-start" data-test="inputDiv">
        <div class="grid gap-y-4" data-test="meta">
          <!-- info about pasting youtube link -->
          <div
            class="flex items-center space-x-2 bg-primary rounded-lg p-4"
            v-if="!isVideoIdValid && !pending"
            data-test="videoLinkInfo"
          >
            <inline-svg
              :src="getImageSource('publish.svg')"
              class="w-12 h-12 text-white fill-current"
            ></inline-svg>
            <p class="text-white text-xs bp-500:text-base md:text-sm lg:text-base">
              {{ $t("editor.video_input.info.1") }}
              <a
                href="https://youtube.com/upload"
                target="_blank"
                class="underline font-bold"
                >{{ $t("editor.video_input.info.2") }}</a
              >
              {{ $t("editor.video_input.info.3") }}
            </p>
          </div>
          <div class="flex w-full justify-between" v-else>
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
            data-test="videoLinkInput"
          ></input-text>

          <!--- plio title -->
          <input-text
            :placeholder="titleInputPlaceholder"
            :title="titleInputTitle"
            v-model:value="plioTitle"
            ref="title"
            :boxStyling="'pl-4'"
            v-if="isVideoIdValid"
            data-test="plioName"
          ></input-text>
        </div>

        <div
          class="flex justify-center py-2 mt-8 sm:mt-10 mb-16"
          v-if="isVideoIdValid"
          data-test="itemDiv"
        >
          <!-- boxes for adding different types of items -->
          <div
            class="bg-peach rounded-lg p-4 bp-360:p-8 w-full bp-500:w-3/4 md:w-full lg:w-3/4 flex flex-col items-center shadow-lg"
            :class="itemPickerClass"
            v-if="currentItemIndex == null"
          >
            <div class="flex flex-col items-center">
              <p class="text-yellow-900 text-xl font-bold">
                {{ $t("editor.headings.add_question") }}
              </p>
              <div class="grid grid-cols-2 mt-6 w-full justify-items-center">
                <button
                  :disabled="addItemDisabled"
                  @click="addNewItem('mcq')"
                  class="w-10/12 group flex flex-col space-y-2 focus:outline-none bg-white p-4 rounded-xl border-2 border-gray-400 items-center justify-center hover:cursor-pointer disabled:cursor-not-allowed"
                  :class="questionTypeSelectorClass"
                  v-tooltip.bottom="addMCQTooltip"
                  data-test="addMCQItem"
                >
                  <inline-svg
                    :src="getImageSource('radio-button.svg')"
                    class="h-4 w-4 fill-current text-primary group-hover:text-white group-disabled:text-primary"
                  ></inline-svg>
                  <p class="font-bold text-center">{{ $t("generic.mcq") }}</p>
                </button>
                <button
                  :disabled="addItemDisabled"
                  @click="addNewItem('subjective')"
                  class="w-10/12 group flex flex-col space-y-2 focus:outline-none bg-white p-4 rounded-xl border-2 border-gray-400 items-center justify-center hover:cursor-pointer disabled:cursor-not-allowed"
                  :class="questionTypeSelectorClass"
                  v-tooltip.bottom="addSubjectiveQuestionTooltip"
                  data-test="addSubjectiveItem"
                >
                  <inline-svg
                    :src="getImageSource('subjective-question.svg')"
                    class="w-20 fill-current text-primary group-hover:text-white group-disabled:text-primary"
                  ></inline-svg>
                  <p class="font-bold text-center">{{ $t("generic.subjective") }}</p>
                </button>
              </div>
            </div>
          </div>
          <!--- item editor  -->
          <item-editor
            v-if="hasAnyItems && currentItemIndex != null"
            v-model:itemList="items"
            v-model:selectedItemIndex="currentItemIndex"
            :videoDuration="videoDuration"
            :isInteractionDisabled="isPublished"
            v-model:questionTypeIndex="currentQuestionTypeIndex"
            @update:selectedItemIndex="navigateToItem"
            @delete-selected-item="showDeleteItemDialogBox"
            @delete-option="deleteOption"
            @error-occurred="setErrorOccurred"
            @error-resolved="setErrorResolved"
            @question-type-changed="questionTypeChanged"
            @show-image-uploader="toggleImageUploaderBox"
            data-test="itemEditor"
          ></item-editor>
        </div>
      </div>
    </div>
    <!-- generic dialog box -->
    <dialog-box
      :class="dialogBoxClass"
      class="fixed top-1/3"
      v-if="isDialogBoxShown"
      :title="dialogTitle"
      :description="dialogDescription"
      :confirmButtonConfig="dialogConfirmButtonConfig"
      :cancelButtonConfig="dialogCancelButtonConfig"
      @confirm="dialogConfirmed"
      @cancel="dialogCancelled"
      data-test="dialogBox"
    ></dialog-box>
    <!-- image uploader dialog box -->
    <ImageUploaderDialog
      v-if="isImageUploaderDialogShown"
      :uploadedImage="itemImage"
      @close-dialog="toggleImageUploaderBox"
      @image-selected="uploadImage"
      @delete-image="deleteLinkedImage"
      data-test="imageUploaderDialog"
    ></ImageUploaderDialog>

    <canvas
      id="sharePlioConfettiCanvas"
      class="fixed z-50"
      v-if="isPublishedPlioDialogShown"
    ></canvas>

    <!-- plio preview -->
    <div
      class="fixed top-1/20 w-11/12 bp-420:w-10/12 shadow-xl"
      :class="plioPreviewContainerClass"
      v-if="isPreviewPlioShown"
    >
      <div class="flex relative w-full">
        <Plio
          class="w-full"
          :plioId="plioId"
          :org="org"
          :previewMode="true"
          :key="reRenderKey"
          containerClass="h-full"
          @initiated="setPlioPreviewLoaded"
        ></Plio>
        <div class="w-full absolute flex justify-end">
          <!-- close button -->
          <icon-button
            v-if="isPlioPreviewLoaded"
            :iconConfig="closePreviewPlioIconConfig"
            :buttonClass="closePreviewPlioButtonClass"
            @click="closePlioPreviewMode"
            data-test="closePlioPreviewModeButton"
          ></icon-button>
        </div>
      </div>
    </div>

    <!-- spinner -->
    <inline-svg
      v-if="isSpinnerShown"
      :src="getImageSource('spinner.svg')"
      class="fixed animate-spin h-10 top-1/4"
    ></inline-svg>

    <!-- dialog to show after publishing -->
    <div
      class="fixed top-1/4 bg-white rounded-lg flex flex-col border border-gray-700 shadow-lg z-10 mx-2 sm:mx-0"
      v-if="isPublishedPlioDialogShown"
      v-click-away="closePublishedPlioDialog"
      data-test="publishedDialog"
    >
      <div class="w-full flex justify-end p-2">
        <!-- close button -->
        <icon-button
          :iconConfig="closeDialogIconConfig"
          :buttonClass="closeDialogButtonClass"
          @click="closePublishedPlioDialog"
          data-test="closePublishedPlioDialogButton"
        ></icon-button>
      </div>

      <div class="px-4 bp-360:px-8 bp-500:px-12 pt-4 pb-8">
        <!-- title -->
        <p class="text-md bp-420:text-xl sm:text-2xl text-gray-500 font-bold mx-4">
          {{ $t("editor.dialog.published.title") }}
        </p>
        <div class="flex flex-col space-y-3 my-8 mx-4 bp-420:mx-8 bp-500:mx-16">
          <!-- share plio -->
          <icon-button
            :titleConfig="dialogSharePlioTitleClass"
            :iconConfig="sharePlioIconConfig"
            :buttonClass="sharePlioButtonClass"
            @click="hidePublishedDialogShowShareDialog"
            data-test="publishedDialogShareButton"
          ></icon-button>

          <!-- play plio -->
          <icon-button
            :titleConfig="dialogPlayPlioTitleClass"
            :iconConfig="playPlioIconConfig"
            :buttonClass="playPlioButtonClass"
            @click="redirectToPlayer"
            data-test="publishedDialogPlayButton"
          ></icon-button>

          <!-- embed plio -->
          <icon-button
            :titleConfig="dialogEmbedPlioTitleClass"
            :iconConfig="embedPlioIconConfig"
            :buttonClass="embedPlioButtonClass"
            @click="hidePublishedDialogShowEmbedDialog"
            data-test="publishedDialogEmbedButton"
          ></icon-button>

          <!-- go back home -->
          <icon-button
            :titleConfig="dialogHomeTitleClass"
            :iconConfig="homeIconConfig"
            :buttonClass="dialogHomeButtonClass"
            @click="returnToHome"
            data-test="publishedDialogHomeButton"
          ></icon-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
import Plio from "@/pages/Embeds/Plio.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import ItemEditor from "@/components/Editor/ItemEditor.vue";
import PlioAPIService from "@/services/API/Plio.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import ImageAPIService from "@/services/API/Image.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import Utilities, {
  throwConfetti,
  resetConfetti,
} from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import DialogBox from "@/components/UI/Alert/DialogBox";
import ItemModal from "@/components/Player/ItemModal.vue";
import { mapActions, mapState } from "vuex";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog.vue";

// importing the confetti.js module
const confetti = require("canvas-confetti");

// used for deep cloning objects
var cloneDeep = require("lodash.clonedeep");
var isEqual = require("deep-eql");

// difference in seconds between consecutive checks for item pop-up
var POP_UP_CHECKING_FREQUENCY = 0.5;
var POP_UP_PRECISION_TIME = POP_UP_CHECKING_FREQUENCY * 1000;
// offset from the POP_UP_CHECKING_FREQUENCY for the minimum question timestamp
var MINIMUM_QUESTION_TIME_OFFSET = 0.1;
// minimum timestamp for each question
var MINIMUM_QUESTION_TIMESTAMP = MINIMUM_QUESTION_TIME_OFFSET + POP_UP_CHECKING_FREQUENCY;

export default {
  name: "Editor",
  components: {
    InputText,
    SliderWithMarkers,
    VideoPlayer,
    ItemEditor,
    IconButton,
    SimpleBadge,
    DialogBox,
    ItemModal,
    ImageUploaderDialog,
    Plio,
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
    // setting up the confetti handler, giving it access to a canvas element
    const confettiCanvas = document.getElementById("sharePlioConfettiCanvas");
    const confettiHandler = confetti.create(confettiCanvas, { resize: true });

    return {
      items: [], // list of all items created for this plio
      videoDuration: 0,
      videoId: "", // ID of the YouTube video
      status: "draft", // whether the plio is in draft/publish mode
      isItemSelected: false, // indicated if an item has been selected currently
      plioTitle: "", // title for the current plio
      currentTimestamp: 0, // current timestamp
      currentItemIndex: null, // current item being displayed
      currentQuestionTypeIndex: 0, // index of the current question type being created
      plyrConfig: {
        controls: ["play-large", "play", "volume", "current-time"],
        invertTime: false,
      },
      closeDialogIconConfig: {
        // config for the icon of the button to close the dialog that comes after publishing
        enabled: true,
        iconName: "times-circle-solid",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      // class for the button to close the dialog that comes after publishing
      closeDialogButtonClass: "bg-white w-10 h-10 p-2",
      closePreviewPlioIconConfig: {
        // config for the icon of the button to close the plio preview
        enabled: true,
        iconName: "times-circle-white",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      // class for the button to close the plio preview
      closePreviewPlioButtonClass: "w-10 h-10 -mr-4 -mt-4",
      sliderStep: 0.1, // timestep for the slider
      itemTimestamps: [], // stores the list of the timestamps of all items
      videoURL: "", // full video url
      lastUpdated: new Date(), // time when the last update to remote was made
      minUpdateInterval: 1000, // minimum time in milliseconds between updates
      changeInProgress: false, // whether a change is in progress but has not been saved yet
      saveInterval: 5000, // time interval
      isBeingPublished: false, // whether the current plio is in the process of being published
      isDialogBoxShown: false, // whether to show dialog box
      dialogTitle: "", // title for the dialog box
      dialogDescription: "", // description for the dialog box
      dialogConfirmButtonConfig: {}, // config for the confirm button of the dialog box
      dialogCancelButtonConfig: {}, // config for the cancel button of the dialog box
      dialogBoxClass: "", // classes for the dialog box
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
      // index of the option to be deleted; -1 means nothing to be deleted
      optionIndexToDelete: -1,
      videoDBId: null, // store the DB id of video object linked to the plio
      plioDBId: null, // store the DB id of plio object
      anyErrorsPresent: false, // store if any errors are present or not
      isPublishedPlioDialogShown: false, // whether to show the dialog that comes after publishing plio
      lastCheckTimestamp: 0, // time in milliseconds when the last check for item pop-up took place
      // mapping of questionType value to index in the list of question types
      questionTypeToIndex: {
        mcq: 0,
        subjective: 1,
      },
      isModalMinimized: false, // whether the preview modal is minimized or not
      // styling class for the minimize button
      maximizeButtonClass:
        "bg-primary hover:bg-primary-hover p-1 lg:p-2 px-2 rounded-md shadow-xl",
      // styling class for the share plio button
      sharePlioButtonClass: "bg-yellow-300 hover:bg-yellow-400 p-2 px-4 rounded-md",
      sharePlioIconConfig: {
        // config for the icon of the share plio button
        enabled: true,
        iconName: "share",
        iconClass: "text-yellow-800 fill-current h-3 bp-360:h-4 w-3 bp-360:w-4",
      },
      // styling class for the play plio button
      playPlioButtonClass: "bg-primary hover:bg-primary-hover p-2 px-4 rounded-md",
      // styling class for the embed plio button
      embedPlioButtonClass: "bg-brown hover:bg-dark-brown p-2 px-4 rounded-md",
      // styling class for the analyze plio button
      analyzePlioButtonClass: "bg-red-500 hover:bg-red-600 p-2 bp-420:px-4 rounded-md",
      // styling class for the home button on dialog that comes after publishing
      dialogHomeButtonClass: "bg-peach hover:bg-peach-hover p-2 px-4 rounded-md",
      playPlioIconConfig: {
        // config for the icon of the play plio button
        enabled: true,
        iconName: "play",
        iconClass: "text-white fill-current h-3 bp-360:h-4 w-3 bp-360:w-4",
      },
      embedPlioIconConfig: {
        // config for the icon of the embed plio button
        enabled: true,
        iconName: "code-braces",
        iconClass: "text-white fill-current h-3 bp-360:h-4 w-3 bp-360:w-4",
      },
      analyzePlioIconConfig: {
        // config for the icon of the analyze plio button
        enabled: true,
        iconName: "analyze",
        iconClass: "text-white fill-current h-4 w-4",
      },
      homeIconConfig: {
        // config for the icon of the home button
        enabled: true,
        iconName: "home",
        iconClass: "text-yellow-800 fill-current h-4 w-4",
      },
      publishButtonIconConfig: {
        // config for the icon of the publish button
        enabled: true,
        iconName: "publish",
        iconClass: "text-white fill-current h-4 w-4",
      },
      isImageUploaderDialogShown: false, // whether to show the image uploader or not
      loadedPlioDetails: {}, // details of the plio fetched when the page was loaded
      isPreviewPlioShown: false, // whether to show a full preview of the plio before publishing
      reRenderKey: 0, // key required to re-render the plio preview player
      editorVideoPlayerId: "editorVideoPlayer", // id of the video player in the editor
      isPlioPreviewLoaded: false, // whether the plio preview has been loaded
      // class for the button to close the dialog that comes after publishing
      confettiHandler: confettiHandler,
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
        if (isEqual(this.loadedPlioDetails.items, this.items)) return;
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
      if (this.items != null && this.currentItemIndex != null) {
        // set minimum question timestamp as MINIMUM_QUESTION_TIMESTAMP
        if (this.items[this.currentItemIndex].time < MINIMUM_QUESTION_TIMESTAMP)
          this.items[this.currentItemIndex].time = MINIMUM_QUESTION_TIMESTAMP;
        this.currentTimestamp = this.items[this.currentItemIndex].time;
      }
    },
    videoURL(newVideoURL) {
      // invoked when the video link is updated
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(newVideoURL);
      if (!linkValidation["valid"]) return;

      if (this.isVideoIdValid && linkValidation["ID"] != this.videoId) {
        this.player.destroy();
      }
      this.videoId = linkValidation["ID"];

      if (this.loadedPlioDetails.videoURL == newVideoURL) return;
      this.checkAndSavePlio();
    },
    plioTitle(newTitle) {
      // invoked when the plio title is update
      if (this.loadedPlioDetails.plioTitle == newTitle) return;
      this.checkAndSavePlio();
    },
  },
  computed: {
    ...mapState("sync", ["uploading", "pending"]),
    ...mapState("generic", ["isEmbedPlioDialogShown"]),
    isSpinnerShown() {
      // whether the spinner needs to be shown
      return (this.isPreviewPlioShown && !this.isPlioPreviewLoaded) || this.pending;
    },
    lowerButtonsContainerClass() {
      // classes for the container holding the buttons below the slider
      return {
        "my-10": !this.isQuestionTypeSubjective,
        "my-8": this.isQuestionTypeSubjective,
      };
    },
    plioPreviewContainerClass() {
      // classes for the container holding the plio preview
      return {
        "bg-white border-2 border-gray-400 rounded-lg": this.isPlioPreviewLoaded,
      };
    },
    itemImage() {
      // URL of the image present for the current item
      if (this.currentItemIndex == null) return null;
      if (this.items[this.currentItemIndex].details.image == null) return null;
      return this.items[this.currentItemIndex].details.image.url;
    },
    isQuestionTypeSubjective() {
      // whether the type of the question being created is subjective
      if (this.currentItemIndex == null) return false;
      return this.items[this.currentItemIndex].details.type == "subjective";
    },
    itemPickerClass() {
      // class for the item picker
      return { "opacity-30 cursor-not-allowed": this.addItemDisabled };
    },
    questionTypeSelectorClass() {
      // class for the question type selectors
      return {
        "hover:bg-primary hover:text-white hover:border-primary": !this.addItemDisabled,
      };
    },
    maximizeButtonTitleClass() {
      // styling class for the title of minimize button
      return {
        value: this.isModalMinimized
          ? this.$t(`editor.buttons.show_${this.itemType}`)
          : this.$t("editor.buttons.show_video"),
        class: "text-white text-xs lg:text-sm tracking-tighter",
      };
    },
    sharePlioTitleClass() {
      // styling class for the title of share plio button
      return {
        value: this.$t("editor.buttons.share_plio"),
        class: "text-sm bp-420:text-base text-yellow-800",
      };
    },
    dialogSharePlioTitleClass() {
      // styling class for the title of share plio button on dialog box
      // that comes after publishing
      return {
        value: this.$t("editor.dialog.published.buttons.share_plio"),
        class: "text-yellow-800",
      };
    },
    playPlioTitleClass() {
      // styling class for the title of play plio button
      return {
        value: this.$t("editor.buttons.play_plio"),
        class: "text-sm bp-420:text-base text-white",
      };
    },
    previewPlioTitleClass() {
      // styling class for the title of preview plio button
      return {
        value: this.$t("editor.buttons.preview_plio"),
        class: "text-sm bp-420:text-base text-white",
      };
    },
    dialogPlayPlioTitleClass() {
      // styling class for the title of play plio button on dialog box
      // that comes after publishing
      return {
        value: this.$t("editor.dialog.published.buttons.play_plio"),
        class: "text-white",
      };
    },
    embedPlioTitleClass() {
      // styling class for the title of embed plio button
      return {
        value: this.$t("editor.buttons.embed_plio"),
        class: "text-sm bp-420:text-base text-white",
      };
    },
    dialogEmbedPlioTitleClass() {
      // styling class for the title of embed plio button on dialog box
      // that comes after publishing
      return {
        value: this.$t("editor.dialog.published.buttons.embed_plio"),
        class: "text-white",
      };
    },
    dialogHomeTitleClass() {
      // styling class for the title of go back home button on dialog box
      // that comes after publishing
      return {
        value: this.$t("editor.dialog.published.buttons.home"),
        class: "text-yellow-800",
      };
    },
    analyzePlioTitleConfig() {
      // styling class for the title of analyze plio button
      return {
        value: this.$t("editor.buttons.analyze_plio"),
        class: "text-white text-sm bp-420:text-base",
      };
    },
    showItemModal() {
      // whether the item modal needs to be shown
      return this.hasAnyItems && this.isAnyItemActive;
    },
    isAnyItemActive() {
      // whether any item is currently active
      return this.currentItemIndex != null;
    },
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
        isValid: this.isVideoIdValid,
        validMessage: this.$t("editor.video_input.validation.valid"),
        invalidMessage: this.$t("editor.video_input.validation.invalid"),
      };
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
    isBackgroundDisabled() {
      // whether to disable the main screen
      return (
        this.isBeingPublished ||
        this.isDialogBoxShown ||
        this.isImageUploaderDialogShown ||
        this.isPublishedPlioDialogShown ||
        this.isEmbedPlioDialogShown ||
        this.pending ||
        this.isPreviewPlioShown
      );
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
    backButtonClass() {
      // classes for the back button
      return "p-2 bp-420:px-4 bg-peach hover:bg-peach-hover rounded-md shadow-lg ring-primary";
    },
    backButtonTitleConfig() {
      // config for text of back button
      return {
        value: this.$t("editor.buttons.home"),
        class: "text-yellow-800 font-bold text-sm bp-420:text-base",
      };
    },
    publishButtonTitleConfig() {
      // config for text of back button
      return {
        value: this.publishButtonText,
        class: "text-white font-bold text-sm bp-420:text-base",
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
        `rounded-md ring-green-500 bg-green-500 hover:bg-green-600 p-2 bp-420:px-4`,
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
    videoInputPlaceholder() {
      // placeholder text for the video link input box
      return this.$t("editor.video_input.placeholder");
    },
    videoInputTitle() {
      // title text for the video link input box
      if (!this.isVideoIdValid) return "";
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
      return this.getPlioLink(this.plioId, this.org);
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
    addItemDisabled() {
      // whether adding item is disabled
      return this.isPublished || !this.isVideoIdValid;
    },
    addMCQTooltip() {
      // tooltip for adding the mcq question
      return this.$t("tooltip.editor.add_item.mcq");
    },
    addSubjectiveQuestionTooltip() {
      // tooltip for the subjective question
      return this.$t("tooltip.editor.add_item.subjective");
    },
    videoLinkInputStyling() {
      // styling classes for the video link input box
      return ["pl-4 disabled:opacity-50", { "cursor-not-allowed": this.isPublished }];
    },
    videoLinkTooltip() {
      // tooltip for the video link input box
      return this.isPublished
        ? this.$t("tooltip.editor.video_input.published")
        : this.$t("tooltip.editor.video_input.draft");
    },
  },
  methods: {
    ...mapActions("sync", [
      "startUploading",
      "stopUploading",
      "startLoading",
      "stopLoading",
    ]),
    ...mapActions("generic", ["showSharePlioDialog", "showEmbedPlioDialog"]),
    ...Utilities,
    /**
     * sets the plio preview to have loaded
     */
    setPlioPreviewLoaded() {
      this.isPlioPreviewLoaded = true;
    },
    /**
     * hides the published plio dialog and shows the share plio dialog
     */
    hidePublishedDialogShowShareDialog() {
      this.isPublishedPlioDialogShown = false;
      this.showSharePlioLinkDialog();
    },
    /**
     * hides the published plio dialog and shows the embed plio dialog
     */
    hidePublishedDialogShowEmbedDialog() {
      this.isPublishedPlioDialogShown = false;
      this.showEmbedPlio();
    },
    /**
     * closes the published plio dialog
     */
    closePublishedPlioDialog() {
      this.isPublishedPlioDialogShown = false;
      resetConfetti();
    },

    /**
     * shows the embed plio dialog
     */
    showEmbedPlio() {
      this.player.pause();
      this.showEmbedPlioDialog(this.plioId);
    },
    /**
     * shows the share plio dialog
     */
    showSharePlioLinkDialog() {
      this.player.pause();
      this.showSharePlioDialog(this.plioLink);
    },
    /**
     * redirects the user to the player for this plio if it is published
     */
    redirectToPlayer() {
      if (!this.isPublished) return;
      this.$router.push({
        name: "Player",
        params: { org: this.org, plioId: this.plioId },
      });
    },
    /**
     * redirects the user to the dashboard for this plio if it is published
     */
    redirectToDashboard() {
      if (!this.isPublished) return;
      this.$router.push({
        name: "Dashboard",
        params: { org: this.org, plioId: this.plioId },
      });
    },
    /**
     * unlinks the image from the current question, and deletes it from S3
     */
    deleteLinkedImage() {
      var imageIdToDelete = this.items[this.currentItemIndex].details.image.id;
      ImageAPIService.deleteImage(imageIdToDelete);
      this.items[this.currentItemIndex].details.image = null;
    },
    /**
     * upload the image file to the server and update
     * the question object with the linked image data
     *
     * @param {File} imageFile the image content to be uploaded
     */
    uploadImage(imageFile) {
      this.startLoading();
      ImageAPIService.uploadImage(imageFile).then((response) => {
        this.items[this.currentItemIndex].details.image = response.data;
        this.stopLoading();
      });
    },
    /**
     * toggles the visibility of the image uploader dialog box
     */
    toggleImageUploaderBox() {
      this.isImageUploaderDialogShown = !this.isImageUploaderDialogShown;
    },
    /**
     * invoked when the question type is changed
     * updates the question type in the item list
     *
     * @param {String} newQuestionType the new type of the question
     */
    questionTypeChanged(newQuestionType) {
      this.items[this.currentItemIndex].details.type = newQuestionType;
    },
    /**
     * minimizes the modal
     *
     * @param {Object} positions contains the coordinates required to hide the
     *                           minimize button and show the maximize button
     */
    minimizeModal(positions) {
      // set some CSS variables which tells the animation
      // where the modal should shrink to and where the maximize button should pop up
      let root = document.documentElement;
      root.style.setProperty("--t-origin-x", positions.centerX + "px");
      root.style.setProperty("--t-origin-y", positions.centerY + "px");
      root.style.setProperty("--maximize-btn-left", positions.leftX + "px");
      root.style.setProperty("--maximize-btn-top", positions.leftY + "px");

      this.isModalMinimized = true;
    },
    /**
     * toggles the visibility of the minimize / maximize buttons
     */
    maximizeModal() {
      this.isModalMinimized = !this.isModalMinimized;
    },
    /**
     * returns the user back to Home
     */
    returnToHome() {
      this.$router.push({ name: "Home", params: { org: this.org } });
    },
    /**
     * navigate the player to the item selected in the item editor
     *
     * @param {String} itemIndex the index of the item to be selected
     */
    navigateToItem(itemIndex) {
      if (itemIndex == null) return;

      var selectedTimestamp = this.items[itemIndex].time;
      if (selectedTimestamp != null) {
        this.currentTimestamp = selectedTimestamp;
        this.itemSelected(itemIndex);
      }
    },
    /**
     * sort the items according to new timestamps
     * and reset the currentItemIndex
     */
    checkAndFixItemOrder() {
      // only proceed if an item is currently selected
      if (this.currentItemIndex != null) {
        var currentItem = this.items[this.currentItemIndex];
        this.sortItems();
        this.currentItemIndex = this.items.indexOf(currentItem);
      }
    },
    /**
     * sort items based on ascending time values
     */
    sortItems() {
      this.items.sort(function (a, b) {
        return a["time"] - b["time"];
      });
    },
    /**
     * invoked when dragging the marker for an item is completed
     *
     * @param {Number} itemIndex the index of the item whose marker was being dragged
     */
    itemMarkerTimestampDragEnd(itemIndex) {
      // get the time to which the user wants to drag the marker
      var timeBeforeDragEnded = this.items[itemIndex].time;
      var itemTimestamp = this.itemTimestamps[itemIndex];

      // check if the time after drag is valid and if not, set the item time
      // back to the one before the drag; else proceed with the new time
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
    /**
     * checks if an item should be selected based on the given timestamp
     * and selects/unselects accordingly
     *
     * @param {Number} timestamp the timestamp to be used for checking if an item should be selected
     */
    checkItemToSelect(timestamp) {
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
        this.isModalMinimized = false;
      } else this.markNoItemSelected();
    },
    /**
     * updates the player time to the given timestamp
     *
     * @param {Number} timestamp the timestamp that the player should be set to
     */
    updatePlayerTimestamp(timestamp) {
      this.player.currentTime = timestamp;
    },
    /**
     * invoked when the time slider is updated
     *
     * @param {Number} timestamp the current value of the time slider
     */
    sliderUpdated(timestamp) {
      this.updatePlayerTimestamp(timestamp);
      this.checkItemToSelect(timestamp);
    },
    /**
     * invoked when an item marker has been selected
     *
     * @param {Number} itemIndex index of the item whose marker is selected
     */
    itemSelected(itemIndex) {
      this.updatePlayerTimestamp(this.currentTimestamp);
      this.markItemSelected(itemIndex);
    },
    /**
     * marks the item at the given index as selected
     *
     * @param {Number} itemIndex the index of the item to be marked as selected
     */
    markItemSelected(itemIndex) {
      if (itemIndex != null) {
        this.isItemSelected = true;
        this.player.pause();
        this.currentItemIndex = itemIndex;
        this.currentQuestionTypeIndex = this.questionTypeToIndex[
          this.items[itemIndex].details.type
        ];
      }
    },
    /**
     * marks that no item has been currently selected
     */
    markNoItemSelected() {
      this.isItemSelected = false;
      this.currentItemIndex = null;
    },
    /**
     * updates the value of slider when the video's timestamp is updated
     */
    videoTimestampUpdated(timestamp) {
      if (this.isItemSelected) {
        // handles the case when the marker has been selected (and hence, video should pause)
        // but the emit from the video time update is still on the way
        // if we don't have this, the slider gets another timestamp update
        return;
      }
      this.currentTimestamp = timestamp;
      this.checkItemToSelect(timestamp);
    },
    /**
     * sets variables once the player instance is ready
     */
    playerReady() {
      this.videoDuration = this.player.duration;
      if (!this.plioTitle) this.plioTitle = this.player.config.title;
      // required to render the plio preview correctly
      this.reRenderKey = !this.reRenderKey;
    },
    /**
     * checks if the video link is valid
     */
    isVideoLinkValid(link) {
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
    /**
     * fetches the details of the plio
     */
    async loadPlio() {
      this.startLoading();
      await PlioAPIService.getPlio(this.plioId)
        .then((plioDetails) => {
          this.loadedPlioDetails = cloneDeep(plioDetails);
          this.items = plioDetails.items || [];
          this.videoURL = plioDetails.videoURL || "";
          this.plioTitle = plioDetails.plioTitle || "";
          this.status = plioDetails.status;
          if (plioDetails.updatedAt != undefined && plioDetails.updatedAt != "")
            this.lastUpdated = new Date(plioDetails.updatedAt);
          this.hasUnpublishedChanges = false;
          this.videoDBId = plioDetails.videoDBId;
          this.plioDBId = plioDetails.plioDBId;
          this.stopLoading();
        })
        .then(() => {
          this.$mixpanel.track("Visit Editor", {
            "Plio UUID": this.plioId,
            "Plio Status": this.status,
          });
        });
    },
    /**
     * ensures that update requests are made after a minimum time interval
     */
    checkAndSavePlio() {
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
    /**
     * updates the plio data on the server
     */
    savePlio() {
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
    /**
     * publishes the plio
     */
    publishPlio() {
      // mark the plio as published if in draft mode
      // and update the changes only if already published
      this.isBeingPublished = true;
      this.status = "published";
      this.savePlio().then(() => {
        this.isBeingPublished = false;
        this.isDialogBoxShown = false;
        this.isPublishedPlioDialogShown = true;
        throwConfetti(this.confettiHandler);
        this.hasUnpublishedChanges = false;
      });
    },
    /**
     * closes the plio preview
     */
    closePlioPreviewMode() {
      this.isPreviewPlioShown = false;
      this.isPlioPreviewLoaded = false;
      resetConfetti();
    },
    /**
     * toggles plio preview mode
     */
    togglePlioPreviewMode() {
      this.isPreviewPlioShown = !this.isPreviewPlioShown;
    },
    /**
     * shows the dialog box for confirming whether to publish the plio
     */
    showPublishConfirmationDialogBox() {
      // set dialog properties
      this.dialogTitle = this.publishDialogTitle;
      this.dialogDescription = this.publishDialogDescription;
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t(`editor.dialog.publish.${this.status}.confirm`),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: true,
        text: this.$t(`editor.dialog.publish.${this.status}.cancel`),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      };
      this.dialogBoxClass = "w-72";
      // closing the dialog executes this action
      this.dialogAction = "publish";
      // show the dialogue
      this.isDialogBoxShown = true;
    },
    /**
     * invoked when the confirm button of the dialog box is clicked
     * calls the appropriate method based on the dialogAction
     */
    dialogConfirmed() {
      // reset the dialog box
      this.resetDialogBox();

      // call separate methods depening on the dialog action that
      // was set
      if (this.dialogAction == "publish") this.confirmPublish();
      else if (this.dialogAction == "deleteItem") this.deleteSelectedItem();
      else if (this.dialogAction == "deleteOption") this.confirmDeleteOption();
      else if (this.dialogAction == "closeDialog") this.isDialogBoxShown = false;

      // reset the dialog action value
      this.dialogAction = "";
    },
    /**
     * invoked when the cancel button of the dialog box is clicked;
     * calls the appropriate method based on the dialogAction
     */
    dialogCancelled() {
      // reset the dialog box
      this.resetDialogBox();
      if (this.dialogAction == "deleteOption") this.cancelDeleteOption();
      if (this.dialogAction == "publish") {
        if (!this.isPublished) {
          // show the plio preview
          this.togglePlioPreviewMode();
        }
      }
    },
    /**
     * resets the config of the dialog box
     */
    resetDialogBox() {
      this.isDialogBoxShown = false;
      this.dialogDescription = "";
      this.dialogBoxClass = "";
    },
    /**
     * cancels the deletion of the marked option
     */
    cancelDeleteOption() {
      this.optionIndexToDelete = -1; // reset the option index to be deleted
    },
    /**
     * shows a dialog box when the user tries to add an item
     * at an invalid timestamp
     */
    showCannotAddItemDialog() {
      // set up the dialog properties
      this.dialogTitle = this.$t("editor.dialog.cannot_add_question.title");
      this.dialogDescription = this.$t("editor.dialog.cannot_add_question.description");
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.got_it"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };

      // carry out the closeDialog action when dialog is closed
      this.dialogAction = "closeDialog";
      // show the dialogue
      this.isDialogBoxShown = true;
    },
    /**
     * shows a dialog box when the user tries to delete an option
     * for a question with only 2 options
     */
    showCannotDeleteOptionDialog() {
      // set up the dialog properties
      this.dialogTitle = this.$t("editor.dialog.cannot_delete_option.title");
      this.dialogDescription = this.$t("editor.dialog.cannot_delete_option.description");
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.got_it"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };

      // carry out the closeDialog action when dialog is closed
      this.dialogAction = "closeDialog";
      // show the dialogue
      this.isDialogBoxShown = true;
    },
    /**
     * hides the dialog box and invokes the method for publishing the plio
     */
    confirmPublish() {
      this.isDialogBoxShown = true;
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
    /**
     * deletes the option marked to be deleted if the question contains
     * more than 2 options
     */
    confirmDeleteOption() {
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
    /**
     * returns the type of item being added when add item button is clicked
     */
    getItemTypeForNewItem() {
      // hard-coded for now as the only item type that we support is "question"
      return "question";
    },
    /**
     * returns a metadata object which contains only the name of the source from where
     * the question is coming from.
     */
    getMetadataForNewItem() {
      // currently the source is only "default" as questions will be created on the editor only
      var meta = {};
      meta["source"] = {};
      meta["source"]["name"] = "default";
      return meta;
    },
    /**
     * returns an object containing the default values required
     * for creating a new question of the given question type
     *
     * @param {String} questionType type of the question
     */
    getDetailsForNewQuestion(questionType) {
      // default structure for a new question
      var details = {};
      details["correct_answer"] = 0;
      details["text"] = "";
      details["type"] = questionType;
      details["options"] = ["", ""];
      details["max_char_limit"] = 100;
      return details;
    },
    /**
     * creates a new item of the given question type and adds it to the item list
     *
     * @param {String} questionType the type of the question to be added
     */
    addNewItem(questionType) {
      this.player.pause();
      this.startLoading();
      const currentTimestamp = this.currentTimestamp;
      // newItem object will store the information of the newly created
      // item and the question
      var newItem = {};
      // check if the time where user is trying to add an item is valid or not
      if (
        !ItemFunctionalService.isTimestampValid(currentTimestamp, this.itemTimestamps)
      ) {
        this.showCannotAddItemDialog();
        this.stopLoading();
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
            var questionDetails = this.getDetailsForNewQuestion(questionType);
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
        })
        .finally(() => this.stopLoading());
    },
    /**
     * shows the dialog box for confirming whether the item should be deleted
     */
    showDeleteItemDialogBox() {
      // set dialog properties
      this.dialogTitle = this.$t(`editor.dialog.delete_item.${this.itemType}.title`);
      this.dialogDescription = this.$t(
        `editor.dialog.delete_item.${this.itemType}.description`
      );
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.yes"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: true,
        text: this.$t("generic.no"),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      };
      // set the action to be carried out
      this.dialogAction = "deleteItem";
      // show the dialogue
      this.isDialogBoxShown = true;
    },
    /**
     * remove the current item from the item list
     */
    deleteSelectedItem() {
      // set currentItemIndex to null to hide the item editor
      var itemToDelete = this.items.splice(this.currentItemIndex, 1);
      ItemAPIService.deleteItem(itemToDelete[0].id);
      this.currentItemIndex = null;
      this.isDialogBoxShown = false;
    },
    /**
     * deletes the option of the current item at the given index
     *
     * @param {Number} optionIndex the index of the option to be deleted
     */
    deleteOption(optionIndex) {
      // set dialog properties
      this.dialogTitle = this.$t("editor.dialog.delete_option.title");
      this.dialogDescription = "";
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: this.$t("generic.yes"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: true,
        text: this.$t("generic.no"),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      };

      // set the index to delete, set the dialog action, show the dialog
      this.optionIndexToDelete = optionIndex;
      this.dialogAction = "deleteOption";
      this.isDialogBoxShown = true;
    },
    /**
     * sets that some unresolved errors are present
     */
    setErrorOccurred() {
      this.anyErrorsPresent = true;
    },
    /**
     * sets that all errors have been resolved
     */
    setErrorResolved() {
      this.anyErrorsPresent = false;
    },
  },
};
</script>
<style lang="scss">
:root {
  --t-origin-x: 98%;
  --t-origin-y: 5%;
  --maximize-btn-left: 72.5rem;
  --maximize-btn-top: 0.5rem;
}

#maximizeButton {
  left: var(--maximize-btn-left);
  top: var(--maximize-btn-top);
}

.maximize-btn-transition-leave {
  animation: linear 0.1s;
}

@mixin modalScale($scaleFactor) {
  transform: scale($scaleFactor);
  transform-origin: var(--t-origin-x) var(--t-origin-y);
}

@keyframes shrink {
  1% {
    @include modalScale(0.9);
  }
  10% {
    @include modalScale(0.8);
  }
  20% {
    @include modalScale(0.7);
  }
  30% {
    @include modalScale(0.6);
  }
  40% {
    @include modalScale(0.5);
  }
  50% {
    @include modalScale(0.4);
  }
  60% {
    @include modalScale(0.3);
  }
  70% {
    @include modalScale(0.2);
  }
  80% {
    @include modalScale(0.1);
  }
  90% {
    @include modalScale(0.07);
  }
  100% {
    @include modalScale(0.03);
  }
}

@keyframes grow {
  0% {
    @include modalScale(0);
  }
  1% {
    @include modalScale(0.03);
  }
  10% {
    @include modalScale(0.07);
  }
  20% {
    @include modalScale(0.1);
  }
  30% {
    @include modalScale(0.2);
  }
  40% {
    @include modalScale(0.3);
  }
  50% {
    @include modalScale(0.4);
  }
  60% {
    @include modalScale(0.5);
  }
  70% {
    @include modalScale(0.6);
  }
  80% {
    @include modalScale(0.7);
  }
  90% {
    @include modalScale(0.8);
  }
  100% {
    @include modalScale(0.9);
  }
}

.shrink {
  animation: shrink 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.grow {
  animation: grow 0.1s ease-in;
}
</style>
