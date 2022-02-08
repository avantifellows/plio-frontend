<template>
  <div>
    <div class="flex flex-wrap" :value="innerValue">
      <button @click="applyBold" class="text-sm text-red-500 font-bold mr-3 ml-1">
        B
      </button>
      <button @click="applyItalic" class="text-sm text-red-500 font-bold italic mr-3">
        I
      </button>
      <button
        @click="applyUnderline"
        class="text-sm text-red-500 font-bold underline mr-3"
      >
        U
      </button>
    </div>

    <!-- <div
      @input="onInput"
      v-html="innerValue"
      contenteditable="true"
      class="outline-none border-2 p-4 rounded-lg border-gray-300 focus:border-green-300"
    /> -->
  </div>
</template>

<script>
export default {
  name: "textFormatter",

  props: ["value", "name"],

  data() {
    //let value;
    console.log("data is" + this.value);
    return {
      innerValue: this.value,
    };
  },

  mounted() {
    document.execCommand("defaultParagraphSeparator", false, "p");
  },

  methods: {
    onInput(event) {
      console.log(event.target.innerHTML);
    },

    applyBold() {
      document.execCommand("bold");
      console.log("boldcalled");
    },
    applyItalic() {
      document.execCommand("italic");
    },
    applyUnderline() {
      document.execCommand("underline");
    },
  },
};
</script>
<style>
.button {
  @apply border-2;
  @apply border-gray-300;
  @apply rounded-lg;
  @apply px-3 py-1;
  @apply mb-3 mr-3;
}
.button:hover {
  @apply border-green-300;
}
.wysiwyg-output h1 {
  @apply text-2xl;
  @apply font-bold;
  @apply pb-4;
}
</style>
