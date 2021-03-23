<!-- inspired from https://github.com/vuewind/toast/blob/master/index.js -->
<template>
  <div>
    <div
      :class="boxColor"
      class="absolute top-0 right-0 m-5 p-5 flex text-center items-center place-self-center"
    >
      <div class="flex text-md" :class="textColor">
        <!-- toast icon -->
        <font-awesome-icon
          :icon="['fas', 'check']"
          v-if="isSuccess"
          class="place-self-center"
        ></font-awesome-icon>
        <font-awesome-icon
          :icon="['fas', 'times']"
          v-else
          class="place-self-center"
        ></font-awesome-icon>
        <!-- toast message -->
        <p class="pl-1">{{ summary }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
library.add(faCheck, faTimes);

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
    isSuccess() {
      // whether the toast type is success
      return this.type == "success";
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
