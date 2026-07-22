<template>
  <div
    class="flex flex-col bg-white w-5/6 sm:w-4/6 md:w-3/6 xl:w-2/6 border rounded-lg shadow-xl fixed top-1/6 sm:top-1/4 md:top-1/6"
  >
    <!-- header -->
    <div class="h-10 w-full bg-white rounded-t-md">
      <!-- dialog close button -->
      <inline-svg
        :src="getImageSource('times-circle-solid.svg')"
        class="h-1/2 hover:stroke-2 m-2 text-gray-400 cursor-pointer hover:text-primary float-right"
        @click="closeDialog"
      ></inline-svg>
    </div>

    <!-- body -->
    <div
      class="h-48 bp-360:h-56 bp-420:h-72 bp-500:h-96 w-full bg-white px-10 relative"
    >
      <!-- image preview -->
      <img
        v-if="showImagePreview"
        :src="imageToPreview"
        :class="imagePreviewClass"
        alt="imagePreview"
        decoding="async"
        loading="eager"
        fetchpriority="high"
      />

      <!-- upload box - drag here to upload message -->
      <div
        v-else
        class="border border-dashed border-gray-700 bg-white h-full w-full flex flex-col"
        id="upload-box"
      >
        <!-- loading spinner -->
        <inline-svg
          v-if="isImageLoading"
          :src="getImageSource('spinner-solid.svg')"
          class="animate-spin w-1/6 h-1/6 m-auto text-primary"
        ></inline-svg>

        <!-- image icon svg -->
        <inline-svg
          v-else
          :src="getImageSource('add_image.svg')"
          class="transform -rotate-12 w-2/3 h-2/3 m-auto text-primary"
        ></inline-svg>
        <div
          class="mx-auto mb-2 text-xs bp-360:text-sm bp-420:text-base sm:text-base md:text-lg font-semibold px-2 text-center"
        >
          {{ clickHereToUploadMessage }}
        </div>
        <div :class="fileSizeInfoTextClass">
          <p>{{ fileSizeInfoText }}</p>
        </div>
      </div>

      <!-- input element that handles the uploading -->
      <!-- adapted from here - https://github.com/kartoteket/vue-image-upload-resize -->
      <VueImageUploader
        outputFormat="verboseWithFile"
        accept="image/*"
        @uploading="startImageLoading"
        @input="loadAndPreviewImage"
        :class="uploaderInputClass"
        :key="reRenderKey"
        ref="imageUploader"
      ></VueImageUploader>
    </div>

    <!-- footer -->
    <div
      class="h-10 w-full bg-white rounded-b-md flex flex-row space-x-4 justify-end pr-10"
      :class="{ 'h-20': showImagePreview, invisible: !showImagePreview }"
    >
      <!-- delete button -->
      <icon-button
        :titleConfig="deleteButtonTitleConfig"
        :buttonClass="deleteButtonClass"
        @click="deleteAndUnsetImage"
        data-test="deleteImageButton"
      ></icon-button>

      <!-- done button -->
      <icon-button
        :titleConfig="doneButtonTitleConfig"
        :buttonClass="doneButtonClass"
        @click="submitImage"
        data-test="submitImageButton"
      ></icon-button>
    </div>
  </div>
</template>

<script>
import VueImageUploader from "@/components/Vue2PortedPackages/VueImageUploader.vue";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

// images more than 10 MB are not allowed to be uploaded
const MAX_IMAGE_UPLOAD_SIZE = 10485760;

export default {
  name: "ImageUploaderDialog",
  components: {
    VueImageUploader,
    IconButton,
  },
  props: {
    uploadedImage: {
      // if an existing, uploaded image needs to be previewed, that URL will be passed in this prop
      default: null,
      type: String,
    },
  },
  data() {
    return {
      imageToPreview: null, // the URL of the image that needs to be previewed
      localImageData: null, // the data of the image that has been uploaded, saved locally
      // styling class for the image preview div
      imagePreviewClass:
        "object-contain h-full w-full border border-dashed border-gray-700",
      isFileSizeLimitExceeded: false,
      reRenderKey: 0, // to re-render the upload image input everytime an image has been deleted
      isImageLoading: false, // whether the image is loading
    };
  },

  created() {
    if (this.uploadedImage != null) {
      // if there is an existing image, it needs to be previewed when the dialog opens up
      this.imageToPreview = this.uploadedImage;
    }
  },

  computed: {
    clickHereToUploadMessage() {
      return this.isTouchDevice
        ? this.$t("editor.dialog.image_uploader.title_touch")
        : this.$t("editor.dialog.image_uploader.title_non_touch");
    },
    isTouchDevice() {
      // detects if the user's device has a touchscreen or not
      return window.matchMedia("(any-pointer: coarse)").matches;
    },
    fileSizeInfoText() {
      return this.isFileSizeLimitExceeded
        ? this.$t("editor.dialog.image_uploader.size_info_text.error")
        : this.$t("editor.dialog.image_uploader.size_info_text.info");
    },
    fileSizeInfoTextClass() {
      return [
        {
          "text-red-500 font-semibold animate-bounce":
            this.isFileSizeLimitExceeded,
          "text-black": !this.isFileSizeLimitExceeded,
        },
        "mx-auto mb-8 text-xs bp-360:text-sm bp-420:text-base sm:text-base md:text-lg px-2 text-center",
      ];
    },
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
        value: this.$t("editor.dialog.image_uploader.buttons.delete"),
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
        value: this.$t("editor.dialog.image_uploader.buttons.done"),
        class: "text-white text-md font-bold",
      };
    },
    doneButtonClass() {
      // class for the done button
      return "bg-primary hover:bg-primary-hover p-1 px-2 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-10 place-self-center";
    },
    showImagePreview() {
      // whether to show the image preview or not
      if (this.imageToPreview != null) return true;
      return false;
    },
  },

  methods: {
    getImageSource: GenericUtilities.getImageSource,
    startImageLoading() {
      // sets the image state as loading
      this.isImageLoading = true;
    },
    stopImageLoading() {
      // sets the image state as loaded
      this.isImageLoading = false;
    },
    loadAndPreviewImage(imageInfo) {
      // save the image info locally
      // extract the base64 URL from the info and
      // use it to show the preview
      if (imageInfo != undefined && "dataUrl" in imageInfo) {
        if (imageInfo.file.size > MAX_IMAGE_UPLOAD_SIZE) {
          this.isFileSizeLimitExceeded = true;
        } else {
          this.isFileSizeLimitExceeded = false;
          this.localImageData = imageInfo;
          this.imageToPreview = this.localImageData.dataUrl;
        }
        this.stopImageLoading();
      }
    },
    closeDialog() {
      // emit the event that the dialog has to be closed
      this.$emit("close-dialog");
    },
    deleteAndUnsetImage() {
      // re-render the image upload input component
      this.reRenderKey = !this.reRenderKey;
      // invoked when the user clicks the delete button
      // hide the image preview
      this.imageToPreview = null;

      // if the image was saved locally only, purge the local data
      // else if the image was saved in the DB, emit an event
      // (image deletion and unlinking is handled separately)
      if (this.uploadedImage == null) this.localImageData = null;
      else this.$emit("delete-image");
    },
    submitImage() {
      // when a locally uploaded image needs to be submitted to the DB,
      // emit an event with the image file as a payload
      if (this.localImageData != null) {
        this.$emit("image-selected", this.localImageData.file);
      }
      this.closeDialog();
    },
  },

  emits: ["close-dialog", "image-selected", "delete-image"],
};
</script>
