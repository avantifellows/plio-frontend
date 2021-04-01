<!-- inspired from https://github.com/vuewind/toast/blob/master/index.js -->
<template>
  <div
    :class="boxColor"
    class="z-50 fixed top-0 right-0 p-5 flex text-center items-center place-self-center"
  >
    <div class="flex text-md">
      <!-- success icon -->
      <div>
        <inline-svg :src="toastIcon" class="place-self-center w-5 h-5"></inline-svg>
      </div>
      <!-- toast message -->
      <p class="pl-1" :class="textColor">{{ summary }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false, // whether to show the toast or not
      type: "", // type of toast message: either of "success" or "error"
      summary: "", // the summary message of the toast
      life: 0, // how long should the toast be shown for
    };
  },
  watch: {
    visible(newVisible) {
      // only show the toast for the amount of time given as life
      if (newVisible) {
        let timeout = window.setTimeout(() => {
          this.close();
          clearTimeout(timeout);
        }, this.life);
      }
    },
  },
  computed: {
    boxColor() {
      // color for the toast box
      return {
        "bg-green-200": this.type == "success",
        "bg-red-200": this.type == "error",
        hidden: !this.visible,
      };
    },
    textColor() {
      // color for the toast text
      return {
        "text-green-800": this.type == "success",
        "text-red-800": this.type == "error",
      };
    },
    toastIcon() {
      var icon = require("@/assets/images/exclamation-circle-solid.svg");
      if (this.type == "success") {
        icon = require("@/assets/images/check-circle-regular.svg");
      }
      return icon;
    },
  },
  methods: {
    close() {
      // hide the toast
      this.visible = false;
    },
    show(type, summary, life) {
      this.type = type;
      this.summary = summary;
      this.life = life;
      this.visible = true;
    },
  },
};
</script>
