<template>
  <!-- big box -->
  <div class="flex flex-col w-full h-full rounded-md main-container relative" v-if="localSelectedItemIndex != null">
    <!-- question type picker -->
    <div class="absolute rounded-md mt-4 ml-2 z-5" :class="questionTypeDropdownClass">
      <QuestionTypeDropdown
        class="w-full"
        @toggle-visibility="toggleQuestionTypeDropdown"
        :options="questionTypeOptions"
        v-model:selectedIndex="localQuestionTypeIndex"
        :isDisabled="isInteractionDisabled"
      ></QuestionTypeDropdown>
    </div>
    <!-- nav bar -->
    <div class="flex space-x-1 flex-row w-full p-4 justify-end">
      <!-- dropdown for choosing items -->
      <ItemDropDown :optionsList="itemOptionsList" v-model:value="localSelectedItemIndex" class="mr-0"></ItemDropDown>

      <!-- previous item button -->
      <icon-button
        class="rounded-tl-xl rounded-bl-xl w-8 h-8 disabled:opacity-50 hidden bp-500:block md:hidden lg:block"
        :iconConfig="previousItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex - 1)"
        :buttonClass="previousItemButtonClass"
        :disabled="isFirstItem"
        v-tooltip="previousItemTooltip"
      ></icon-button>

      <!-- next item button -->
      <icon-button
        class="rounded-tr-xl rounded-br-xl w-8 h-8 disabled:opacity-50 hidden bp-500:block md:hidden lg:block"
        :iconConfig="nextItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex + 1)"
        :buttonClass="nextItemButtonClass"
        :disabled="isLastItem"
        v-tooltip="nextItemTooltip"
      ></icon-button>

      <!-- add item button -->
      <icon-button
        class="rounded-xl w-8 h-8 px-2 hidden xsm:block"
        :iconConfig="addItemIconConfig"
        :buttonClass="addItemButtonClass"
        @click="removeSelectedItemIndex"
        v-tooltip.top="addItemButtonTooltip"
        :disabled="isInteractionDisabled"
      ></icon-button>

      <!-- delete item button -->
      <icon-button
        class="rounded-xl bg-delete-button w-8 h-8 shadow-lg px-2"
        :iconConfig="deleteItemIconConfig"
        @click="deleteSelectedItem"
        v-tooltip.left="deleteItemButtonTooltip"
        :buttonClass="deleteItemButtonClass"
        :disabled="isInteractionDisabled"
      ></icon-button>
    </div>

    <!-- item editor -->
    <div class="h-full border-2 rounded-t-xl mr-2 ml-2 p-2 pb-5 item-editor-box">
      <!-- question input box : expandable -->
      <Textarea
        :placeholder="questionInputPlaceholder"
        :title="questionInputTitle"
        v-model:value="questionText"
        ref="questionText"
        class="p-2"
        :boxStyling="'pl-4 focus:ring-primary'"
      ></Textarea>

      <!-- time input HH : MM : SS : mmm -->
      <time-input
        :title="timeInputTitle"
        class="p-2"
        v-model:timeObject="timeObject"
        :errorStates="timeInputErrorStates"
        :isDisabled="isInteractionDisabled"
        :disabledTooltip="timeDisabledTooltip"
        @error-occurred="$emit('error-occurred')"
        @error-resolved="$emit('error-resolved')"
      ></time-input>

      <!-- input field for entering options  -->
      <div v-if="isQuestionTypeMCQ">
        <input-text
          v-for="(option, optionIndex) in options"
          class="p-2"
          v-model:value="options[optionIndex]"
          :placeholder="optionInputPlaceholder"
          :title="getOptionInputTitle(optionIndex)"
          :key="optionIndex"
          :startIcon="getCorrectOptionIconConfig(optionIndex)"
          :endIcon="getDeleteOptionIconConfig"
          :boxStyling="getOptionBoxStyling(optionIndex)"
          @start-icon-selected="updateCorrectOption(optionIndex)"
          @end-icon-selected="deleteOption(optionIndex)"
        ></input-text>
      </div>
      <!-- add option button -->
      <div class="flex justify-end mr-2 mt-2" v-if="isQuestionTypeMCQ">
        <icon-button
          :titleConfig="addOptionButtonTitleConfig"
          class="float-right"
          @click="addOption"
          :buttonClass="addOptionButtonClass"
          :disabled="isInteractionDisabled"
          v-tooltip.bottom="addOptionTooltip"
        ></icon-button>
      </div>

      <!-- setting max char limit -->
      <div v-if="isQuestionTypeSubjective" class="p-2">
        <!-- checkbox -->
        <label class="inline-flex items-center mt-3">
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-primary focus:ring-transparent"
            v-model="isMaxCharLimitSet"
            checked
          /><span class="ml-2 text-gray-700">Set Character Limit</span>
        </label>
        <!-- the max limit input -->
        <div v-if="isMaxCharLimitSet" class="flex space-x-2 items-center">
          <p class="text-gray-500 h-full text-sm sm:text-base md:text-sm lg:text-base">MAX</p>
          <input-text
            :placeholder="'100'"
            v-model:value.number="maxCharLimit"
            class="w-24"
            :boxStyling="charLimitBoxClass"
            @keypress="maxCharLimitInputKeypress"
          ></input-text>
          <!-- :isDisabled="isDisabled"
        v-tooltip.bottom="disabledInputTooltip" -->
          <p class="text-gray-500 h-full text-sm sm:text-base md:text-sm lg:text-base">CHARACTERS ALLOWED</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from "../UI/Buttons/IconButton.vue";
import ItemDropDown from "../UI/DropDownMenu/ItemDropDown.vue";
import QuestionTypeDropdown from "@/components/Editor/QuestionTypeDropdown.vue";
import InputText from "../UI/Text/InputText.vue";
import TimeInput from "@/components/UI/Text/TimeInput.vue";
import Textarea from "@/components/UI/Text/Textarea.vue";
import ItemFunctionalService from "@/services/Functional/Item.js";

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
      previousItemButtonClass: "bg-primary-button hover:bg-primary-button-hover focus:ring-primary shadow-lg",
      nextItemIconConfig: {
        // icon config for next item button
        enabled: true,
        iconName: "chevron-right-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for next item button
      nextItemButtonClass: "bg-primary-button hover:bg-primary-button-hover focus:ring-primary shadow-lg",
      addItemIconConfig: {
        // icon config for add item button
        enabled: true,
        iconName: "plus-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for add item button
      addItemButtonClass: [
        "bg-primary-button hover:bg-primary-button-hover disabled:opacity-40 focus:ring-primary shadow-lg",
        { "cursor-not-allowed": this.isInteractionDisabled },
      ],
      // styling classes for add option button
      addOptionButtonClass: [
        `rounded-md font-bold p-5 h-2 w-auto bg-primary-button shadow-lg
        hover:bg-primary-button-hover disabled:opacity-50 focus:ring-primary`,
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
      questionTypeOptions: [
        {
          value: "mcq",
          label: "Multiple Choice",
          icon: "radio-button.svg",
        },
        {
          value: "subjective",
          label: "Subjective",
          icon: "subjective-question.svg",
        },
      ],
      localQuestionTypeIndex: this.questionTypeIndex, // local copy of the current question type index
      isQuestionDropdownShown: false, // whether the question type dropdown is shown
      // isMaxCharLimitSet: false, // whether the max char limit has been set
      // maxCharLimit: 100, // the max char limit
    };
  },

  watch: {
    localQuestionTypeIndex() {
      this.$emit("update:questionTypeIndex", this.localQuestionTypeIndex);
      this.$emit("question-type-changed", this.questionTypeOptions[this.localQuestionTypeIndex]["value"]);
    },
    questionTypeIndex() {
      this.localQuestionTypeIndex = this.questionTypeIndex;
    },
    maxCharLimit() {
      // if the user has not set the limit as empty - reset it back to 100
      if (this.maxCharLimit == "") this.maxCharLimit = 100;
    },
  },

  props: {
    itemList: {
      // list of items
      default: () => [],
      type: Array,
    },
    selectedItemIndex: {
      // index of the selected item
      default: 0,
      type: Number,
    },
    videoDuration: {
      // total video duration in seconds
      default: 0,
      type: Number,
    },
    isInteractionDisabled: {
      // whether it is allowed to interact with the item editor
      default: false,
      type: Boolean,
    },
    questionTypeIndex: {
      // index of the type of the question to be created
      default: 0,
      type: Number,
    },
  },

  components: {
    ItemDropDown,
    IconButton,
    InputText,
    TimeInput,
    Textarea,
    QuestionTypeDropdown,
  },
  methods: {
    maxCharLimitInputKeypress(event) {
      // invoked when a key is pressed in the input area for setting max limit
      var numberPattern = /[0-9]/g;
      if (event.key.match(numberPattern) == null) event.preventDefault();
    },
    toggleQuestionTypeDropdown(newValue) {
      // invoked when the question type dropdown's visibility is toggled
      this.isQuestionDropdownShown = newValue;
    },
    getHeading(itemType) {
      // heading for the current item
      return this.$t(`editor.item_editor.heading.${itemType}`);
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
      if (!ItemFunctionalService.isTimestampValid(timeInput, this.localItemTimestamps, this.localSelectedItemIndex))
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
      this.localItemList[this.localSelectedItemIndex].details.options.push("");
    },
    getCorrectOptionIconConfig(optionIndex) {
      // config for the correct option icon
      return {
        enabled: true,
        name: "check-circle-regular",
        class: [{ "text-green-500": this.isOptionMarkedCorrect(optionIndex) }, "cursor-pointer"],
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
      if (this.isOptionMarkedCorrect(optionIndex)) return this.$t("tooltip.editor.item_editor.correct_option.marked");
      return this.$t("tooltip.editor.item_editor.correct_option.unmarked");
    },
    isOptionMarkedCorrect(optionIndex) {
      // whether the given option index is the right option
      return optionIndex == this.correctOptionIndex;
    },
    getOptionBoxStyling(optionIndex) {
      // returns the styling for the option box for the given index
      return {
        "border-green-500": this.isOptionMarkedCorrect(optionIndex),
        "border-4": this.isOptionMarkedCorrect(optionIndex),
      };
    },
    updateSelectedItemIndex(index) {
      // updates the current item selected
      this.localSelectedItemIndex = index;
    },
    convertSecondsToISOTime(timeInSeconds) {
      // converts time in seconds to ISOString format
      // reference -
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
      // https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript

      var timestampObject = {};
      var isoTime = new Date(Math.floor(timeInSeconds) * 1000).toISOString().substr(11, 8);
      var hour = parseInt(isoTime.split(":")[0]);
      var minute = parseInt(isoTime.split(":")[1]);
      var second = parseInt(isoTime.split(":")[2]);

      timestampObject["hour"] = hour;
      timestampObject["minute"] = minute;
      timestampObject["second"] = second;
      timestampObject["millisecond"] = 0;

      if (Math.floor(timeInSeconds) < timeInSeconds) {
        var ms = parseInt(String(timeInSeconds).split(".")[1].padEnd(3, "0"));
        timestampObject["millisecond"] = ms;
      }

      return timestampObject;
    },
    convertISOTimeToSeconds(timeInISO) {
      // converts the timestamp object recieved from the timeinput component
      // into seconds
      var hour = parseInt(timeInISO.hour) || 0;
      var minute = parseInt(timeInISO.minute) || 0;
      var second = parseInt(timeInISO.second) || 0;
      var millisecond = parseInt(timeInISO.millisecond) || 0;
      return hour * 3600 + minute * 60 + second + millisecond / 1000;
    },
    deleteSelectedItem() {
      // emit a request to delete the selected item
      // will be listened by Editor.vue
      this.$emit("delete-selected-item");
    },
    updateCorrectOption(selectedOptionIndex) {
      // when some option is selected as correct, update it in the
      // item list
      this.localItemList[this.localSelectedItemIndex].details.correct_answer = selectedOptionIndex;
    },
  },

  computed: {
    charLimitBoxClass() {
      // class for the input area to enter max char limit
      return ["text-center disabled:opacity-50"];
    },
    questionTypeDropdownClass() {
      // class for the question type dropdown
      return { "w-full": this.isQuestionDropdownShown, "w-1/3": !this.isQuestionDropdownShown };
    },
    questionType() {
      // type of the question being created
      return this.questionTypeOptions[this.localQuestionTypeIndex]["value"];
    },
    isQuestionTypeMCQ() {
      // whether the type of the question being created is mcq
      return this.questionType == "mcq";
    },
    isQuestionTypeSubjective() {
      // whether the type of the question being created is subjective
      return this.questionType == "subjective";
    },
    timeDisabledTooltip() {
      // tooltip for the time input box when it is disabled
      return this.$t("tooltip.time_input");
    },
    previousItemTooltip() {
      // tooltip for the previous item button
      return this.$t("tooltip.editor.item_editor.buttons.previous");
    },
    nextItemTooltip() {
      // tooltip for the next item button
      return this.$t("tooltip.editor.item_editor.buttons.next");
    },
    optionInputPlaceholder() {
      // placeholder for the option input
      return this.$t("editor.item_editor.option_input.placeholder");
    },
    questionInputTitle() {
      // title for the textarea for the question text
      return this.$t("editor.item_editor.question_input.title");
    },
    questionInputPlaceholder() {
      // placeholder for the textarea for the question text
      return this.$t("editor.item_editor.question_input.placeholder");
    },
    timeInputTitle() {
      // title for the timestamp input
      return this.$t("editor.item_editor.time_input.title");
    },
    localItemTimestamps() {
      // returns a list of timestamp values after extracting them from the items
      return this.localItemList.map(value => value.time);
    },
    timeInputErrorStates() {
      // create and pass an object containing info about the error message
      // and if that error message is active or not
      var errorStates = {};
      errorStates[this.timeExceedsWarning] = this.timeExceedsVideoDuration;
      errorStates[this.itemInVicinityWarning] = this.itemInVicinity;
      return errorStates;
    },
    deleteItemButtonClass() {
      // styling classes for delete item button
      if (this.isInteractionDisabled) return "disabled:opacity-40 cursor-not-allowed";
      return undefined;
    },
    addOptionTooltip() {
      // tooltip for add option button
      if (this.isInteractionDisabled) return this.$t("tooltip.editor.item_editor.buttons.add_option.disabled");
      return this.$t("tooltip.editor.item_editor.buttons.add_option.enabled");
    },
    deleteItemButtonTooltip() {
      // tooltip text for delete item button
      // itemType is just "question" right now - parametrize when more types are supported

      // TODO: uncomment below code when a non-buggy tooltip is implemented

      // var itemType = "question"
      // if (this.isInteractionDisabled)
      //   return `You cannot delete a ${itemType} once the plio is published`
      // return "Delete this ${itemType}"
      return undefined;
    },
    addItemButtonTooltip() {
      // tooltip for the smaller add item button
      // itemType is just "question" right now - parametrize when more types are supported
      var itemType = "question";
      if (this.isInteractionDisabled)
        return this.$t(`tooltip.editor.item_editor.buttons.add_item.${itemType}.disabled`);
      return this.$t(`tooltip.editor.item_editor.buttons.add_item.${itemType}.enabled`);
    },
    addOptionButtonTitleConfig() {
      // title config for add option button
      return {
        value: this.$t("editor.item_editor.buttons.add_option"),
        class: "p-4 text-white rounded-md font-bold",
      };
    },
    getDeleteOptionIconConfig() {
      // config for the delete option icon
      return {
        enabled: true,
        name: "delete",
        class: "bg-red-500 cursor-pointer w-8 h-8 hover:bg-red-700 rounded-md",
        tooltip: this.isInteractionDisabled
          ? this.$t("tooltip.editor.item_editor.buttons.delete_option.disabled")
          : this.$t("tooltip.editor.item_editor.buttons.delete_option.enabled"),
        isDisabled: this.isInteractionDisabled,
      };
    },
    localItemList: {
      // a local copy of the item list
      get() {
        return this.itemList;
      },
      set(localItemList) {
        this.$emit("update:itemList", localItemList);
      },
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
    itemOptionsList() {
      // preparing an options list to pass to the dropdown
      // the dropdown implementation takes a list of labels to show,
      // along with the index to actually let the component choose which
      // label to show (using a v-model). This combination of "index", "label"
      // can be used by some other parent component as well.
      var optionsList = [];
      this.localItemList.forEach((item, itemIndex) => {
        var currentItem = {};
        currentItem["value"] = itemIndex;
        var itemType = this.$t(`editor.item_editor.dropdown.${item.type}`);
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
        return this.localItemList[this.localSelectedItemIndex].details.text;
      },
      set(value) {
        // set the updated question text back into the item
        this.localItemList[this.localSelectedItemIndex].details.text = value;
      },
    },
    maxCharLimit: {
      get() {
        // extract the character limit from the item
        return this.localItemList[this.localSelectedItemIndex].details.max_char_limit || 100;
      },
      set(value) {
        // set the character limit in the item
        this.localItemList[this.localSelectedItemIndex].details.max_char_limit = value;
      },
    },
    isMaxCharLimitSet: {
      get() {
        // extract whether character limit is set from the item
        return this.localItemList[this.localSelectedItemIndex].details.has_char_limit;
      },
      set(value) {
        // set whether character limit exists in the item
        this.localItemList[this.localSelectedItemIndex].details.has_char_limit = value;
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
        return this.convertSecondsToISOTime(itemTime);
      },
      set(value) {
        // convert timeObject to seconds and
        // check for any time input errors and toggle the respective error flags

        var timeInSeconds = this.convertISOTimeToSeconds(value);
        this.checkTimeInputErrors(timeInSeconds);

        // update the local time values if no error is present
        if (!this.isAnyError) this.localItemList[this.localSelectedItemIndex].time = timeInSeconds;
      },
    },
    options: {
      // computed array of options
      get() {
        return this.localItemList[this.localSelectedItemIndex].details.options;
      },
      set(value) {
        this.localItemList[this.localSelectedItemIndex].details.options = value;
      },
    },
    correctOptionIndex() {
      // get the index of the correct answer in the list of options
      return this.localItemList[this.localSelectedItemIndex].details.correct_answer;
    },
    isAnyError() {
      // returns if any error is present after checking individual error
      // states that are defined
      return this.timeExceedsVideoDuration || this.itemInVicinity;
    },
  },

  emits: [
    "update:itemList",
    "update:selectedItemIndex",
    "delete-selected-item",
    "delete-option",
    "error-occurred",
    "error-resolved",
    "update:questionTypeIndex",
    "question-type-changed",
    "toggle-max-char-limit",
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
