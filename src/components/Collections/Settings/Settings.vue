<template>
  <div class="border-2 border-gray-200 shadow-lg rounded-2xl p-2 bg-white w-46 m-auto">
    <div class="flex flex-col w-full">
      <!-- close button - header -->
      <div class="w-full flex justify-end border-b-2 pb-2">
        <icon-button
          :iconConfig="closeButtonIconConfig"
          :buttonClass="closeButtonClass"
          @click="close"
          data-test="closeButton"
        ></icon-button>
      </div>
      <div class="w-full h-full my-10">
        <div v-for="(setting, index) in listOfSettings" :key="index">
          <div class="flex flex-row w-full h-20 px-10">
            <div class="flex flex-col my-auto">
              <p :class="settingTitleTextClass">{{ setting.title }}</p>
              <p :class="settingSubTitleTextClass">{{ setting.subTitle }}</p>
            </div>
            <input
              :type="setting.type"
              :class="getInputElementClass(setting.type)"
              style="box-shadow: none"
            />
          </div>
        </div>
      </div>
      <!-- save/cancel buttons - footer -->
      <div class="w-full flex flex-col px-8">
        <!-- info for settings -->
        <div
          class="mt-6 w-full p-2 rounded-md border border-yellow-400 flex space-x-4 mb-4"
        >
          <!-- icon -->
          <inline-svg
            :src="getImageSource('exclamation-circle-solid.svg')"
            class="w-10 h-10 text-yellow-600 fill-current"
          ></inline-svg>
          <!-- text -->
          <p class="text-yellow-600 my-auto">
            The new settings will only apply to plios created in the future and not the
            already created plios.
          </p>
        </div>
        <div class="w-full flex flex-row justify-end space-x-2">
          <!-- save button -->
          <icon-button
            :buttonClass="saveButtonClass"
            :titleConfig="saveButtonTitleConfig"
            @click="save"
            data-test="saveButton"
          ></icon-button>
          <!-- cancel button -->
          <icon-button
            :buttonClass="cancelButtonClass"
            :titleConfig="cancelButtonTitleConfig"
            @click="cancel"
            data-test="cancelButton"
          ></icon-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import Utilities from "@/services/Functional/Utilities.js";

export default {
  components: {
    IconButton,
  },
  data() {
    return {
      closeButtonIconConfig: {
        enabled: true,
        iconName: "times-circle-white",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      closeButtonClass: "w-10 h-10",
      saveButtonClass:
        "py-2 px-4 transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg bg-primary",
      cancelButtonClass:
        "py-2 px-4 transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg bg-white",
      saveButtonTitleConfig: {
        value: "Save",
        class: "text-white text-md sm:text-lg lg:text-xl font-bold",
      },
      cancelButtonTitleConfig: {
        value: "Cancel",
        class: "text-primary text-md sm:text-lg lg:text-xl font-bold",
      },
      settingTitleTextClass: "text-3xl",
      settingSubTitleTextClass: "text-xl",
    };
  },
  props: {
    listOfSettings: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    ...Utilities,
    close() {
      this.$emit("window-closed");
    },
    save() {
      console.log("save clicked");
    },
    cancel() {
      console.log("cancel clicked");
    },
    getInputElementClass(inputType) {
      let mapping = {
        checkbox:
          "ml-auto rounded h-14 my-auto w-14 border-none bg-gray-200 text-primary",
      };
      return inputType in mapping ? mapping[inputType] : "";
    },
  },
  emits: ["window-closed"],
};
</script>
<style>
/* input[type="checkbox"] {
  box-shadow: none;
} */
</style>
