<template>
  <div class="grid sm:grid-cols-5">
    <div class="sm:col-span-2">1</div>
    <div class="grid grid-cols-1 sm:col-span-3 gap-4 justify-center pl-10 pr-10">
      <input-text
        :placeholder="videoInputPlaceholder"
        :title="videoInputTitle"
      ></input-text>
      <input-text
        :placeholder="titleInputPlaceholder"
        :title="titleInputTitle"
      ></input-text>
    </div>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
export default {
  components: {
    InputText,
  },
  data() {
    return {
      plioId: "",
    };
  },
  computed: {
    isDraftCreated() {
      return this.plioId != "";
    },
    videoInputPlaceholder() {
      return this.$t("editor.video_input.placeholder");
    },
    videoInputTitle() {
      return this.$t("editor.video_input.title");
    },
    titleInputPlaceholder() {
      return this.$t("editor.plio_title.placeholder");
    },
    titleInputTitle() {
      return this.$t("editor.plio_title.title");
    },
  },
};
</script>
