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
      <!-- social sharing -->
      <div class="mt-2 my-4 flex space-x-4">
        <!-- whatsapp -->
        <icon-button
          :iconConfig="whatsAppDialogIconConfig"
          @click="shareOnWhatsApp"
        ></icon-button>

        <!-- twitter -->
        <icon-button
          :iconConfig="twitterDialogIconConfig"
          @click="shareOnTwitter"
        ></icon-button>

        <!-- facebook -->
        <icon-button
          :iconConfig="facebookDialogIconConfig"
          @click="shareOnFacebook"
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
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import Utilities from "@/services/Functional/Utilities.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { mapActions } from "vuex";

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
    };
  },
  computed: {
    socialSharingFormattedLink() {
      // plio link formatted to be shareable on social media
      return this.plioLink.replace("#", "%23");
    },
    plioLinkValidated() {
      // formats the plio link as a valid url
      // using localhost:8080 makes a url invalid for facebook and linkedin
      // this is a hack to ensure that this functionality does not break while testing locally
      if (this.plioLink.includes("localhost"))
        return this.plioLink.replace("localhost:8080", "staging-app.plio.in");
      return this.plioLink;
    },
    socialSharingText() {
      // text to be used for sharing plio on social platforms
      return `Check out my new plio: ${this.socialSharingFormattedLink}`;
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
    ...Utilities,
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
    shareOnFacebook() {
      // share the plio link on facebook
      window
        .open("https://www.facebook.com/sharer/sharer.php?u=" + this.plioLinkValidated)
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

      var success = this.copyToClipboard(this.plioLink);

      if (success) this.plioLinkCopied = true;
      else this.toast.error(this.$t("error.copying"));
    },
  },
};
</script>
