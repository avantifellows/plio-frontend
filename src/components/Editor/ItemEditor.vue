<template>
  <!-- big box -->
  <div
    class="flex flex-col w-full h-full rounded-md main-container relative"
    v-if="localSelectedItemIndex != null"
  >
    <!-- question type picker -->
    <div
      class="absolute rounded-md mt-4 ml-4 z-5"
      :class="questionTypeDropdownClass"
      id="questionTypePicker"
      v-tooltip="{
        content: questionTypePickerTooltip,
        placement: 'bottom-start',
      }"
    >
      <QuestionTypeDropdown
        class="w-full"
        @toggle-visibility="toggleQuestionTypeDropdown"
        :options="questionTypes"
        v-model:selectedIndex="localQuestionTypeIndex"
        :isDisabled="isInteractionDisabled"
        data-test="questionTypeDropdown"
      ></QuestionTypeDropdown>
    </div>
    <!-- nav bar -->
    <div class="flex space-x-1 flex-row w-full p-4 justify-end">
      <!-- dropdown for choosing items -->
      <SelectDropdown
        :optionsList="itemOptionsList"
        v-model:value="localSelectedItemIndex"
        class="mr-0"
      ></SelectDropdown>

      <!-- previous item button -->
      <icon-button
        class="rounded-tl-xl rounded-bl-xl w-8 h-8 disabled:opacity-50 hidden bp-500:block md:hidden lg:block"
        :iconConfig="previousItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex - 1)"
        :buttonClass="previousItemButtonClass"
        :disabled="isFirstItem"
        v-tooltip="$t('tooltip.editor.item_editor.buttons.previous')"
        data-test="previousItem"
      ></icon-button>

      <!-- next item button -->
      <icon-button
        class="rounded-tr-xl rounded-br-xl w-8 h-8 disabled:opacity-50 hidden bp-500:block md:hidden lg:block"
        :iconConfig="nextItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex + 1)"
        :buttonClass="nextItemButtonClass"
        :disabled="isLastItem"
        v-tooltip="$t('tooltip.editor.item_editor.buttons.next')"
        data-test="nextItem"
      ></icon-button>

      <!-- add item button -->
      <!-- adding an enclosing span to show tooltip when disabled -->
      <span v-tooltip="addItemButtonTooltip" tabindex="0">
        <icon-button
          class="rounded-xl w-8 h-8 px-2 hidden bp-360:block"
          :iconConfig="addItemIconConfig"
          :buttonClass="addItemButtonClass"
          @click="removeSelectedItemIndex"
          :disabled="isInteractionDisabled"
          ariaLabel="add item"
          data-test="addItem"
        ></icon-button>
      </span>

      <!-- delete item button -->
      <!-- adding an enclosing span to show tooltip when disabled -->
      <span v-tooltip="deleteItemButtonTooltip" tabindex="0">
        <icon-button
          class="rounded-xl bg-red-600 hover:bg-red-700 w-8 h-8 shadow-lg px-2"
          :iconConfig="deleteItemIconConfig"
          @click="deleteSelectedItem"
          :buttonClass="deleteItemButtonClass"
          :disabled="isInteractionDisabled"
          data-test="deleteItem"
          ariaLabel="delete item"
        ></icon-button>
      </span>
    </div>

    <!-- item editor -->
    <div class="h-full border-2 rounded-t-xl mr-2 ml-2 p-2 pb-5 item-editor-box">
      <div class="flex flex-row">
        <!-- question input box : expandable -->
        <Textarea
          :placeholder="$t('editor.item_editor.question_input.placeholder')"
          :title="$t('editor.item_editor.question_input.title')"
          v-model:value="questionText"
          ref="questionText"
          class="p-2 w-full"
          :boxStyling="'pl-4 focus:ring-primary'"
          :maxHeightLimit="questionTextboxHeightLimit"
          data-test="questionText"
        ></Textarea>
        <!-- add image to item button -->
        <span
          v-tooltip="{ content: addImageButtonTooltip, placement: 'left' }"
          class="my-auto"
        >
          <icon-button
            class="rounded-md w-12 h-12 disabled:opacity-50 my-auto group border pt-1"
            orientation="vertical"
            :iconConfig="addImageButtonIconConfig"
            :titleConfig="addImageButtonTitleConfig"
            :buttonClass="addImageButtonClass"
            :isDisabled="isInteractionDisabled"
            @click="showImageUploaderBox"
            data-test="questionImage"
          ></icon-button>
        </span>
      </div>

      <!-- time input HH : MM : SS : mmm -->
      <time-input
        :title="$t('editor.item_editor.time_input.title')"
        class="p-2"
        v-model:timeObject="timeObject"
        :errorStates="timeInputErrorStates"
        :isDisabled="isInteractionDisabled"
        :disabledTooltip="$t('tooltip.time_input')"
        @error-occurred="$emit('error-occurred')"
        @error-resolved="$emit('error-resolved')"
        data-test="time"
      ></time-input>

      <!-- input field for entering options  -->
      <div v-if="areOptionsVisible" data-test="options">
        <input-text
          v-for="(option, optionIndex) in options"
          class="p-2"
          v-model:value="options[optionIndex]"
          :placeholder="$t('editor.item_editor.option_input.placeholder')"
          :title="getOptionInputTitle(optionIndex)"
          :key="optionIndex"
          :startIcon="getCorrectOptionIconConfig(optionIndex)"
          :endIcon="getDeleteOptionIconConfig"
          :boxStyling="getOptionBoxStyling(optionIndex)"
          @start-icon-selected="updateCorrectAnswer(optionIndex)"
          @end-icon-selected="deleteOption(optionIndex)"
          data-test="option"
        ></input-text>
      </div>
      <!-- add option button -->
      <div class="flex justify-end m-2" v-if="areOptionsVisible">
        <span v-tooltip="addOptionTooltip" tabindex="0">
          <icon-button
            :titleConfig="addOptionButtonTitleConfig"
            @click="addOption"
            :buttonClass="addOptionButtonClass"
            :disabled="isInteractionDisabled"
            data-test="addOption"
          ></icon-button>
        </span>
      </div>

      <!-- setting max char limit -->
      <div
        v-if="isQuestionTypeSubjective"
        class="p-2"
        data-test="subjectiveQuestionContainer"
      >
        <!-- checkbox -->
        <label class="inline-flex items-center mt-3">
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-primary focus:ring-transparent"
            v-model="isMaxCharLimitSet"
            data-test="maxCharLimitCheckbox"
            checked
          /><span class="ml-2 text-gray-700">{{
            $t("editor.item_editor.heading.set_character_limit")
          }}</span>
        </label>
        <!-- the max limit input -->
        <div v-if="isMaxCharLimitSet" class="flex space-x-2 items-center">
          <p class="text-gray-500 h-full text-sm sm:text-base md:text-sm lg:text-base">
            {{ $t("editor.item_editor.heading.char_limit.max") }}
          </p>
          <input-text
            :placeholder="'100'"
            v-model:value.number="maxCharLimit"
            ref="maxCharLimit"
            class="w-24"
            :boxStyling="charLimitBoxClass"
            @keypress="maxCharLimitInputKeypress"
            @keydown="maxCharLimitInputKeydown"
            data-test="maxCharLimit"
          ></input-text>
          <p class="text-gray-500 h-full text-sm sm:text-base md:text-sm lg:text-base">
            {{ $t("editor.item_editor.heading.char_limit.chars_allowed") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SelectDropdown from "@/components/UI/Selectors/SelectDropdown.vue";
import QuestionTypeDropdown from "@/components/Editor/QuestionTypeDropdown.vue";
import InputText from "@/components/UI/Text/InputText.vue";
import TimeInput from "@/components/UI/Text/TimeInput.vue";
import Textarea from "@/components/UI/Text/Textarea.vue";
import ItemFunctionalService from "@/services/Functional/Item.js";
import {
  convertSecondsToISOTime,
  convertISOTimeToSeconds,
} from "@/services/Functional/Utilities/Generic.js";
import { useToast } from "vue-toastification";

export default {
  name: "ItemEditor",

  data() {
    return {
      previousItemIconConfig: {
        // icon config for previous item button
        enabled: true,
        iconName: "chevron-left-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for previous item button
      previousItemButtonClass:
        "bg-primary hover:bg-primary-hover focus:ring-primary shadow-lg",
      nextItemIconConfig: {
        // icon config for next item button
        enabled: true,
        iconName: "chevron-right-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for next item button
      nextItemButtonClass:
        "bg-primary hover:bg-primary-hover focus:ring-primary shadow-lg",
      addItemIconConfig: {
        // icon config for add item button
        enabled: true,
        iconName: "plus-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for add item button
      addItemButtonClass: [
        "bg-primary hover:bg-primary-hover disabled:opacity-40 focus:ring-primary shadow-lg",
        { "cursor-not-allowed": this.isInteractionDisabled },
      ],
      // styling classes for add option button
      addOptionButtonClass: [
        `rounded-md font-bold h-full w-auto bg-primary shadow-lg
        hover:bg-primary-hover disabled:opacity-50 focus:ring-primary`,
        { "cursor-not-allowed": this.isInteractionDisabled },
      ],
      deleteItemIconConfig: {
        // icon config for delete item button
        enabled: true,
        iconName: "delete",
        iconClass: "text-white",
      },
      timeExceedsVideoDuration: false, //stores if the time entered by the user exceeds the total video duration
      itemInVicinity: false, // stores if another item is in the vicinity of the current selected item
      // index of the option to be deleted; -1 means nothing to be deleted
      optionIndexToDelete: -1,
      // warning messages for error states
      timeExceedsWarning: "The time entered exceeds the video duration",
      itemInVicinityWarning: "Questions should be at least 2 seconds apart",
      // all the options for the question types
      questionTypes: [
        {
          value: "mcq",
          label: this.$t("generic.mcq"),
          icon: "radio-button.svg",
        },
        {
          value: "subjective",
          label: this.$t("generic.subjective"),
          icon: "subjective-question.svg",
        },
        {
          value: "checkbox",
          label: this.$t("generic.checkbox"),
          icon: "check-square-regular.svg",
        },
      ],
      isQuestionDropdownShown: false, // whether the question type dropdown is shown
      questionTextboxHeightLimit: 200, // maximum allowed height of the question text box in px
      // styling classes for add image button
      addImageButtonClass:
        "bg-white hover:bg-primary disabled:bg-white focus:ring-primary",
      addImageButtonIconConfig: {
        // icon config for add image button
        enabled: true,
        iconName: "image-regular",
        iconClass:
          "w-6 h-6 text-primary group-hover:text-white group-disabled:text-primary",
      },
      // set containing the question types which support options
      questionTypesSupportingOptions: new Set(["mcq", "checkbox"]),
      toast: useToast(),
    };
  },

  watch: {
    maxCharLimit() {
      // if the user has not set the limit - reset it back to 100
      if (this.maxCharLimit == "") this.maxCharLimit = 100;
    },
    isQuestionDropdownShown(value) {
      const tooltip = document.getElementById("questionTypePicker")._tippy;
      if (tooltip == undefined) return;
      if (value) {
        tooltip.disable();
      } else tooltip.enable();
    },
  },

  props: {
    itemList: {
      type: Array,
      required: true,
    },
    itemDetailList: {
      type: Array,
      required: true,
    },
    selectedItemIndex: {
      default: 0,
      type: Number,
    },
    /**
     * total video duration (in seconds)
     */
    videoDuration: {
      default: 0,
      type: Number,
    },
    /**
     * whether interaction with the item editor is allowed
     */
    isInteractionDisabled: {
      default: false,
      type: Boolean,
    },
    /**
     * index of the type of the question to be created
     */
    questionTypeIndex: {
      default: 0,
      type: Number,
    },
  },
  components: {
    SelectDropdown,
    IconButton,
    InputText,
    TimeInput,
    Textarea,
    QuestionTypeDropdown,
  },
  methods: {
    showImageUploaderBox() {
      // to show or hide the image uploader dialog box
      this.$emit("show-image-uploader");
    },
    maxCharLimitInputKeypress(event) {
      // invoked when a key is pressed in the input area for setting max limit
      // only allows numbers as input
      var numberPattern = /[0-9]/g;
      if (event.key.match(numberPattern) == null) event.preventDefault();
    },
    maxCharLimitInputKeydown(event) {
      // invoked when the backspace is clicked on the max char limit box
      // does not let the backspace make the value empty
      if (event.keyCode == 8) {
        if (this.maxCharLimit < 10) this.maxCharLimit = 100;
        else this.maxCharLimit = Number(String(this.maxCharLimit).slice(0, -1));
        event.preventDefault();
      }
    },
    toggleQuestionTypeDropdown(newValue) {
      // invoked when the question type dropdown's visibility is toggled
      this.isQuestionDropdownShown = newValue;
    },
    getOptionInputTitle(optionIndex) {
      // title for the placeholder input
      return this.$t("editor.item_editor.option_input.title") + " " + (optionIndex + 1);
    },
    checkTimeInputErrors(timeInput) {
      // checks if the time entered in the timeinput box has
      // any errors or not and toggles the respective variables

      // check if the time entered exceeds the video duration
      if (timeInput > this.videoDuration) this.timeExceedsVideoDuration = true;
      else this.timeExceedsVideoDuration = false;

      // check if any other item is in the vicinity of time entered by the user
      if (
        !ItemFunctionalService.isTimestampValid(
          timeInput,
          this.localItemTimestamps,
          this.localSelectedItemIndex
        )
      )
        this.itemInVicinity = true;
      else this.itemInVicinity = false;
    },
    removeSelectedItemIndex() {
      // resets the selectedItemIndex value to null
      // doing this makes the itemEditor invisible and the add item
      // button shows up
      this.localSelectedItemIndex = null;
    },
    addOption() {
      // adds an option to the current question
      this.selectedItemDetail.options.push("");
    },
    getCorrectOptionIconConfig(optionIndex) {
      // config for the correct option icon
      return {
        enabled: true,
        name: this.correctOptionIcon,
        class: [
          {
            "text-green-500": this.isOptionMarkedCorrect(optionIndex),
            "w-1 h-1": this.isQuestionTypeCheckbox,
          },
          "cursor-pointer ml-1",
        ],
        tooltip: this.getCorrectOptionTooltip(optionIndex),
      };
    },
    deleteOption(optionIndex) {
      // emit a request for option deletion, pass the optionIndex
      // as a payload -- will be listened to by Editor.vue
      this.$emit("delete-option", optionIndex);
    },
    getCorrectOptionTooltip(optionIndex) {
      // returns the tooltip for the correct option button for the given option index
      if (this.isOptionMarkedCorrect(optionIndex))
        return this.$t(
          `tooltip.editor.item_editor.correct_option.${this.questionType}.marked`
        );
      return this.$t(
        `tooltip.editor.item_editor.correct_option.${this.questionType}.unmarked`
      );
    },
    /** whether the given option index is marked as a correct option */
    isOptionMarkedCorrect(optionIndex) {
      if (this.isQuestionTypeMCQ) return optionIndex == this.correctAnswer;
      return this.correctAnswer.indexOf(optionIndex) != -1;
    },
    /** returns the styling for the option box for the given index */
    getOptionBoxStyling(optionIndex) {
      return {
        "border-green-500": this.isOptionMarkedCorrect(optionIndex),
      };
    },
    /** updates the current item selected */
    updateSelectedItemIndex(index) {
      this.localSelectedItemIndex = index;
    },
    /**
     * emits a request to delete the selected item
     */
    deleteSelectedItem() {
      this.$emit("delete-selected-item");
    },
    /**
     * updates the correct answer in the item list
     */
    updateCorrectAnswer(selectedOptionIndex) {
      if (this.isQuestionTypeMCQ) {
        // for mcq, simply update the correct answer as the given index
        this.localItemDetailList[
          this.localSelectedItemIndex
        ].correct_answer = selectedOptionIndex;
        return;
      }

      if (this.isQuestionTypeCheckbox) {
        let correctAnswer = this.selectedItemDetail.correct_answer;
        /*
         * for checkbox question, if the selected index was previously marked
         * as a correct option, unmark it. otherwise, mark it as a correct option
         */
        if (this.isOptionMarkedCorrect(selectedOptionIndex)) {
          if (this.correctAnswer.length > 1) {
            // remove the option from the list of correct answers if there
            // are other options marked as correct answers too
            correctAnswer.splice(correctAnswer.indexOf(selectedOptionIndex), 1);

            return;
          }

          this.toast.error(
            this.$t(
              "toast.editor.item_editor.correct_answer.unmark_last_selected_option_warning"
            )
          );
          return;
        }

        correctAnswer.push(selectedOptionIndex);
        correctAnswer.sort();
      }
    },
  },

  computed: {
    correctOptionIcon() {
      if (this.isQuestionTypeMCQ) return "check-circle-regular";
      return "check-square-regular";
    },
    isQuestionTypeMCQ() {
      return this.questionType == "mcq";
    },
    isQuestionTypeCheckbox() {
      return this.questionType == "checkbox";
    },
    isQuestionTypeSubjective() {
      return this.questionType == "subjective";
    },
    questionTypePickerTooltip() {
      return this.isInteractionDisabled
        ? this.$t("tooltip.editor.item_editor.buttons.question_type_picker.disabled")
        : this.$t("tooltip.editor.item_editor.buttons.question_type_picker.enabled");
    },
    addImageButtonTooltip() {
      if (!this.isQuestionImagePresent) {
        return this.isInteractionDisabled
          ? this.$t("tooltip.editor.item_editor.buttons.add_image.disabled")
          : this.$t("tooltip.editor.item_editor.buttons.add_image.enabled");
      }
      return this.isInteractionDisabled
        ? this.$t("tooltip.editor.item_editor.buttons.update_image.disabled")
        : this.$t("tooltip.editor.item_editor.buttons.update_image.enabled");
    },
    addImageButtonTitleConfig() {
      // title config for the add image button
      return {
        value: this.isQuestionImagePresent
          ? this.$t("editor.item_editor.image_upload.edit_image")
          : this.$t("editor.item_editor.image_upload.add_image"),
        class:
          "text-xs group-hover:text-white group-disabled:text-black text-black font-normal",
      };
    },
    isQuestionImagePresent() {
      // if the current selected item has an image present
      return this.selectedItemDetail.image != null;
    },
    localQuestionTypeIndex: {
      // local copy of the current question type index
      get() {
        return this.questionTypeIndex;
      },
      set(newQuestionTypeIndex) {
        let newQuestionType = this.questionTypes[newQuestionTypeIndex].value;
        let oldQuestionType = this.questionTypes[this.questionTypeIndex].value;
        // change the format of the correct answer if needed
        if (newQuestionType == "checkbox") {
          this.selectedItemDetail.correct_answer = [
            this.selectedItemDetail.correct_answer,
          ];
        } else if (oldQuestionType == "checkbox") {
          this.selectedItemDetail.correct_answer = this.selectedItemDetail.correct_answer[0];
        }

        this.$emit("update:questionTypeIndex", newQuestionTypeIndex);
        this.$emit("question-type-changed", newQuestionType);
      },
    },
    charLimitBoxClass() {
      // class for the input area to enter max char limit
      return "text-center disabled:opacity-50";
    },
    questionTypeDropdownClass() {
      // class for the question type dropdown
      return {
        "w-full": this.isQuestionDropdownShown,
        "w-1/3": !this.isQuestionDropdownShown,
      };
    },
    /** type of the question being created */
    questionType() {
      return this.questionTypes[this.localQuestionTypeIndex]["value"];
    },
    /** whether options need to be shown for the current question type */
    areOptionsVisible() {
      return this.questionTypesSupportingOptions.has(this.questionType);
    },
    /** returns a list of timestamp values after extracting them from the items */
    localItemTimestamps() {
      return this.localItemList.map((value) => value.time);
    },
    /**
     * creates and passes an object containing info about error messages
     * and if the various error messages are active or not
     */
    timeInputErrorStates() {
      let errorStates = {};
      errorStates[this.timeExceedsWarning] = this.timeExceedsVideoDuration;
      errorStates[this.itemInVicinityWarning] = this.itemInVicinity;
      return errorStates;
    },
    /** styling classes for delete item button */
    deleteItemButtonClass() {
      if (this.isInteractionDisabled) return "disabled:opacity-40 cursor-not-allowed";
      return undefined;
    },
    /** tooltip for add option button */
    addOptionTooltip() {
      if (this.isInteractionDisabled)
        return this.$t("tooltip.editor.item_editor.buttons.add_option.disabled");
      return this.$t("tooltip.editor.item_editor.buttons.add_option.enabled");
    },
    deleteItemButtonTooltip() {
      // itemType is just "question" right now - parametrize when more types are supported
      let itemType = "question";
      if (this.isInteractionDisabled)
        return this.$t(
          `tooltip.editor.item_editor.buttons.delete_item.${itemType}.disabled`
        );
      return this.$t(
        `tooltip.editor.item_editor.buttons.delete_item.${itemType}.enabled`
      );
    },
    addItemButtonTooltip() {
      // itemType is just "question" right now - parametrize when more types are supported
      let itemType = "question";
      if (this.isInteractionDisabled)
        return this.$t(
          `tooltip.editor.item_editor.buttons.add_item.${itemType}.disabled`
        );
      return this.$t(`tooltip.editor.item_editor.buttons.add_item.${itemType}.enabled`);
    },
    /** title config for add option button */
    addOptionButtonTitleConfig() {
      return {
        value: this.$t("editor.item_editor.buttons.add_option"),
        class: "px-4 py-2 text-white rounded-md font-bold",
      };
    },
    /**
     * whether options can be deleted;
     * not allowed if only 2 options are remaining
     */
    isDeleteOptionEnabled() {
      return this.options.length > 2;
    },
    /**
     * config for the delete option icon
     */
    getDeleteOptionIconConfig() {
      return {
        enabled: this.isDeleteOptionEnabled,
        name: "delete",
        class: "bg-red-500 cursor-pointer w-8 h-8 hover:bg-red-700 rounded-md",
        tooltip: this.isInteractionDisabled
          ? this.$t("tooltip.editor.item_editor.buttons.delete_option.disabled")
          : this.$t("tooltip.editor.item_editor.buttons.delete_option.enabled"),
        isDisabled: this.isInteractionDisabled,
      };
    },
    /**
     * a local copy of the item list
     */
    localItemList() {
      return this.itemList;
    },
    /**
     * a local copy of the item detail list
     */
    localItemDetailList() {
      return this.itemDetailList;
    },
    localSelectedItemIndex: {
      // a local copy of selected item index
      get() {
        return this.selectedItemIndex;
      },
      set(localSelectedItemIndex) {
        this.$emit("update:selectedItemIndex", localSelectedItemIndex);
      },
    },
    /**
     * prepares the list of options to be passed to the dropdown for navigating between items;
     * the dropdown implementation takes a list of labels to show,
     * along with the index to actually let the component choose which
     * label to show
     */
    itemOptionsList() {
      let optionsList = [];
      this.localItemList.forEach((item, itemIndex) => {
        let currentItem = {
          value: itemIndex,
        };
        let itemType = this.$t(`editor.item_editor.dropdown.${item.type}`);
        currentItem["label"] = `${itemType} ${itemIndex + 1}`;
        optionsList.push(currentItem);
      });

      return optionsList;
    },
    isLastItem() {
      // is the current selected item the last item in the list?
      return this.localSelectedItemIndex == this.localItemList.length - 1;
    },
    isFirstItem() {
      // is the current selected item the first item in the list?
      return this.localSelectedItemIndex == 0;
    },
    questionText: {
      get() {
        // extract question text from item
        return this.selectedItemDetail.text;
      },
      set(value) {
        // set the updated question text back into the item
        this.selectedItemDetail.text = value;
      },
    },
    maxCharLimit: {
      get() {
        // extract the character limit from the item
        if (this.selectedItemDetail == null) return null;
        return this.selectedItemDetail.max_char_limit || 100;
      },
      set(value) {
        // set the character limit in the item
        this.selectedItemDetail.max_char_limit = value;
      },
    },
    isMaxCharLimitSet: {
      get() {
        // extract whether character limit is set from the item
        if (this.selectedItemDetail == null) return false;
        return this.selectedItemDetail.has_char_limit;
      },
      set(value) {
        // set whether character limit exists in the item
        this.selectedItemDetail.has_char_limit = value;
      },
    },
    timeObject: {
      // this object contains four keys - 'hour', 'minute', 'second'
      // and 'millisecond' - all are type Number
      get() {
        // convert seconds to timeObject and
        // check for any time input errors and toggle the respective error flags

        var itemTime = this.localItemList[this.localSelectedItemIndex].time;
        this.checkTimeInputErrors(itemTime);
        return convertSecondsToISOTime(itemTime);
      },
      set(value) {
        // convert timeObject to seconds and
        // check for any time input errors and toggle the respective error flags

        var timeInSeconds = convertISOTimeToSeconds(value);
        this.checkTimeInputErrors(timeInSeconds);

        // update the local time values if no error is present
        if (!this.isAnyError)
          this.localItemList[this.localSelectedItemIndex].time = timeInSeconds;
      },
    },
    options: {
      // computed array of options
      get() {
        return this.selectedItemDetail.options;
      },
    },
    correctAnswer() {
      return this.selectedItemDetail.correct_answer;
    },
    /**
     * whether any error is present after checking individual error
     * states that are defined
     */
    isAnyError() {
      return this.timeExceedsVideoDuration || this.itemInVicinity;
    },
    /**
     * the details corresponding to the selected item
     */
    selectedItemDetail() {
      return this.localItemDetailList[this.localSelectedItemIndex];
    },
  },

  emits: [
    "update:selectedItemIndex",
    "delete-selected-item",
    "delete-option",
    "error-occurred",
    "error-resolved",
    "update:questionTypeIndex",
    "question-type-changed",
    "show-image-uploader",
  ],
};
</script>

<style scoped>
.main-container {
  background: #f4eae1;
}
.item-editor-box {
  background: #fff6ef;
}
.editor-title {
  color: #bcafa5;
}
</style>
