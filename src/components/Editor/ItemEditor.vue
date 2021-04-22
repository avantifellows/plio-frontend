<template>
  <!-- big box -->
  <div
    class="flex flex-col w-full h-full rounded-md main-container"
    v-if="localSelectedItemIndex != null"
  >
    <div class="flex gap-1 flex-row w-full p-4 justify-end">
      <!-- nav bar -->
      <div class="mr-auto sm:flex content-center hidden">
        <p class="self-center editor-title">
          EDIT {{ localItemList[localSelectedItemIndex].type.toUpperCase() }}
        </p>
      </div>

      <!-- dropdown for choosing items -->
      <ItemDropDown
        :optionsList="itemOptionsList"
        v-model:selectedItemIndex="localSelectedItemIndex"
        class="mr-auto sm:mr-0"
      ></ItemDropDown>

      <!-- previous item button -->
      <icon-button
        class="rounded-tl-xl rounded-bl-xl w-8 h-8 disabled:opacity-50"
        :iconConfig="previousItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex - 1)"
        :buttonClass="previousItemButtonClass"
        :disabled="isFirstItem"
        v-tooltip.top="'Move to previous question'"
      ></icon-button>

      <!-- next item button -->
      <icon-button
        class="rounded-tr-xl rounded-br-xl w-8 h-8 disabled:opacity-50"
        :iconConfig="nextItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex + 1)"
        :buttonClass="nextItemButtonClass"
        :disabled="isLastItem"
        v-tooltip.top="'Move to next question'"
      ></icon-button>

      <!-- add item button -->
      <icon-button
        class="rounded-xl w-8 h-8"
        :iconConfig="addItemIconConfig"
        :buttonClass="addItemButtonClass"
        @click="removeSelectedItemIndex"
        v-tooltip.top="addItemButtonTooltip"
        :disabled="isInteractionDisabled"
      ></icon-button>

      <!-- delete item button -->
      <icon-button
        class="rounded-xl bg-delete-button w-8 h-8 shadow-lg"
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
        :placeholder="'Enter the question text here'"
        :title="'Question'"
        v-model:value="questionText"
        ref="questionText"
        class="p-2"
        :boxStyling="'pl-4'"
      ></Textarea>

      <!-- time input HH : MM : SS : mmm -->
      <time-input
        :title="'Time for the question to appear'"
        class="p-2"
        v-model:timeObject="timeObject"
        :errorStates="timeInputErrorStates"
        :isDisabled="isInteractionDisabled"
        @error-occurred="$emit('error-occurred')"
        @error-resolved="$emit('error-resolved')"
      ></time-input>

      <!-- input field for entering options  -->
      <input-text
        v-for="(option, optionIndex) in options"
        :placeholder="'Enter Option'"
        :title="'Option ' + (optionIndex + 1)"
        class="p-2"
        v-model:value="options[optionIndex]"
        :key="optionIndex"
        :startIcon="getCorrectOptionIconConfig(optionIndex)"
        :endIcon="getDeleteOptionIconConfig"
        :boxStyling="getOptionBoxStyling(optionIndex)"
        @start-icon-selected="updateCorrectOption(optionIndex)"
        @end-icon-selected="deleteOption(optionIndex)"
      ></input-text>
      <!-- add option button -->
      <div class="flex justify-end mr-2 mt-2" v-tooltip.bottom="addOptionTooltip">
        <icon-button
          :titleConfig="addOptionButtonTitleConfig"
          class="float-right"
          @click="addOption"
          :buttonClass="addOptionButtonClass"
          :disabled="isInteractionDisabled"
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from "../UI/Buttons/IconButton.vue";
import ItemDropDown from "../UI/DropDownMenu/ItemDropDown.vue";
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
      previousItemButtonClass:
        "bg-primary-button hover:bg-primary-button-hover shadow-lg",
      nextItemIconConfig: {
        // icon config for next item button
        enabled: true,
        iconName: "chevron-right-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for next item button
      nextItemButtonClass: "bg-primary-button hover:bg-primary-button-hover shadow-lg",
      addItemIconConfig: {
        // icon config for add item button
        enabled: true,
        iconName: "plus-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for add item button
      addItemButtonClass: [
        "bg-primary-button hover:bg-primary-button-hover disabled:opacity-40 shadow-lg",
        { "cursor-not-allowed": this.isInteractionDisabled },
      ],
      // styling classes for add option button
      addOptionButtonClass: [
        `rounded-md font-bold p-5 h-2 w-auto bg-primary-button shadow-lg
        hover:bg-primary-button-hover disabled:opacity-50`,
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
      dialogTitle: "", // title for the dialog box
      dialogDescription: "", // description for the dialog box
      showDialog: false, // whether to show the dialog box
      dialogAction: "", // action that invoked the dialog box
      // index of the option to be deleted; -1 means nothing to be deleted
      optionIndexToDelete: -1,
      // warning messages for error states
      timeExceedsWarning: "The time entered exceeds the video duration",
      itemInVicinityWarning: "Questions should be at least 2 seconds apart",
    };
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
  },

  components: {
    ItemDropDown,
    IconButton,
    InputText,
    TimeInput,
    Textarea,
  },
  methods: {
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
      this.localItemList[this.localSelectedItemIndex].details.options.push("");
    },
    getCorrectOptionIconConfig(optionIndex) {
      // config for the correct option icon
      return {
        enabled: true,
        name: "check-circle-regular",
        class: [
          { "text-green-500": this.isOptionMarkedCorrect(optionIndex) },
          "cursor-pointer",
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
        return "This option has marked as the correct option for this question";
      return "Mark this option as the correct option for this question";
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
    capitalizeFirstLetter(str) {
      // capitalize the first letter of a given string
      return str.charAt(0).toUpperCase() + str.slice(1);
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
      var isoTime = new Date(Math.floor(timeInSeconds) * 1000)
        .toISOString()
        .substr(11, 8);
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
      this.localItemList[
        this.localSelectedItemIndex
      ].details.correct_answer = selectedOptionIndex;
    },
  },

  computed: {
    localItemTimestamps() {
      // returns a list of timestamp values after extracting them from the items
      return this.localItemList.map((value) => value.time);
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
      if (this.isInteractionDisabled)
        return "You cannot add an option once the plio is published";
      return "Add an option";
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
        return `You cannot add a new ${itemType} once the plio is published`;
      return `Add a ${itemType}`;
    },
    addOptionButtonTitleConfig() {
      // title config for add option button
      return {
        value: "Add another option",
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
          ? "Cannot delete option once the plio is published"
          : "Delete this option",
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
        var itemType = this.capitalizeFirstLetter(item.type);
        currentItem["text"] = `${itemType} ${itemIndex + 1}`;
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
        if (!this.isAnyError)
          this.localItemList[this.localSelectedItemIndex].time = timeInSeconds;
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
