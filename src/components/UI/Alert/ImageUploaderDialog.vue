<template>
  <div
    class="flex flex-col bg-white w-full sm:w-3/6 xl:w-2/6 border rounded-lg shadow-xl fixed top-1/6 sm:top-1/4 md:top-1/6"
  >
    <!-- header -->
    <div class="h-10 w-full bg-white rounded-t-md">
      <!-- dialog close button -->
      <inline-svg
        :src="getIconSource('times-circle-solid.svg')"
        class="h-1/2 hover:stroke-2 m-2 text-gray-400 cursor-pointer hover:text-primary float-right"
        @click="closeDialog"
      ></inline-svg>
    </div>

    <!-- body -->
    <div class="h-96 w-full bg-white px-10 relative">
      <!-- image preview -->
      <img v-if="showImagePreview" :src="imageToPreview" :class="imagePreviewClass" />

      <!-- upload box - drag here to upload message -->
      <div
        v-else
        class="border border-dashed border-gray-700 bg-white h-full w-full flex flex-col"
        id="upload-box"
      >
        <inline-svg
          :src="getIconSource('add_image.svg')"
          class="w-2/3 h-2/3 m-auto text-primary transform -rotate-12"
        ></inline-svg>
        <div class="mx-auto mb-8 text-lg font-semibold">
          Drag and drop or click here to upload
        </div>
      </div>

      <!-- input element that handles the uploading -->
      <!-- adapted from here - https://github.com/kartoteket/vue-image-upload-resize -->
      <VueImageUploader
        outputFormat="verboseWithFile"
        accept="image/*"
        doNotResize="['gif', 'svg']"
        @input="loadAndPreviewImage"
        :class="uploaderInputClass"
      ></VueImageUploader>
    </div>

    <!-- footer -->
    <div
      class="h-10 w-full bg-white rounded-b-md flex flex-row space-x-4 justify-end pr-10"
      :class="{ 'h-20': showImagePreview }"
    >
      <!-- delete button -->
      <icon-button
        :iconConfig="deleteButtonIconConfig"
        :titleConfig="deleteButtonTitleConfig"
        :buttonClass="deleteButtonClass"
        v-if="showImagePreview"
        @click="deleteAndUnsetImage"
      ></icon-button>

      <!-- done button -->
      <icon-button
        :iconConfig="doneButtonIconConfig"
        :titleConfig="doneButtonTitleConfig"
        :buttonClass="doneButtonClass"
        v-if="showImagePreview"
        @click="submitImage"
      ></icon-button>
    </div>
  </div>
</template>

<script>
import VueImageUploader from "@/components/Vue2PortedPackages/VueImageUploader.vue";
import Utilities from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  name: "ImageUploaderDialog",
  components: {
    VueImageUploader,
    IconButton,
  },
  props: {
    existingImage: {
      // if an existing image needs to be previewed, that URL will be passed in this prop
      default: null,
      type: String,
    },
  },
  data() {
    return {
      showImagePreview: false, // whether to show the image preview or not
      imageToPreview: null, // the URL of the image that needs to be previewed
      localImageData: null, // the data of the image that has been uploaded, saved locally
      // styling class for the image preview div
      imagePreviewClass:
        "object-contain h-full w-full border border-dashed border-gray-700",
    };
  },

  created() {
    if (this.existingImage != null) {
      // if there is an existing image, it needs to be previewed when the dialog opens up
      this.showImagePreview = true;
      this.imageToPreview = this.existingImage;
    }
  },

  computed: {
    uploaderInputClass() {
      // styling class for the input element that handles uploading
      return [
        { hidden: this.showImagePreview },
        "w-full h-full opacity-0 absolute inset-0 cursor-pointer",
      ];
    },
    deleteButtonTitleConfig() {
      // title config for the delete button
      return {
        value: "Delete",
        class: "text-black hover:text-white text-md font-bold",
      };
    },
    deleteButtonClass() {
      // class for the delete button
      return "bg-gray-300 hover:bg-red-500 p-1 px-2 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-10 place-self-center";
    },
    doneButtonTitleConfig() {
      // title config for the done button
      return {
        value: "Done",
        class: "text-white text-md font-bold",
      };
    },
    doneButtonClass() {
      // class for the done button
      return "bg-primary hover:bg-primary-hover p-1 px-2 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-10 place-self-center";
    },
  },

  methods: {
    ...Utilities,
    loadAndPreviewImage(imageInfo) {
      // save the image info locally
      // extract the base64 URL from the info and
      // use it to show the preview
      if (imageInfo != undefined) {
        this.localImageData = imageInfo;
        this.imageToPreview = this.localImageData.dataUrl;
        this.showImagePreview = true;
      }
    },
    closeDialog() {
      // emit the event that the dialog has to be closed
      this.$emit("close-dialog");
    },
    deleteAndUnsetImage() {
      // invoked when the user clicks the delete button
      // hide the image preview
      this.showImagePreview = false;
      this.imageToPreview = null;

      // if the image was saved locally only, purge the local data
      // else if the image was saved in the DB, emit an event
      // (image deletion and unlinking is handled separately)
      if (this.existingImage == null) this.localImageData = null;
      else this.$emit("delete-and-unlink-image");
    },
    submitImage() {
      // when a locally uploaded image needs to be submitted to the DB,
      // emit an event with the image file as a payload
      if (this.localImageData != null)
        this.$emit("image-selected", this.localImageData.file);
      this.closeDialog();
    },
  },

  emits: ["close-dialog", "image-selected", "delete-and-unlink-image"],
};
</script>
