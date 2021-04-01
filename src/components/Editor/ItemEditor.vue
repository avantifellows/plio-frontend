<template>
  <!-- big box -->
  <div class="flex relative h-full justify-center" v-if="localSelectedItemIndex != null">
    <div
      class="flex flex-col w-full rounded-md main-container"
      :class="{ 'opacity-50 pointer-events-none': showDialog }"
    >
      <div class="flex gap-1 flex-row w-full p-4 nav-bar justify-end">
        <!-- nav bar -->
        <div class="mr-auto flex content-center">
          <p class="self-center editor-title">
            EDIT {{ localItemList[localSelectedItemIndex].type.toUpperCase() }}
          </p>
        </div>

        <!-- dropdown for choosing items -->
        <ItemDropDown
          :optionsList="itemOptionsList"
          v-model:selectedItemIndex="localSelectedItemIndex"
        ></ItemDropDown>

        <!-- previous item button -->
        <icon-button
          class="rounded-tl-xl rounded-bl-xl w-8 h-8"
          :iconConfig="previousItemIconConfig"
          @click="updateSelectedItemIndex(localSelectedItemIndex - 1)"
          :class="{ 'opacity-50': isFirstItem }"
          :buttonClass="previousItemButtonClass"
          :disabled="isFirstItem"
          v-tooltip.top="'Move to previous question'"
        ></icon-button>

        <!-- next item button -->
        <icon-button
          class="rounded-tr-xl rounded-br-xl w-8 h-8"
          :iconConfig="nextItemIconConfig"
          @click="updateSelectedItemIndex(localSelectedItemIndex + 1)"
          :class="{ 'opacity-50': isLastItem }"
          :buttonClass="nextItemButtonClass"
          :disabled="isLastItem"
          v-tooltip.top="'Move to next question'"
        ></icon-button>

        <!-- add item button -->
        <icon-button
          class="rounded-xl w-8 h-8"
          :iconConfig="addItemIconConfig"
          :buttonClass="addItemButtonClass"
          v-tooltip.top="'Create a new question'"
        ></icon-button>

        <!-- delete item button -->
        <icon-button
          class="rounded-xl bg-delete-button w-8 h-8"
          :iconConfig="deleteItemIconConfig"
          v-tooltip.top="'Delete this question'"
        ></icon-button>
      </div>

      <!-- item editor -->
      <div class="h-full border-2 rounded-t-xl mr-2 ml-2 p-2 item-editor-box">
        <!-- question input box : expandable -->
        <Textarea
          :placeholder="'placeholder'"
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
          :timeValid="timeExceedsVideoDuration"
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
        <div class="flex justify-end mr-2 mt-2">
          <icon-button
            :titleConfig="addOptionButtonTitleConfig"
            class="float-right"
            @click="addOption"
          ></icon-button>
        </div>
      </div>
    </div>
    <dialog-box
      :title="dialogTitle"
      class="fixed"
      v-if="showDialog"
      @confirm="dialogConfirmClicked"
      @cancel="dialogCancelClicked"
    ></dialog-box>
    <toast ref="toast"></toast>
  </div>
</template>

<script>
import IconButton from "../UI/Buttons/IconButton.vue";
import ItemDropDown from "../UI/DropDownMenu/ItemDropDown.vue";
import InputText from "../UI/Text/InputText.vue";
import TimeInput from "@/components/UI/Text/TimeInput.vue";
import Textarea from "@/components/UI/Text/Textarea.vue";
import DialogBox from "../UI/Alert/DialogBox.vue";
import Toast from "@/components/UI/Alert/Toast";

export default {
  name: "ItemEditor",

  data() {
    return {
      previousItemIconConfig: {
        enabled: true,
        iconName: "chevron-left-solid",
        iconClass: "text-white h-5 w-2.5",
      },
      previousItemButtonClass: "bg-primary-button hover:bg-primary-button-hover",
      nextItemIconConfig: {
        enabled: true,
        iconName: "chevron-right-solid",
        iconClass: "text-white h-5 w-2.5",
      },
      nextItemButtonClass: "bg-primary-button hover:bg-primary-button-hover",
      addItemIconConfig: {
        enabled: true,
        iconName: "plus-solid",
        iconClass: "text-white h-5 w-2.5",
      },
      addItemButtonClass: "bg-primary-button hover:bg-primary-button-hover",
      deleteItemIconConfig: {
        enabled: true,
        iconName: "delete",
        iconClass: "text-white h-5 w-2.5",
      },
      timeExceedsVideoDuration: false,
      dialogTitle: "", // title for the dialog box
      dialogDescription: "", // description for the dialog box
      showDialog: false, // whether to show the dialog box
      dialogAction: "", // action that invoked the dialog box
      // index of the option to be deleted; -1 means nothing to be deleted
      optionIndexToDelete: -1,
    };
  },

  props: {
    itemList: {
      default: () => [],
      type: Array,
    },
    selectedItemIndex: {
      default: 0,
      type: Number,
    },
    videoDuration: {
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
    DialogBox,
    Toast,
  },

  methods: {
    addOption() {
      // adds an option to the current question
      this.localItemList[this.localSelectedItemIndex].details.options.push("");
    },
    dialogConfirmClicked() {
      // invoked when the confirm button of the dialog box is clicked
      // hide the dialog box
      this.showDialog = false;
      if (this.dialogAction == "deleteOption") {
        this.confirmDeleteOption();
      }
    },
    dialogCancelClicked() {
      // invoked when the cancel button of the dialog box is clicked
      // hide the dialog box
      this.showDialog = false;
      if (this.dialogAction == "deleteOption") {
        this.cancelDeleteOption();
      }
      // reset dialog action
      this.dialogAction = "";
    },
    confirmDeleteOption() {
      // invoked when the confirm button of the dialog box for deleting option is clicked
      // there should always be at least 2 options, allow deletion only
      // if the number of options is >= 3
      if (this.localItemList[this.localSelectedItemIndex].details.options.length < 3) {
        this.$refs.toast.show("error", "A question must have at least 2 options", 3000);
        return;
      }

      // delete the option
      this.localItemList[this.localSelectedItemIndex].details.options.splice(
        this.optionIndexToDelete,
        1
      );
      // if the deleted option was the correct answer, reset the correct answer
      if (this.optionIndexToDelete == this.correctOptionIndex) {
        this.localItemList[this.localSelectedItemIndex].details.correct_answer = 0;
      }
      this.optionIndexToDelete = -1; // reset the option index to be deleted
    },
    cancelDeleteOption() {
      // invoked when the cancel button of the dialog box for deleting option is clicked
      this.optionIndexToDelete = -1; // reset the option index to be deleted
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
      this.dialogTitle = "Are you sure you want to delete this option?";
      this.optionIndexToDelete = optionIndex;
      this.dialogAction = "deleteOption";
      this.showDialog = true;
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
    updateCorrectOption(selectedOptionIndex) {
      // when some option is selected as correct, update it in the
      // item list
      this.localItemList[
        this.localSelectedItemIndex
      ].details.correct_answer = selectedOptionIndex;
    },
  },

  computed: {
    addOptionButtonTitleConfig() {
      return {
        value: "Add another option",
        class: "bg-yellow-600 p-4 text-white rounded-md font-bold hover:bg-green-600",
      };
    },
    getDeleteOptionIconConfig() {
      // config for the delete option icon
      return {
        enabled: true,
        name: "delete",
        class: "bg-red-500 cursor-pointer w-8 h-8 hover:bg-red-700 rounded-md",
        tooltip: "Delete this option",
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
      // TODO: ditch the primevue implementation
      var optionsList = [];
      this.localItemList.forEach((item, itemIndex) => {
        var currentItem = {};
        currentItem["index"] = itemIndex;
        var itemType = this.capitalizeFirstLetter(item.type);
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
    timeObject: {
      // this object contains four keys - 'hour', 'minute', 'second'
      // and 'millisecond' - all are type Number
      get() {
        // convert seconds to timeObject
        var itemTime = this.localItemList[this.localSelectedItemIndex].time;
        return this.convertSecondsToISOTime(itemTime || 0);
      },
      set(value) {
        // convert timeObject to seconds
        var timeInSeconds = this.convertISOTimeToSeconds(value);
        if (timeInSeconds > this.videoDuration) {
          this.timeExceedsVideoDuration = true;
        } else {
          this.timeExceedsVideoDuration = false;
          this.localItemList[this.localSelectedItemIndex].time = timeInSeconds || 0;
        }
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
      return this.localItemList[this.localSelectedItemIndex].details.correct_answer;
    },
  },

  emits: ["update:itemList", "update:selectedItemIndex"],
};
</script>

<style scoped>
.nav-bar {
  height: 10%;
}
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
