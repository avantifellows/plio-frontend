<template>
  <div class="bg-white rounded-lg flex flex-col border border-gray-700 shadow-lg">
    <div class="w-full flex justify-end p-2">
      <!-- close button -->
      <icon-button
        :iconConfig="closeDialogIconConfig"
        :buttonClass="closeDialogButtonClass"
        @click="closeSharePlioDialog"
        data-test="close"
      ></icon-button>
    </div>

    <div class="px-4 bp-360:px-8 bp-500:px-12 pb-8">
      <!-- title -->
      <p class="text-2xl text-gray-500 font-bold w-56 sm:w-80" data-test="title">
        {{ $t("editor.dialog.share_plio.title") }}
      </p>
      <!-- social sharing -->
      <div class="mt-2 my-4 flex space-x-4">
        <!-- whatsapp -->
        <icon-button
          :iconConfig="whatsAppDialogIconConfig"
          @click="shareOnWhatsApp"
          data-test="whatsapp"
        ></icon-button>

        <!-- twitter -->
        <icon-button
          :iconConfig="twitterDialogIconConfig"
          @click="shareOnTwitter"
          data-test="twitter"
        ></icon-button>
      </div>
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
          data-test="copy"
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { mapActions } from "vuex";
import { useToast } from "vue-toastification";

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
        // config for the icon of the close button
        enabled: true,
        iconName: "times-circle-solid",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      whatsAppDialogIconConfig: {
        // config for the icon of the whatsapp share button
        enabled: true,
        iconName: "whatsapp",
        iconClass: "text-primary fill-current h-12 w-12",
      },
      twitterDialogIconConfig: {
        // config for the icon of the twitter share button
        enabled: true,
        iconName: "twitter",
        iconClass: "text-primary fill-current h-12 w-12",
      },
      linkedinDialogIconConfig: {
        // config for the icon of the linkedin share button
        enabled: true,
        iconName: "linkedin",
        iconClass: "text-primary fill-current h-12 w-12",
      },
      facebookDialogIconConfig: {
        // config for the icon of the facebook share button
        enabled: true,
        iconName: "facebook",
        iconClass: "text-primary fill-current h-12 w-12",
      },
      // class for the close button
      closeDialogButtonClass: "bg-white w-10 h-10 p-2",
      plioLinkCopied: false, // whether the plio link has been copied or not
      toast: useToast(),
    };
  },
  computed: {
    socialSharingFormattedLink() {
      // plio link formatted to be shareable on social media
      return this.plioLink.replace("#", "%23");
    },
    socialSharingText() {
      // text to be used for sharing plio on social platforms
      return `${this.$t("generic.dialogs.share.message")}: ${
        this.socialSharingFormattedLink
      }`;
    },
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
    ...mapActions("generic", ["unsetSharePlioDialog"]),
    shareOnWhatsApp() {
      // share the plio link on whatsapp
      window.open("https://wa.me/send?text=" + this.socialSharingText).focus();
    },
    shareOnTwitter() {
      // share the plio link on twitter
      window
        .open("https://twitter.com/intent/tweet?text=" + this.socialSharingText)
        .focus();
    },
    closeSharePlioDialog() {
      // triggered on clicking the close button
      this.unsetSharePlioDialog();
      this.plioLinkCopied = false;
    },
    copyLinkToClipboard() {
      // triggered on clicking the copy link button
      // return if the link has already been copied
      if (this.plioLinkCopied) return;
      const success = GenericUtilities.copyToClipboard(this.plioLink);
      if (success) this.plioLinkCopied = true;
      else this.toast.error(this.$t("toast.error.copying"));
    },
  },
};
</script>
