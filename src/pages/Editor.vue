<template>
  <!--- base grid -->
  <div class="flex relative justify-center md:mx-4 lg:mx-10 xl:mx-20">
    <div
      class="flex flex-col w-full"
      :class="{ 'opacity-30 pointer-events-none': isBackgroundDisabled }"
      data-test="blurDiv"
    >
      <div class="w-full flex justify-between px-6" :class="{ hidden: !isVideoIdValid }">
        <!--- text to show updated time status -->
        <p class="my-2 sm:my-4 text-xs lg:text-sm text-gray-500" :class="syncStatusClass">
          {{ syncStatusText }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 items-stretch">
        <!--- preview grid -->
        <div
          class="flex flex-col mx-2 sm:mx-4 md:mx-6 z-0"
          :class="{ 'mt-6': !isVideoIdValid }"
          data-test="previewDiv"
        >
          <div
            class="mt-4 mb-6 sm:mb-8 flex justify-center space-x-1 bp-360:space-x-2"
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
              :titleConfig="plioPreviewTitleClass"
              :iconConfig="playPlioIconConfig"
              :buttonClass="playPlioButtonClass"
              :isDisabled="uploading"
              @click="togglePlioPreviewMode"
              data-test="plioPreviewButton"
            ></icon-button>

            <!-- copy draft link -->
            <icon-button
              v-if="!isPublished && !isPersonalWorkspace"
              :titleConfig="copyDraftTitleClass"
              :iconConfig="copyDraftIconConfig"
              :buttonClass="copyDraftButtonClass"
              @click="copyPlioDraftLink"
              data-test="copyDraftButton"
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
                  class="w-full h-40 bp-420:h-48 bp-500:h-72 sm:h-80 md:h-64 lg:h-80 xl:h-96 rounded-md bg-gray-300"
                ></div>
                <div class="absolute flex flex-col items-center">
                  <inline-svg
                    :src="getImageSource('youtube.svg')"
                    class="h-16 w-16 bp-420:w-24 bp-420:h-24 bp-500:w-32 bp-500:h-32 md:w-24 md:h-24 lg:w-32 lg:h-32"
                  ></inline-svg>
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
                  :id="editorVideoPlayerElementId"
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
                    :itemDetailList="itemDetails"
                    :previewMode="true"
                    :videoPlayerElementId="editorVideoPlayerElementId"
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
            class="mt-6 sm:mt-10 w-full p-2 rounded-md border border-yellow-400 flex space-x-4"
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

          <!--- buttons below the preview -->
          <div
            class="flex justify-center space-x-1 bp-360:space-x-2"
            :class="lowerButtonsContainerClass"
            v-if="isVideoIdValid"
            data-test="lowerButtons"
          >
            <!--- button to go back to home -->
            <icon-button
              :titleConfig="homeButtonTitleConfig"
              :iconConfig="homeIconConfig"
              :buttonClass="homeButtonClass"
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
        <div
          class="flex flex-col mx-2 sm:mx-4 md:mx-6 justify-start"
          :class="{ 'mt-6': !isVideoIdValid }"
          data-test="inputDiv"
        >
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
                  rel="noopener"
                  >{{ $t("editor.video_input.info.2") }}</a
                >
                {{ $t("editor.video_input.info.3") }}
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
              class="bg-peach rounded-lg p-4 bp-360:p-8 bp-500:p-4 sm:p-8 w-full bp-500:w-full lg:w-3/4 flex flex-col items-center shadow-lg"
              :class="itemPickerClass"
              v-if="currentItemIndex == null"
            >
              <div class="flex flex-col items-center">
                <p class="text-yellow-900 text-lg sm:text-xl font-bold">
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
              v-model:itemDetailList="itemDetails"
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
    </div>

    <!-- image uploader dialog box -->
    <ImageUploaderDialog
      v-if="isImageUploaderDialogShown"
      :uploadedImage="itemImage"
      @close-dialog="toggleImageUploaderBox"
      @image-selected="uploadImage"
      @delete-image="deleteLinkedImage"
      data-test="imageUploaderDialog"
    ></ImageUploaderDialog>

    <!--- publish/draft badge -->
    <simple-badge
      class="absolute -top-12"
      :text="statusBadge"
      :badgeClass="statusBadgeClass"
      v-tooltip.top="statusBadgeTooltip"
    ></simple-badge>

    <canvas
      id="sharePlioConfettiCanvas"
      class="fixed z-50"
      v-if="isPublishedPlioDialogShown"
    ></canvas>

    <!-- plio preview -->
    <div
      class="fixed top-1/20 w-11/12 bp-420:w-10/12 shadow-xl"
      :class="plioPreviewContainerClass"
      v-if="isPlioPreviewShown"
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
        <!-- close button -->
        <div class="w-full absolute flex justify-end">
          <icon-button
            v-if="isPlioPreviewLoaded"
            :iconConfig="closePlioPreviewIconConfig"
            :buttonClass="closePlioPreviewButtonClass"
            @click="closePlioPreview"
            data-test="closePlioPreviewButton"
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
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import ItemModal from "@/components/Player/ItemModal.vue";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog.vue";

import PlioAPIService from "@/services/API/Plio.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import ImageAPIService from "@/services/API/Image.js";
import VideoAPIService from "@/services/API/Video.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import Utilities, {
  throwConfetti,
  resetConfetti,
} from "@/services/Functional/Utilities.js";
import { mapActions, mapState, mapGetters } from "vuex";
import debounce from "debounce";
import { useToast } from "vue-toastification";

// importing the confetti.js module
const confetti = require("canvas-confetti");

// used for deep cloning objects
var clonedeep = require("lodash.clonedeep");
var isEqual = require("deep-eql");

// difference in seconds between consecutive checks for item pop-up
var POP_UP_CHECKING_FREQUENCY = 0.5;
var POP_UP_PRECISION_TIME = POP_UP_CHECKING_FREQUENCY * 1000;
// offset from the POP_UP_CHECKING_FREQUENCY for the minimum question timestamp
var MINIMUM_QUESTION_TIME_OFFSET = 0.1;
// minimum timestamp for each question
var MINIMUM_QUESTION_TIMESTAMP = MINIMUM_QUESTION_TIME_OFFSET + POP_UP_CHECKING_FREQUENCY;

// debounce time - milliseconds
const DEBOUNCE_DELAY_TIME = 500;

export default {
  name: "Editor",
  components: {
    InputText,
    SliderWithMarkers,
    VideoPlayer,
    ItemEditor,
    IconButton,
    SimpleBadge,
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
      itemUnwatchers: {}, // functions to unwatch all the items
      itemDetails: [], // list of all the items' details created for this plio
      itemDetailUnwatchers: {}, // functions to unwatch all the itemDetails
      videoDuration: 0, // duration of the video in seconds
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
      closePlioPreviewIconConfig: {
        // config for the icon of the button to close the plio preview
        enabled: true,
        iconName: "times-circle-white",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      // class for the button to close the plio preview
      closePlioPreviewButtonClass: "w-10 h-10 -mr-4 -mt-4",
      sliderStep: 0.1, // timestep for the slider
      itemTimestamps: [], // stores the list of the timestamps of all items
      videoURL: "", // full video url
      lastUpdated: new Date(), // time when the last update to remote was made
      minUpdateInterval: 1000, // minimum time in milliseconds between updates
      isBeingPublished: false, // whether the current plio is in the process of being published
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
      // styling class for the copy draft button
      copyDraftButtonClass: "bg-yellow-300 hover:bg-yellow-400 p-2 px-4 rounded-md",
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
      copyDraftIconConfig: {
        // config for the icon of the copy draft link button
        enabled: true,
        iconName: "link",
        iconClass: "text-yellow-800 fill-current h-3 bp-360:h-4 w-3 bp-360:w-4",
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
      isPlioPreviewShown: false, // whether to show a full preview of the plio (draft mode only)
      reRenderKey: 0, // key required to re-render the plio preview player
      editorVideoPlayerElementId: "editorVideoPlayer", // id of the video player in the editor
      isPlioPreviewLoaded: false, // whether the plio preview has been loaded
      // class for the button to close the dialog that comes after publishing
      confettiHandler: confettiHandler,
      toast: useToast(), // use the toast component
    };
  },
  async created() {
    // fetch plio details
    await this.loadPlio();

    // debounce checkAndSaveChanges method
    this.checkAndSaveChanges = debounce(this.checkAndSaveChanges, DEBOUNCE_DELAY_TIME);
  },
  beforeUnmount() {
    // clear interval
    clearInterval(this.savingInterval);
  },
  watch: {
    /**
     * Whenever itemTimestamps is updated, check if the current item timestamp is
     * greater than the minimum allowed timestamp or not. If it's not, then adjust it.
     */
    itemTimestamps() {
      // set minimum question timestamp as MINIMUM_QUESTION_TIMESTAMP
      if (this.items != null && this.currentItemIndex != null) {
        if (this.items[this.currentItemIndex].time < MINIMUM_QUESTION_TIMESTAMP)
          this.items[this.currentItemIndex].time = MINIMUM_QUESTION_TIMESTAMP;
        this.currentTimestamp = this.items[this.currentItemIndex].time;
      }
    },
    /**
     * execute appropriate actions based on the dialog action value when the
     * confirm button of the dialog box is clicked
     */
    isDialogConfirmClicked(value) {
      if (value) {
        switch (this.dialogAction) {
          case "publish":
            this.confirmPublish();
            break;
          case "deleteItem":
            this.deleteSelectedItem();
            break;
          case "deleteOption":
            this.deleteSelectedOption();
            break;
          case "closeDialog":
            // the dialog would already be closed
            // nothing else needs to be done
            break;
          default:
            // this watch will be triggered whenever the confirm button
            // of the shared dialog box will be clicked
            // returning here so that it doesn't interfere with the
            // confirmation step of a different dialogAction triggered
            // by a different component
            return;
        }

        this.unsetConfirmClicked();

        // if any of the cases above creates a new dialog box
        // with a new dialogAction, we do not want to unset it
        if (!this.isDialogBoxShown) this.unsetDialogAction();
      }
    },
    /**
     * execute appropriate actions based on the dialog action value when the
     * cancel button of the dialog box is clicked
     */
    isDialogCancelClicked(value) {
      if (value) {
        switch (this.dialogAction) {
          case "deleteOption":
            this.cancelDeleteOption();
            break;
          case "publish":
            if (!this.isPublished) {
              // show the plio preview
              this.togglePlioPreviewMode();
            }
            break;
          default:
            // this watch will be triggered whenever the cancel button
            // of the shared dialog box will be clicked
            // returning here so that it doesn't interfere with the
            // cancellation step of a different dialogAction triggered
            // by a different component
            return;
        }

        this.unsetCancelClicked();

        // if any of the cases above creates a new dialog box
        // with a new dialogAction, we do not want to unset it
        if (!this.isDialogBoxShown) this.unsetDialogAction();
      }
    },
    /**
     * When video url is updated, check its validity; if valid, update the player with the new URL
     * and push the updated video object to the backend
     * @param {String} newVideoURL - The new video URL that the user has entered
     */
    videoURL(newVideoURL) {
      // invoked when the video link is updated
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(newVideoURL);
      if (!linkValidation["valid"]) return;

      if (this.isVideoIdValid && linkValidation["ID"] != this.videoId) {
        this.player.destroy();
      }
      this.videoId = linkValidation["ID"];

      if (this.loadedPlioDetails.videoURL == newVideoURL) return;
      this.checkAndSaveChanges("video", this.videoDBId, {
        url: newVideoURL,
        duration: this.videoDuration,
      });
    },
    /**
     * When plio's title is updated, check if it's different than the loaded plio's title
     * and push the updated title to the backend
     */
    plioTitle(newTitle) {
      // invoked when the plio title is update
      if (this.loadedPlioDetails.plioTitle == newTitle) return;
      this.checkAndSaveChanges("plio", this.plioId, {
        name: newTitle,
      });
    },
    /**
     * Video duration is updated when plyr loads up the video. If the updated duration
     * is not 0, push the updated duration to the backend
     */
    videoDuration(newVideoDuration) {
      if (this.loadedPlioDetails.videoDuration == newVideoDuration) return;
      if (newVideoDuration != 0)
        this.checkAndSaveChanges("video", this.videoDBId, { duration: newVideoDuration });
    },
  },
  computed: {
    ...mapState("sync", ["uploading", "pending"]),
    ...mapState("generic", ["isEmbedPlioDialogShown"]),
    ...mapGetters("auth", ["isPersonalWorkspace"]),
    ...mapState("dialog", {
      isDialogBoxShown: "isShown",
      dialogAction: "action",
      isDialogConfirmClicked: "isConfirmClicked",
      isDialogCancelClicked: "isCancelClicked",
    }),
    /**
     * whether the spinner needs to be shown
     */
    isSpinnerShown() {
      return (this.isPlioPreviewShown && !this.isPlioPreviewLoaded) || this.pending;
    },
    /**
     * classes for the container holding the buttons below the slider
     */
    lowerButtonsContainerClass() {
      return {
        "my-6 sm:my-10": !this.isQuestionTypeSubjective,
        "my-4 sm:my-8": this.isQuestionTypeSubjective,
      };
    },
    /**
     * classes for the container holding the plio preview
     */
    plioPreviewContainerClass() {
      return {
        "bg-white border-2 border-gray-400 rounded-lg": this.isPlioPreviewLoaded,
      };
    },
    /**
     * URL of the image present for the current item
     */
    itemImage() {
      if (this.currentItemIndex == null) return null;
      if (this.itemDetails[this.currentItemIndex].image == null) return null;
      return this.itemDetails[this.currentItemIndex].image.url;
    },
    /**
     * whether the type of the question being created is subjective
     */
    isQuestionTypeSubjective() {
      if (this.currentItemIndex == null) return false;
      return this.itemDetails[this.currentItemIndex].type == "subjective";
    },
    /**
     * class for the item picker
     */
    itemPickerClass() {
      return { "opacity-30 cursor-not-allowed": this.addItemDisabled };
    },
    /**
     * class for the question type selectors
     */
    questionTypeSelectorClass() {
      return {
        "hover:bg-primary hover:text-white hover:border-primary": !this.addItemDisabled,
      };
    },
    /**
     * styling class for the title of minimize/maximize button
     */
    maximizeButtonTitleClass() {
      return {
        value: this.isModalMinimized
          ? this.$t(`editor.buttons.show_${this.itemType}`)
          : this.$t("editor.buttons.show_video"),
        class: "text-white text-xs lg:text-sm tracking-tighter",
      };
    },
    /**
     * styling class for the title of share plio button
     */
    sharePlioTitleClass() {
      return {
        value: this.$t("editor.buttons.share_plio"),
        class: "text-sm bp-420:text-base text-yellow-800",
      };
    },
    /**
     * styling class for the title of share plio button on dialog box
     * that comes after publishing
     */
    dialogSharePlioTitleClass() {
      return {
        value: this.$t("editor.dialog.published.buttons.share_plio"),
        class: "text-yellow-800",
      };
    },
    /**
     * styling class for the title of play plio button
     */
    playPlioTitleClass() {
      return {
        value: this.$t("editor.buttons.play_plio"),
        class: "text-sm bp-420:text-base text-white",
      };
    },
    /**
     * styling class for the title of preview plio button
     */
    plioPreviewTitleClass() {
      return {
        value: this.$t("editor.buttons.preview_plio"),
        class: "text-sm bp-420:text-base text-white",
      };
    },
    /**
     * styling class for the title of copy draft link button
     */
    copyDraftTitleClass() {
      return {
        value: this.$t("editor.buttons.share_draft"),
        class: "text-sm bp-420:text-base text-yellow-800",
      };
    },
    /**
     * styling class for the title of play plio button on dialog box
     * that comes after publishing
     */
    dialogPlayPlioTitleClass() {
      return {
        value: this.$t("editor.dialog.published.buttons.play_plio"),
        class: "text-white",
      };
    },
    /**
     * styling class for the title of embed plio button
     */
    embedPlioTitleClass() {
      return {
        value: this.$t("editor.buttons.embed_plio"),
        class: "text-sm bp-420:text-base text-white",
      };
    },
    /**
     * styling class for the title of embed plio button on dialog box
     * that comes after publishing
     */
    dialogEmbedPlioTitleClass() {
      return {
        value: this.$t("editor.dialog.published.buttons.embed_plio"),
        class: "text-white",
      };
    },
    /**
     * styling class for the title of go back home button on dialog box
     * that comes after publishing
     */
    dialogHomeTitleClass() {
      return {
        value: this.$t("editor.dialog.published.buttons.home"),
        class: "text-yellow-800",
      };
    },
    /**
     * styling class for the title of analyze plio button
     */
    analyzePlioTitleConfig() {
      return {
        value: this.$t("editor.buttons.analyze_plio"),
        class: "text-white text-sm bp-420:text-base",
      };
    },
    /**
     * whether the item modal needs to be shown
     */
    showItemModal() {
      return this.hasAnyItems && this.isAnyItemActive;
    },
    /**
     * whether any item is currently active
     */
    isAnyItemActive() {
      return this.currentItemIndex != null;
    },
    itemType() {
      // type of the current item - null if no item is selected
      if (!this.isItemSelected) return null;
      return this.items[this.currentItemIndex].type;
    },
    /**
     * text for the status badge
     */
    statusBadge() {
      return this.$t(`generic.status.${this.status}`);
    },
    /**
     * video link validation display config
     */
    videoInputValidation() {
      return {
        enabled: this.videoURL,
        isValid: this.isVideoIdValid,
        validMessage: this.$t("editor.video_input.validation.valid"),
        invalidMessage: this.$t("editor.video_input.validation.invalid"),
      };
    },
    /**
     * returns the player instance
     */
    player() {
      return this.$refs.videoPlayer.player;
    },
    /**
     * get the index of the correct answer from options list
     */
    correctOptionIndex() {
      return this.itemDetails[this.currentItemIndex].correct_answer;
    },
    /**
     * whether the publish button is enabled
     */
    isPublishButtonEnabled() {
      // enable publish button if video id is valid
      // and no errors are present
      if (!this.isPublished) return this.isVideoIdValid && !this.anyErrorsPresent;

      return this.hasUnpublishedChanges;
    },
    /**
     * whether to disable the main screen
     */
    isBackgroundDisabled() {
      return (
        this.isBeingPublished ||
        this.isImageUploaderDialogShown ||
        this.isPublishedPlioDialogShown ||
        this.isEmbedPlioDialogShown ||
        this.pending ||
        this.isPlioPreviewShown
      );
    },
    /**
     * class for the status badge
     */
    statusBadgeClass() {
      return [
        {
          "text-green-700 border-green-700": this.isPublished,
          "border-black text-black": !this.isPublished,
        },
        `text-base px-4 py-2`,
      ];
    },
    /**
     * tooltip for the status badge
     */
    statusBadgeTooltip() {
      if (!this.isPublished) return this.$t("tooltip.editor.status.draft");
      return this.$t("tooltip.editor.status.published");
    },
    /**
     * text to show the sync status
     */
    syncStatusText() {
      if (this.uploading) return "Updating...";
      else return this.$t("editor.updated") + ": " + this.lastUpdatedStr;
    },
    /**
     * class for the sync status text
     */
    syncStatusClass() {
      return {
        "text-red-500": this.isPublished && this.hasUnpublishedChanges,
      };
    },
    /**
     * classes for the home button
     */
    homeButtonClass() {
      return "p-2 bp-420:px-4 bg-peach hover:bg-peach-hover rounded-md shadow-lg ring-primary";
    },
    /**
     * config for text of the home button
     */
    homeButtonTitleConfig() {
      return {
        value: this.$t("editor.buttons.home"),
        class: "text-yellow-800 font-bold text-sm bp-420:text-base",
      };
    },
    /**
     * config for text of back button
     */
    publishButtonTitleConfig() {
      return {
        value: this.publishButtonText,
        class: "text-white font-bold text-sm bp-420:text-base",
      };
    },
    /**
     * text for the publish button
     */
    publishButtonText() {
      if (!this.isPublished) return this.$t("editor.buttons.publish.draft");
      return this.$t("editor.buttons.publish.published");
    },
    /**
     * class for the publish button
     */
    publishButtonClass() {
      return [
        {
          "opacity-50 cursor-not-allowed pointer-events-none": !this
            .isPublishButtonEnabled,
        },
        `rounded-md ring-green-500 bg-green-500 hover:bg-green-600 p-2 bp-420:px-4 bp-500:px-2 sm:px-4`,
      ];
    },
    /**
     * tooltip text for publish button
     */
    publishButtonTooltip() {
      if (!this.isPublished) {
        if (!this.isPublishButtonEnabled)
          return this.$t("tooltip.editor.publish.draft.disabled");
        return this.$t("tooltip.editor.publish.draft.enabled");
      }
      if (!this.isPublishButtonEnabled)
        return this.$t("tooltip.editor.publish.published.disabled");
      return this.$t("tooltip.editor.publish.published.enabled");
    },
    /**
     * lastUpdated as a human readable string
     */
    lastUpdatedStr() {
      return this.lastUpdated.toLocaleString();
    },
    /**
     * whether there are any items
     */
    hasAnyItems() {
      return this.items.length != 0;
    },
    /**
     * whether the plio has been pubished
     */
    isPublished() {
      return this.status == "published";
    },
    /**
     * placeholder text for the video link input box
     */
    videoInputPlaceholder() {
      return this.$t("editor.video_input.placeholder");
    },
    /**
     * title text for the video link input box
     */
    videoInputTitle() {
      if (!this.isVideoIdValid) return "";
      return this.$t("editor.video_input.title");
    },
    /**
     * placeholder text for the Plio title input box
     */
    titleInputPlaceholder() {
      return this.$t("editor.plio_title.placeholder");
    },
    /**
     * title text for the Plio title input box
     */
    titleInputTitle() {
      return this.$t("editor.plio_title.title");
    },
    /**
     * prepare the link for the plio from the plio ID
     */
    plioLink() {
      return this.getPlioLink(this.plioId, this.org);
    },
    /**
     * whether the video Id is valid
     */
    isVideoIdValid() {
      return this.videoId != "";
    },
    /**
     * title for the dialog box that appears when publishing a
     *  draft plio or publishing changes to a published plio
     */
    publishDialogTitle() {
      if (this.isPublished) {
        return this.$t("editor.dialog.publish.published.title");
      }
      return this.$t("editor.dialog.publish.draft.title");
    },
    /**
     * description for the dialog box that appears when publishing a
     * draft plio or publishing changes to a published plio
     */
    publishDialogDescription() {
      if (this.isPublished) {
        return this.$t("editor.dialog.publish.published.description");
      }
      return this.$t("editor.dialog.publish.draft.description");
    },
    /**
     * title for the dialog box that appears when the
     * publishing for a plio is in progress
     */
    publishInProgressDialogTitle() {
      if (this.isPublished) {
        return this.$t("editor.dialog.publishing.published.title");
      }
      return this.$t("editor.dialog.publishing.draft.title");
    },
    /**
     * whether adding item is disabled
     */
    addItemDisabled() {
      return this.isPublished || !this.isVideoIdValid;
    },
    /**
     * tooltip for adding the mcq question
     */
    addMCQTooltip() {
      return this.$t("tooltip.editor.add_item.mcq");
    },
    /**
     * tooltip for the subjective question
     */
    addSubjectiveQuestionTooltip() {
      return this.$t("tooltip.editor.add_item.subjective");
    },
    /**
     * styling classes for the video link input box
     */
    videoLinkInputStyling() {
      return [
        "pl-4 disabled:opacity-50 text-sm bp-500:text-base",
        { "cursor-not-allowed": this.isPublished },
      ];
    },
    /**
     * tooltip for the video link input box
     */
    videoLinkTooltip() {
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
    ...mapActions("dialog", [
      "showDialogBox",
      "hideDialogBox",
      "setDialogCloseButton",
      "setDialogTitle",
      "setDialogDescription",
      "setConfirmButtonConfig",
      "setCancelButtonConfig",
      "setDialogBoxClass",
      "setDialogAction",
      "unsetDialogAction",
      "unsetConfirmClicked",
      "unsetCancelClicked",
    ]),
    ...Utilities,
    /**
     * copies the plio draft link to the clipboard
     */
    copyPlioDraftLink() {
      let success = this.copyToClipboard(this.getPlioDraftLink(this.plioId, this.org));

      if (success) this.toast.success(this.$t("success.copying"));
      else this.toast.error(this.$t("error.copying"));
    },
    /**
     * Iterates through all items, extracts the times and populates itemTimestamps array
     */
    updateItemTimestamps() {
      this.itemTimestamps = ItemFunctionalService.getItemTimestamps(this.items);
    },
    /**
     * Clears the watcher corresponding to an item and its associated itemDetail
     * @param {Number} itemId - The id of the item whose watcher should be cleared
     */
    clearItemAndItemDetailWatcher(itemId) {
      // invoke the unwatch functions
      this.itemUnwatchers[itemId]();
      this.itemDetailUnwatchers[itemId]();

      // remove the stored unwatch functions
      delete this.itemUnwatchers[itemId];
      delete this.itemDetailUnwatchers[itemId];
    },
    /**
     * Adds watchers to all items and itemDetails and store their unwatch functions
     */
    addItemAndItemDetailWatchers() {
      this.items.forEach((item, index) => {
        this.addItemAndItemDetailWatcher(item, this.itemDetails[index]);
      });
    },
    /**
     * Adds a watcher on the item and itemDetail given
     * @param {Object} item - the item to be watched
     * @param {Object} itemDetail - the itemDetail to be watched
     */
    addItemAndItemDetailWatcher(item, itemDetail) {
      // watch the item
      let unwatch = this.$watch(
        // reason for using clonedeep - https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watching-reactive-objects
        () => clonedeep(item),
        (item, prevItem) => {
          // return if there's no change
          if (isEqual(item, prevItem)) return;
          // sort items/itemDetails
          this.checkAndFixItemOrder();
          // update itemTimestamps array
          this.updateItemTimestamps();
          // push the changes for that item to the backend
          this.checkAndSaveChanges("item", item.id, {
            plio: this.plioDBId,
            ...item,
          });
        },
        { deep: true }
      );
      // store the unwatch function for later use
      this.itemUnwatchers[item.id] = unwatch;

      // watch the itemDetail
      unwatch = this.$watch(
        // reason for using clonedeep - https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watching-reactive-objects
        () => clonedeep(itemDetail),
        (itemDetail, prevItemDetail) => {
          // return if there's no change
          if (isEqual(itemDetail, prevItemDetail)) return;

          // push the changes for that item's detail to the backend
          this.checkAndSaveChanges("question", itemDetail.id, itemDetail);
        },
        { deep: true }
      );
      // store the unwatch function for later use
      this.itemDetailUnwatchers[itemDetail.item] = unwatch;
    },
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
      let routeData = this.$router.resolve({
        name: "Player",
        params: { org: this.org, plioId: this.plioId },
      });
      // required for opening in a new tab
      window.open(routeData.href, "_blank");
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
      var imageIdToDelete = this.itemDetails[this.currentItemIndex].image.id;
      ImageAPIService.deleteImage(imageIdToDelete);
      this.itemDetails[this.currentItemIndex].image = null;
    },
    /**
     * upload the image file to the server and update
     * the question object with the linked image data
     *
     * @param {File} imageFile - the image content to be uploaded
     */
    uploadImage(imageFile) {
      this.startLoading();
      ImageAPIService.uploadImage(imageFile).then((response) => {
        this.itemDetails[this.currentItemIndex].image = response.data;
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
     * @param {String} newQuestionType - the new type of the question
     */
    questionTypeChanged(newQuestionType) {
      this.itemDetails[this.currentItemIndex].type = newQuestionType;
    },
    /**
     * minimizes the modal
     *
     * @param {Object} positions - contains the coordinates required to hide the
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
     * @param {String} itemIndex - the index of the item to be selected
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
      // if an item has already been selected, persist the selection
      // by storing the item in a temporary variable, and re-setting the
      // currentItemIndex later on
      let currentItem = undefined;
      if (this.currentItemIndex != null) currentItem = this.items[this.currentItemIndex];

      // sort the items and itemDetails arrays
      this.sortItems();
      this.sortItemDetails();
      if (currentItem != undefined)
        this.currentItemIndex = this.items.indexOf(currentItem);
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
     * sort itemDetails array based on the order of the corresponding items in items list
     */
    sortItemDetails() {
      // construct a list of item ids in order from the items array
      let itemIds = [];
      this.items.forEach((item) => itemIds.push(item.id));

      // sort itemDetails according to the itemIds list created above
      this.itemDetails.sort(function (a, b) {
        return itemIds.indexOf(a.item) - itemIds.indexOf(b.item);
      });
    },
    /**
     * invoked when dragging the marker for an item is completed
     *
     * @param {Number} itemIndex - the index of the item whose marker was being dragged
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
      // sort the items based on timestamp and
      // sort the itemDetails array based on the above sorted items
      this.checkAndFixItemOrder();
      // update itemTimestamps based on new sorted items
      this.updateItemTimestamps();
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
     * @param {Number} timestamp - the timestamp to be used for checking if an item should be selected
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
     * @param {Number} timestamp - the timestamp that the player should be set to
     */
    updatePlayerTimestamp(timestamp) {
      this.player.currentTime = timestamp;
    },
    /**
     * invoked when the time slider is updated
     *
     * @param {Number} timestamp - the current value of the time slider
     */
    sliderUpdated(timestamp) {
      this.updatePlayerTimestamp(timestamp);
      this.checkItemToSelect(timestamp);
    },
    /**
     * invoked when an item marker has been selected
     *
     * @param {Number} itemIndex - index of the item whose marker is selected
     */
    itemSelected(itemIndex) {
      this.updatePlayerTimestamp(this.currentTimestamp);
      this.markItemSelected(itemIndex);
    },
    /**
     * marks the item at the given index as selected
     *
     * @param {Number} itemIndex - the index of the item to be marked as selected
     */
    markItemSelected(itemIndex) {
      if (itemIndex != null) {
        this.isItemSelected = true;
        this.player.pause();
        this.currentItemIndex = itemIndex;
        this.currentQuestionTypeIndex = this.questionTypeToIndex[
          this.itemDetails[itemIndex].type
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
      // re-render the plio preview component
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
          this.loadedPlioDetails = clonedeep(plioDetails);
          this.items = plioDetails.items || [];
          this.updateItemTimestamps();
          this.itemDetails = plioDetails.itemDetails || [];
          this.addItemAndItemDetailWatchers();
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
     * Filtering before pushing the data to the server
     * @param {String} resourceName - name of the resource that needs to be updated/created (plio, video, question etc...)
     * @param {Number} resourceId - id of the resource
     * @param {Object} resourceValue - payload of the resource that needs to be pushed to the backend
     */
    async checkAndSaveChanges(resourceName, resourceId, resourceValue) {
      // don't update changes automatically once published
      if (this.isPublished) {
        this.hasUnpublishedChanges = true;
        return;
      }
      // don't save plio if video URL is empty or if any errors are present
      if (this.anyErrorsPresent || !this.isVideoIdValid) return;

      await this.saveChanges(resourceName, resourceId, resourceValue);
    },
    /**
     * updates the data on the server
     * @param {String} resourceName - name of the resource that needs to be updated/created (plio, video, question etc...)
     * @param {Number} resourceId - id of the resource
     * @param {Object} resourceValue - payload of the resource that needs to be pushed to the backend
     */
    async saveChanges(resourceName, resourceId, resourceValue) {
      this.startUploading();
      this.lastUpdated = new Date();

      switch (resourceName) {
        case "video":
          await this.updateVideo(resourceId, resourceValue);
          break;
        case "item":
          await this.updateItem(resourceId, resourceValue);
          break;
        case "question":
          await this.updateQuestionDetails(resourceId, resourceValue);
          break;
        case "plio":
          await this.updatePlio(resourceId, resourceValue);
          break;
        case "all":
          // update video
          await this.updateVideo(this.videoDBId, {
            url: this.videoURL,
            duration: this.videoDuration,
          });

          // update all the items
          this.items.forEach(async (item) => {
            await this.updateItem(item.id, item);
          });

          // update all the item details
          this.itemDetails.forEach(async (itemDetail, index) => {
            if (this.items[index].type == "question") {
              await this.updateQuestionDetails(itemDetail.id, itemDetail);
            }
          });

          // update plio
          await this.updatePlio(this.plioId, {
            name: this.plioTitle,
            status: this.status,
            video: this.videoDBId,
          });
          break;
      }

      this.stopUploading();
      return new Promise((resolve) => resolve());
    },

    /**
     * Create or update the video resource
     * @param {Number} id - The database id of the video that needs to be updated
     * @param {Object} payload - The payload that needs to be pushed to the backend
     */
    async updateVideo(id, payload) {
      // 'url' key in the payload is a required field
      if (id == null && Object.prototype.hasOwnProperty.call(payload, "url")) {
        // Create the video and link it to the plio
        let createdVideo = await VideoAPIService.createVideo(payload);
        this.videoDBId = createdVideo.data.id;
        await this.updatePlio(this.plioId, { video: this.videoDBId });
      } else if (id != null) {
        // update the existing video
        await VideoAPIService.updateVideo(id, payload);
      }
    },

    /**
     * Update the plio resource
     * @param {Number} id - The uuid of the plio that needs to be updated
     * @param {Object} payload - The payload that needs to be pushed to the backend
     */
    async updatePlio(id, payload) {
      await PlioAPIService.updatePlio(id, payload);
    },

    /**
     * Update the item resource
     * @param {Number} id - The database id of the item that needs to be updated
     * @param {Object} payload - The payload that needs to be pushed to the backend
     */
    async updateItem(id, payload) {
      await ItemAPIService.updateItem(id, payload);
    },

    /**
     * Update the itemDetail resource
     * @param {Number} id - The database id of the itemDetail that needs to be updated
     * @param {Object} payload - The payload that needs to be pushed to the backend
     */
    async updateQuestionDetails(id, payload) {
      // cloning as we are replacing the value of the "image" key
      var payloadClone = clonedeep(payload);
      if ("image" in payload && payload["image"] != undefined) {
        payloadClone["image"] = payload["image"]["id"];
      }
      await QuestionAPIService.updateQuestion(id, payloadClone);
    },
    /**
     * publishes the plio
     */
    async publishPlio() {
      // mark the plio as published if in draft mode
      // and update the changes only if already published
      this.isBeingPublished = true;
      this.status = "published";
      await this.saveChanges("all");
      this.isBeingPublished = false;
      this.hideDialogBox();
      this.isPublishedPlioDialogShown = true;
      throwConfetti(this.confettiHandler);
      this.hasUnpublishedChanges = false;
    },
    /**
     * closes the plio preview
     */
    closePlioPreview() {
      this.isPlioPreviewShown = false;
      this.isPlioPreviewLoaded = false;
      resetConfetti();
    },
    /**
     * toggles plio preview mode
     */
    togglePlioPreviewMode() {
      this.isPlioPreviewShown = !this.isPlioPreviewShown;
    },
    /**
     * shows the dialog box for confirming whether to publish the plio
     */
    showPublishConfirmationDialogBox() {
      // set dialog properties
      this.setDialogTitle(this.publishDialogTitle);
      this.setDialogDescription(this.publishDialogDescription);
      this.setDialogCloseButton();
      this.setConfirmButtonConfig({
        enabled: true,
        text: this.$t(`editor.dialog.publish.${this.status}.confirm`),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      });
      this.setCancelButtonConfig({
        enabled: true,
        text: this.$t(`editor.dialog.publish.${this.status}.cancel`),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      });
      this.setDialogBoxClass("w-72");
      // closing the dialog executes this action
      this.setDialogAction("publish");
      // show the dialog box
      this.showDialogBox();
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
      this.setDialogTitle(this.$t("editor.dialog.cannot_add_question.title"));
      this.setDialogDescription(this.$t("editor.dialog.cannot_add_question.description"));
      this.setConfirmButtonConfig({
        enabled: true,
        text: this.$t("generic.got_it"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      });

      // carry out the closeDialog action when dialog is closed
      this.setDialogAction("closeDialog");
      // show the dialog box
      this.showDialogBox();
    },
    /**
     * shows a dialog box when the user tries to delete an option
     * for a question with only 2 options
     */
    showCannotDeleteOptionDialog() {
      // set up the dialog properties
      this.setDialogTitle(this.$t("editor.dialog.cannot_delete_option.title"));
      this.setDialogDescription(
        this.$t("editor.dialog.cannot_delete_option.description")
      );
      this.setConfirmButtonConfig({
        enabled: true,
        text: this.$t("generic.got_it"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      });

      // carry out the closeDialog action when dialog is closed
      this.setDialogAction("closeDialog");
      // show the dialog box
      this.showDialogBox();
    },
    /**
     * hides the dialog box and invokes the method for publishing the plio
     */
    confirmPublish() {
      this.showDialogBox();
      this.unsetDialogAction();
      this.setDialogTitle(this.publishInProgressDialogTitle);

      // publish the plio or its changes
      this.publishPlio();
    },
    /**
     * deletes the option marked to be deleted if the question contains
     * more than 2 options
     */
    deleteSelectedOption() {
      // there should always be at least 2 options, allow deletion only
      // if the number of options is >= 3
      if (this.itemDetails[this.currentItemIndex].options.length < 3) {
        this.showCannotDeleteOptionDialog();
        return;
      }

      // delete the option
      this.itemDetails[this.currentItemIndex].options.splice(this.optionIndexToDelete, 1);
      // if the deleted option was the correct answer, reset the correct answer
      if (this.optionIndexToDelete == this.correctOptionIndex) {
        this.itemDetails[this.currentItemIndex].correct_answer = 0;
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
     * @param {String} questionType - type of the question
     */
    getDetailsForNewQuestion(questionType) {
      return {
        correct_answer: 0,
        text: "",
        type: questionType,
        options: ["", ""],
        max_char_limit: 100,
      };
    },
    /**
     * creates a new item of the given question type and adds it to the item list
     *
     * @param {String} questionType - the type of the question to be added
     */
    async addNewItem(questionType) {
      this.player.pause();
      this.startLoading();
      const currentTimestamp = this.currentTimestamp;

      // check if the time where user is trying to add an item is valid or not
      if (
        !ItemFunctionalService.isTimestampValid(currentTimestamp, this.itemTimestamps)
      ) {
        this.showCannotAddItemDialog();
        this.stopLoading();
        return;
      }

      // create item, then create the question, then update local states
      let createdItem = await ItemAPIService.createItem({
        plio: this.plioDBId,
        type: this.getItemTypeForNewItem(),
        time: currentTimestamp,
        meta: this.getMetadataForNewItem(),
      });

      let itemDetail;

      if (createdItem.type == "question") {
        let questionDetails = this.getDetailsForNewQuestion(questionType);
        questionDetails.item = createdItem.id;

        // create question and push it into itemDetails array
        itemDetail = await QuestionAPIService.createQuestion(questionDetails);
      }

      this.itemDetails.push(itemDetail);

      // add the newly created item into items array
      this.items.push(createdItem);
      // add watchers to items and itemDetails
      this.addItemAndItemDetailWatcher(
        this.items[this.items.length - 1],
        this.itemDetails[this.items.length - 1]
      );
      // sort items/itemDetails
      this.checkAndFixItemOrder();
      // update itemTimestamps and currentItemIndex, and select the item
      this.updateItemTimestamps();
      this.currentItemIndex = this.itemTimestamps.indexOf(currentTimestamp);
      this.markItemSelected(this.currentItemIndex);
      this.stopLoading();
    },
    /**
     * shows the dialog box for confirming whether the item should be deleted
     */
    showDeleteItemDialogBox() {
      // set dialog properties
      this.setDialogTitle(this.$t(`editor.dialog.delete_item.${this.itemType}.title`));
      this.setDialogDescription(
        this.$t(`editor.dialog.delete_item.${this.itemType}.description`)
      );
      this.setConfirmButtonConfig({
        enabled: true,
        text: this.$t("generic.yes"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      });
      this.setCancelButtonConfig({
        enabled: true,
        text: this.$t("generic.no"),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      });
      // set the action to be carried out
      this.setDialogAction("deleteItem");
      // show the dialog box
      this.showDialogBox();
    },
    /**
     * remove the current item from the item list, the corresponding
     * itemDetail as well, and remove their watchers
     */
    deleteSelectedItem() {
      // unwatch the item and the corresponding itemDetail
      let currentItem = this.items[this.currentItemIndex];
      this.clearItemAndItemDetailWatcher(currentItem.id);

      // remove the item and itemDetails locally and remotely
      this.itemDetails.splice(this.currentItemIndex, 1);
      var itemToDelete = this.items.splice(this.currentItemIndex, 1);
      this.updateItemTimestamps();
      ItemAPIService.deleteItem(itemToDelete[0].id);
      // set currentItemIndex to null to hide the item editor
      this.currentItemIndex = null;
      this.hideDialogBox();
    },
    /**
     * deletes the option of the current item at the given index
     *
     * @param {Number} optionIndex - the index of the option to be deleted
     */
    deleteOption(optionIndex) {
      // set dialog properties
      this.setDialogTitle(this.$t("editor.dialog.delete_option.title"));
      this.setConfirmButtonConfig({
        enabled: true,
        text: this.$t("generic.yes"),
        class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
      });
      this.setCancelButtonConfig({
        enabled: true,
        text: this.$t("generic.no"),
        class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
      });

      // set the index to delete, set the dialog action, show the dialog
      this.optionIndexToDelete = optionIndex;
      this.setDialogAction("deleteOption");
      this.showDialogBox();
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
