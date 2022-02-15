<template>
  <div
    class="grid space-x-2 bp-420:space-x-4 bp-500:space-x-2 sm:space-x-4 md:space-x-6"
    :class="{
      'grid-cols-3 sm:grid-cols-4': isImageEnabled && isTitleOrDescriptionEnabled,
    }"
  >
    <inline-svg
      v-if="isImageEnabled"
      :src="icon"
      :class="iconClass"
      class="place-self-center"
    ></inline-svg>
    <div
      class="my-2 col-span-2 sm:col-span-3 flex flex-col space-y-2"
      v-if="isTitleOrDescriptionEnabled"
    >
      <p class="font-bold text-base bp-500:text-lg md:text-xl" v-if="isTitleEnabled">
        {{ title }}
      </p>
      <p class="text-xs bp-500:text-sm md:text-base" v-if="isDescriptionEnabled">
        {{ description }}
      </p>
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
      return this.imageConfig.name != "";
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
