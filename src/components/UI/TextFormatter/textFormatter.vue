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
  </div>
</template>

<script>
export default {
  name: "textFormatter",

  props: ["value", "name"],

  data() {
    return {
      innerValue: this.value,
    };
  },

  mounted() {
    document.execCommand("defaultParagraphSeparator", false, "p");
  },

  methods: {
    applyBold() {
      document.execCommand("bold");
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
