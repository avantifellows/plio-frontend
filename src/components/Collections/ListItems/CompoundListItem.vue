<template>
  <div class="flex space-x-4">
    <inline-svg
      v-if="isImageEnabled"
      :src="icon"
      :class="iconClass"
      class="place-self-center"
    ></inline-svg>
    <div class="my-2 flex flex-col space-y-2" v-if="isTitleOrDescriptionEnabled">
      <p class="font-bold text-xl" v-if="isTitleEnabled">{{ title }}</p>
      <p class="text-base" v-if="isDescriptionEnabled">{{ description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "CompoundListItem",
  props: {
    /**
     * config for the image to be displayed
     * contains two keys:
     * - name: filename for the image
     * - class: classes to be applied on the image
     */
    imageConfig: {
      type: Object,
      default: () => ({}),
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  computed: {
    isTitleOrDescriptionEnabled() {
      return this.isTitleEnabled || this.isDescriptionEnabled;
    },
    isTitleEnabled() {
      return this.title != "";
    },
    isDescriptionEnabled() {
      return this.description != "";
    },
    isImageEnabled() {
      return this.imageConfig != {} && this.imageConfig.name != "";
    },
    iconClass() {
      return this.imageConfig.class;
    },
    icon() {
      return require("@/assets/images/" + this.imageConfig.name + ".svg");
    },
  },
};
</script>
