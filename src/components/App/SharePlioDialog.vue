<template>
  <div
    class="fixed top-1/3 bg-white rounded-lg flex flex-col border border-gray-700 shadow-lg"
  >
    <div class="w-full flex justify-end p-2">
      <!-- close button -->
      <icon-button
        :iconConfig="closeDialogIconConfig"
        :buttonClass="closeDialogButtonClass"
        @click="closeSharePlioDialog"
      ></icon-button>
    </div>

    <div class="px-4 xsm:px-8 bp-500:px-12 pb-8">
      <!-- title -->
      <p class="text-2xl text-gray-500 font-bold w-56 sm:w-80">
        {{ $t("editor.dialog.share_plio.title") }}
      </p>
      <div
        class="flex flex-col sm:flex-row sm:space-x-4 my-4 p-2 px-4 bg-peach-light border border-gray-600 rounded-md"
      >
        <!-- link -->
        <p class="h-full place-self-center text-gray-600">{{ plioLink }}</p>
        <!-- copy link button -->
        <icon-button
          :titleConfig="copyLinkTitleClass"
          :buttonClass="copyLinkButtonClass"
          @click="copyLinkToClipboard"
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import Utilities from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  name: "SharePlioDialog",
  props: {
    plioLink: {
      type: String,
      required: true,
    },
  },
  components: {
    IconButton,
  },
  data() {
    return {
      closeDialogIconConfig: {
        // config for the icon of the button to close the dialog that comes after publishing
        enabled: true,
        iconName: "times-circle-solid",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      // class for the button to close the dialog that comes after publishing
      closeDialogButtonClass: "bg-white w-10 h-10 p-2",
      plioLinkCopied: false, // whether the plio link has been copied or not
    };
  },
  computed: {
    copyLinkButtonClass() {
      // styling class for the copy link button
      return [
        {
          "bg-primary hover:bg-primary-hover": !this.plioLinkCopied,
          "bg-green-500 hover:bg-green-600": this.plioLinkCopied,
        },
        `p-2 px-4 rounded-md mt-2 sm:mt-0`,
      ];
    },
    copyLinkTitleClass() {
      // styling class for the title of copy link button
      return {
        value: this.plioLinkCopied
          ? this.$t(`editor.dialog.share_plio.buttons.copy_link.copied`)
          : this.$t("editor.dialog.share_plio.buttons.copy_link.not_copied"),
        class: "text-white",
      };
    },
  },
  methods: {
    ...Utilities,
    closeSharePlioDialog() {
      // triggered on clicking the close button
      this.$emit("close");
      this.plioLinkCopied = false;
    },
    copyLinkToClipboard() {
      // triggered on clicking the copy link button
      // return if the link has already been copied
      if (this.plioLinkCopied) return;

      var success = this.copyToClipboard(this.plioLink);

      if (success) this.plioLinkCopied = true;
      else this.toast.error(this.$t("error.copying"));
    },
  },
  emits: ["close"],
};
</script>
