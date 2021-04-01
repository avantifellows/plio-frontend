<template>
  <!-- big box -->
  <div
    v-if="localSelectedItemIndex != null"
    class="flex flex-col w-full h-full rounded-md main-container"
  >
    <!-- nav bar -->
    <div class="flex gap-1 flex-row w-full p-4 nav-bar justify-end">
      <div class="mr-auto flex content-center">
        <p class="self-center editor-title">
          EDIT {{ localItemList[localSelectedItemIndex].type.toUpperCase() }}
        </p>
      </div>

      <ItemDropDown
        :optionsList="itemOptionsList"
        v-model:selectedItemIndex="localSelectedItemIndex"
      ></ItemDropDown>

      <!-- previous item button -->
      <icon-button
        class="rounded-tl-xl rounded-bl-xl w-8 h-8 disabled:opacity-50"
        :iconConfig="previousItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex - 1)"
        :buttonClass="previousItemButtonClass"
        :disabled="isFirstItem"
      ></icon-button>

      <!-- next item button -->
      <icon-button
        class="rounded-tr-xl rounded-br-xl w-8 h-8 disabled:opacity-50"
        :iconConfig="nextItemIconConfig"
        @click="updateSelectedItemIndex(localSelectedItemIndex + 1)"
        :buttonClass="nextItemButtonClass"
        :disabled="isLastItem"
      ></icon-button>

      <!-- add item button -->
      <icon-button
        class="rounded-xl w-8 h-8"
        :iconConfig="addItemIconConfig"
        :buttonClass="addItemButtonClass"
        @click="removeSelectedItemIndex"
        v-tooltip.top="addItemButtonTooltip"
        :disabled="isPublished"
      ></icon-button>

      <!-- delete item button -->
      <icon-button
        class="rounded-xl bg-delete-button w-8 h-8"
        :iconConfig="deleteItemIconConfig"
        @click="deleteSelectedItem"
        v-tooltip.left="deleteItemButtonTooltip"
        :buttonClass="deleteItemButtonClass"
        :disabled="isPublished"
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
        :timeValid="timeExceedsVideoDuration"
        :isDisabled="isPublished"
      ></time-input>

      <input-text
        v-for="(option, optionNumber) in options"
        :placeholder="'Enter Option'"
        :title="'Option ' + (optionNumber + 1)"
        class="p-2"
        v-model:value="options[optionNumber]"
        :key="optionNumber"
        :sideIcon="getOptionSideIconConfig(optionNumber)"
        :boxStyling="getOptionBoxStyling(optionNumber)"
        @box-selected="updateCorrectOption(optionNumber)"
      ></input-text>
    </div>
  </div>
</template>

<script>
import IconButton from "../UI/Buttons/IconButton.vue";
import ItemDropDown from "../UI/DropDownMenu/ItemDropDown.vue";
import InputText from "../UI/Text/InputText.vue";
import TimeInput from "@/components/UI/Text/TimeInput.vue";
import Textarea from "@/components/UI/Text/Textarea.vue";

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
      previousItemButtonClass: "bg-primary-button hover:bg-primary-button-hover",
      nextItemIconConfig: {
        // icon config for next item button
        enabled: true,
        iconName: "chevron-right-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for next item button
      nextItemButtonClass: "bg-primary-button hover:bg-primary-button-hover",
      addItemIconConfig: {
        // icon config for add item button
        enabled: true,
        iconName: "plus-solid",
        iconClass: "text-white h-5 w-5",
      },
      // styling classes for add item button
      addItemButtonClass: [
        "bg-primary-button hover:bg-primary-button-hover disabled:opacity-40",
        { "cursor-not-allowed": this.isPublished },
      ],
      deleteItemIconConfig: {
        // icon config for delete item button
        enabled: true,
        iconName: "delete",
        iconClass: "text-white",
      },
      // styling classes for delete item button
      deleteItemButtonClass: this.isPublished
        ? "disabled:opacity-40 cursor-not-allowed"
        : undefined,
      timeExceedsVideoDuration: false, //stores if the time entered by the user exceeds the total video duration
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
    isPublished: {
      // whether the plio has been published or not
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
    removeSelectedItemIndex() {
      // resets the selectedItemIndex value to null
      // doing this makes the itemEditor invisible and the add item
      // button shows up
      this.localSelectedItemIndex = null;
    },
    getOptionSideIconConfig(optionNumber) {
      return {
        enabled: true,
        name: "check-circle-regular",
        class: [
          { "text-green-500": optionNumber == this.correctOptionIndex },
          "cursor-pointer",
        ],
      };
    },
    getOptionBoxStyling(optionNumber) {
      return {
        "border-green-500": optionNumber == this.correctOptionIndex,
        "border-4": optionNumber == this.correctOptionIndex,
      };
    },
    capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    updateSelectedItemIndex(index) {
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
    updateCorrectOption(optionNumber) {
      // when some option is selected as correct, update it in the
      // item list
      this.localItemList[
        this.localSelectedItemIndex
      ].details.correct_answer = optionNumber;
    },
    deleteSelectedItem() {
      this.$emit("delete-selected-item");
    },
  },

  computed: {
    deleteItemButtonTooltip() {
      // tooltip text for delete item button
      // itemType is just "question" right now - parametrize when more types are supported

      // TODO: uncomment below code when a non-buggy tooltip is implemented

      // var itemType = "question"
      // if (this.isPublished)
      //   return `You cannot delete a ${itemType} once the plio is published`
      // return "Delete this ${itemType}"
      return undefined;
    },
    addItemButtonTooltip() {
      // tooltip for the smaller add item button
      // itemType is just "question" right now - parametrize when more types are supported
      var itemType = "question";
      if (this.isPublished)
        return `You cannot add a new ${itemType} once the plio is published`;
      return `Add a ${itemType}`;
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

  emits: ["update:itemList", "update:selectedItemIndex", "delete-selected-item"],
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
