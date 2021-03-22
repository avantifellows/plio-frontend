<template>
  <div class="grid sm:grid-cols-5">
    <div class="grid grid-rows-6 sm:col-span-2 justify-center pl-10 pr-10">
      <div class="row-span-1">
        <URL :link="plioLink" @copied="showCopyStatus"></URL>
      </div>
      <div class="row-span-2">
        <slider-with-markers
          @input="updateCurrentTimestamp"
          :markerPositions="itemPositions"
        ></slider-with-markers>
        Timestamp: {{ currentTimestamp }}
      </div>
      <div class="row-span-1 items-stretch">
        <Button label="Publish Plio" class="p-button-success" />
      </div>
    </div>
    <div class="grid grid-rows-6 grid-cols-1 sm:col-span-3 pl-10 pr-10 justify-start">
      <div class="row-span-1 grid gap-y-4">
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
    <!-- <toast></toast> -->
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
import URL from "@/components/UI/Text/URL.vue";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
import Button from "primevue/button";
// import Toast from "primevue/toast";

export default {
  components: {
    InputText,
    URL,
    Button,
    SliderWithMarkers,
    // Toast,
  },
  data() {
    return {
      // TODO: this is just a dummy value
      plioId: "r7R7ErAy2a",
      // TODO: dummy
      items: [{ time: 10 }, { time: 20 }],
      value: [20, 80],
      currentTimestamp: 0,
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
    plioLink() {
      if (this.plioId == "") {
        return "";
      }
      return process.env.VUE_APP_FRONTEND + "/#/play/" + this.plioId;
    },
    itemPositions() {
      var positions = [];

      this.items.forEach((item) => {
        positions.push(item.time);
      });

      return positions;
    },
  },
  methods: {
    updateCurrentTimestamp(timestamp) {
      this.currentTimestamp = timestamp;
    },
    showCopyStatus() {
      // let severity;
      // let summary;
      // if (success) {
      //   severity = "success";
      //   summary = "Link Copied to Clipboard";
      // } else {
      //   severity = "error";
      //   summary = "Error while copying link to Clipboard";
      // }

      // this.$toast.add({
      //   severity: severity,
      //   summary: summary,
      //   life: 3000,
      // });
    },
  },
};
</script>
