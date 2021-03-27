<!-- inspired from https://github.com/vuewind/toast/blob/master/index.js -->
<template>
  <div>
    <div
      :class="boxColor"
      class="absolute top-0 right-0 m-5 p-5 flex text-center items-center place-self-center"
    >
      <div class="flex text-md" :class="textColor">
        <!-- success icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          v-if="isSuccess"
          class="place-self-center w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <!-- error icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          v-else
          class="place-self-center w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        <!-- toast message -->
        <p class="pl-1">{{ summary }}</p>
      </div>
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
