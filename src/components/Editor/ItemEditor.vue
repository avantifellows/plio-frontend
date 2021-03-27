<template>
  <!-- big box -->
  <div class="flex flex-col w-full h-full rounded-md main-container">
    <!-- nav bar -->
    <div class="flex gap-1 flex-row w-full p-4 nav-bar justify-end">
      <div class="mr-auto flex content-center">
        <p class="self-center editor-title">
          EDIT {{ localItemList[selectedItemIndex].type.toUpperCase() }}
        </p>
      </div>

      <ItemDropDown
        :optionsList="itemOptionsList"
        v-model:selectedItemIndex="selectedItemIndex"
      ></ItemDropDown>

      <!-- previous item button -->
      <icon-button
        class="rounded-tl-xl rounded-bl-xl"
        :iconConfig="previousItemIconConfig"
        @click="updateSelectedItemIndex(selectedItemIndex - 1)"
        :class="{ 'opacity-50': isFirstItem }"
        :disabled="isFirstItem"
      ></icon-button>

      <!-- next item button -->
      <icon-button
        class="rounded-tr-xl rounded-br-xl"
        :iconConfig="nextItemIconConfig"
        @click="updateSelectedItemIndex(selectedItemIndex + 1)"
        :class="{ 'opacity-50': isLastItem }"
        :disabled="isLastItem"
      ></icon-button>

      <!-- add item button -->
      <icon-button class="rounded-xl" :iconConfig="addItemIconConfig"></icon-button>

      <!-- delete item button -->
      <icon-button
        class="rounded-xl bg-delete-button"
        :iconConfig="deleteItemIconConfig"
      ></icon-button>
    </div>

    <!-- item editor -->
    <div class="h-full border-2 rounded-t-xl mr-2 ml-2 p-2 item-editor-box">
      <!-- question input box -->
      <input-text
        :placeholder="'placeholder'"
        :title="'Question'"
        v-model:value="questionText"
        ref="questionText"
      ></input-text>
    </div>
  </div>
</template>

<script>
import IconButton from "../UI/Buttons/IconButton.vue";
import ItemDropDown from "../UI/DropDownMenu/ItemDropDown.vue";
import InputText from "../UI/Text/InputText.vue";

export default {
  name: "ItemEditor",

  data() {
    return {
      previousItemIconConfig: {
        enabled: true,
        iconName: "chevron-left-solid",
      },
      nextItemIconConfig: {
        enabled: true,
        iconName: "chevron-right-solid",
      },
      addItemIconConfig: {
        enabled: true,
        iconName: "plus-solid",
      },
      deleteItemIconConfig: {
        enabled: true,
        iconName: "delete",
      },
      selectedItemIndex: 0,
    };
  },

  props: {
    itemList: {
      default: () => [],
      type: Array,
    },
  },

  components: {
    ItemDropDown,
    IconButton,
    InputText,
  },

  created() {},

  methods: {
    capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    updateSelectedItemIndex(index) {
      this.selectedItemIndex = index;
    },
  },

  computed: {
    localItemList: {
      // a local copy of the item list
      get() {
        return this.itemList;
      },
      set(localItemList) {
        this.$emit("update:itemList", localItemList);
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
      return this.selectedItemIndex == this.localItemList.length - 1;
    },
    isFirstItem() {
      // is the current selected item the first item in the list?
      return this.selectedItemIndex == 0;
    },
    questionText: {
      get() {
        // extract question text from item
        return this.localItemList[this.selectedItemIndex].details.text;
      },
      set(value) {
        // set the updated question text back into the item
        this.localItemList[this.selectedItemIndex].details.text = value;
      },
    },
  },

  emits: ["update:itemList"],
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
