<template>
  <div
    class="fixed bg-white mx-2 sm:mx-0 bp-420:w-11/12 md:w-2/3 lg:w-1/2 rounded-lg flex flex-col border border-gray-700 shadow-lg"
    :class="embedDialogClass"
    v-click-away="closeEmbedPlioDialog"
    data-test="embedDialog"
  >
    <div class="w-full flex justify-end p-2">
      <!-- close button -->
      <icon-button
        :iconConfig="closeDialogIconConfig"
        :buttonClass="closeDialogButtonClass"
        @click="closeEmbedPlioDialog"
        data-test="closeEmbedPlioDialog"
      ></icon-button>
    </div>

    <div class="px-4 bp-420:px-6 bp-500:px-8 pb-8">
      <!-- title -->
      <p
        class="text-xl bp-500:text-2xl text-gray-500 font-bold w-56 sm:w-80"
        data-test="title"
      >
        {{ $t("editor.dialog.embed_plio.title") }}
      </p>
      <!-- embed code without sso -->
      <div class="my-4" :class="embedCodeContainerClass" data-test="embedCodeNoSSO">
        <!-- without sso title -->
        <p v-if="!isPersonalWorkspace" :class="embedCodeTitleClass" data-test="heading">
          {{ $t("editor.dialog.embed_plio.headings.without_sso") }}
        </p>
        <div :class="embedCodeBoxClass">
          <!-- link -->
          <p :class="embedCodeValueClass">
            {{ embedCode }}
          </p>
          <!-- copy link button -->
          <icon-button
            :titleConfig="copyEmbedCodeWithoutSSOTitleClass"
            :buttonClass="copyEmbedCodeWithoutSSOButtonClass"
            @click="copyEmbedCode(false, embedCode)"
            data-test="copyEmbedCodeWithoutSSOButton"
          ></icon-button>
        </div>
      </div>

      <!-- embed code with sso -->
      <div
        class="my-4"
        :class="embedCodeContainerClass"
        v-if="!isPersonalWorkspace"
        data-test="embedCodeWithSSO"
      >
        <!-- with sso title -->
        <p :class="embedCodeTitleClass">
          {{ $t("editor.dialog.embed_plio.headings.with_sso") }}
        </p>
        <div :class="embedCodeBoxClass">
          <!-- link -->
          <p :class="embedCodeValueClass">
            {{ embedCodeSSO }}
          </p>
          <!-- copy link button -->
          <icon-button
            :titleConfig="copyEmbedCodeWithSSOTitleClass"
            :buttonClass="copyEmbedCodeWithSSOButtonClass"
            @click="copyEmbedCode(true, embedCodeSSO)"
            data-test="copyEmbedCodeWithSSOButton"
          ></icon-button>
        </div>
      </div>

      <!-- info on receiving data from embeds -->
      <div
        class="w-full p-4 sm:p-2 rounded-md border border-yellow-400 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
      >
        <!-- icon -->
        <inline-svg
          :src="getImageSource('exclamation-circle-solid.svg')"
          class="w-6 sm:w-1/4 md:w-1/5 xl:w-1/6 h-6 text-yellow-600 fill-current place-self-center"
        ></inline-svg>
        <!-- text -->
        <p class="text-yellow-600 text-sm">
          {{ embedPlioReceiveDataInfo.start }}
          <a :href="embedPlioDataInfoLink" target="_blank" class="font-bold underline">{{
            embedPlioReceiveDataInfo.link
          }}</a>
          {{ embedPlioReceiveDataInfo.end }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import Utilities from "@/services/Functional/Utilities.js";
import { useToast } from "vue-toastification";

export default {
  name: "EmbedPlioDialog",
  components: {
    IconButton,
  },
  props: {
    plioId: {
      default: "",
      type: String,
    },
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
      // config for the copy status of the embed codes
      plioEmbedCodeCopyConfig: {
        copied: false,
        sso: false,
      },
      toast: useToast(), // use the toast component
      // class for the heading of the embed code
      embedCodeTitleClass: "text-sm",
      // class for the value of the embed code
      embedCodeValueClass:
        "w-full break-all place-self-center text-sm bp-500:text-base text-gray-600",
      // class for the box containing the embed code
      embedCodeBoxClass:
        "flex flex-col items-center bp-500:flex-row space-y-2 bp-500:space-y-0 bp-500:space-x-4 p-2 px-4 bg-peach-light border border-gray-600 rounded-md",
    };
  },
  methods: {
    ...mapActions("generic", ["unsetEmbedPlioDialog"]),
    ...Utilities,
    /**
     * closes the embed plio dialog
     */
    closeEmbedPlioDialog() {
      this.unsetEmbedPlioDialog();
      this.resetEmbedCodeCopyConfig();
    },
    /**
     * class for the text inside the copy buttons of the embed plio dialog box
     *
     * @param {Boolean} copied whether the text to be copied has been copied
     *
     */
    getCopyButtonTitleClass(copied = false) {
      return {
        value: copied
          ? this.$t(`editor.dialog.embed_plio.buttons.copy_link.copied`)
          : this.$t("editor.dialog.embed_plio.buttons.copy_link.not_copied"),
        class: "text-white",
      };
    },
    /**
     * class for the copy buttons of the embed plio dialog box
     *
     * @param {Boolean} copied whether the text to be copied has been copied
     *
     */
    getCopyButtonClass(copied = false) {
      return [
        {
          "bg-primary hover:bg-primary-hover": !copied,
          "bg-green-500 hover:bg-green-600": copied,
        },
        `p-2 px-4 rounded-md mt-2 sm:mt-0 h-full w-full bp-500:w-auto`,
      ];
    },
    /**
     * copies the embed code with/without sso
     *
     * @param {Boolean} sso whether the code to be copied has SSO params
     * @param {String} codeToCopy the actual code that needs to be copied
     */
    copyEmbedCode(sso, codeToCopy) {
      // return if the link has already been copied
      if (
        (!sso && this.isPlioEmbedCodeWithoutSSOCopied) ||
        (sso && this.isPlioEmbedCodeWithSSOCopied)
      )
        return;
      const success = this.copyToClipboard(codeToCopy);

      if (success) {
        this.plioEmbedCodeCopyConfig.copied = true;
        this.plioEmbedCodeCopyConfig.sso = sso;
      } else this.toast.error(this.$t("error.copying"));
    },
    /**
     * resets the config of the embed codes being copied
     */
    resetEmbedCodeCopyConfig() {
      this.plioEmbedCodeCopyConfig.copied = false;
      this.plioEmbedCodeCopyConfig.sso = false;
    },
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapGetters("auth", ["activeWorkspaceApiKey", "isPersonalWorkspace"]),
    embedDialogClass() {
      // class for the dialog box showing the embed codes
      return {
        "top-1/6": this.isPersonalWorkspace,
        "top-1/100 xsm:top-1/20 bp-500:top-1/6": !this.isPersonalWorkspace,
      };
    },
    isPlioEmbedCodeWithoutSSOCopied() {
      // whether the plio embed code without sso has been copied or not
      return !this.plioEmbedCodeCopyConfig.sso && this.plioEmbedCodeCopyConfig.copied;
    },

    isPlioEmbedCodeWithSSOCopied() {
      // whether the plio embed code with sso has been copied or not
      return this.plioEmbedCodeCopyConfig.sso && this.plioEmbedCodeCopyConfig.copied;
    },
    embedCode() {
      // code to be copied for embedding the plio
      return this.getEmbedCode(this.plioId, this.activeWorkspace);
    },
    embedCodeSSO() {
      // code to be copied for embedding the plio with SSO
      return this.getEmbedCode(
        this.plioId,
        this.activeWorkspace,
        true,
        this.activeWorkspaceApiKey
      );
    },
    embedCodeContainerClass() {
      // class for the container within the dialog box containing the embed code
      return {
        "flex flex-col space-y-2": !this.isPersonalWorkspace,
      };
    },
    embedPlioDataInfoLink() {
      // the link to be used in the informational text shown for embedding plios
      if (this.isPersonalWorkspace) {
        // redirect to the form to apply for an organizational workspace
        return "https://docs.google.com/forms/d/e/1FAIpQLSdSq3KZOTEAnNsE5BfRPNPpmROQQ3gPFYJS8xJ9RB2j5LsAQQ/viewform";
      }
      // redirect to the section in the docs explaining how to receive data from embedded plio
      return "https://docs.plio.in/plio-for-teams/#receiving-data-from-embedded-plio";
    },
    embedPlioReceiveDataInfo() {
      // the informational text to be shown in the dialog box for embedding plio
      if (this.isPersonalWorkspace) {
        return {
          start: this.$t("editor.dialog.embed_plio.info.embed_data.personal_workspace.1"),
          link: this.$t("editor.dialog.embed_plio.info.embed_data.personal_workspace.2"),
          end: this.$t("editor.dialog.embed_plio.info.embed_data.personal_workspace.3"),
        };
      }
      return {
        start: this.$t("editor.dialog.embed_plio.info.embed_data.org_workspace.1"),
        link: this.$t("editor.dialog.embed_plio.info.embed_data.org_workspace.2"),
        end: this.$t("editor.dialog.embed_plio.info.embed_data.org_workspace.3"),
      };
    },
    copyEmbedCodeWithoutSSOButtonClass() {
      // class for the copy embed code without sso button
      return this.getCopyButtonClass(this.isPlioEmbedCodeWithoutSSOCopied);
    },
    copyEmbedCodeWithoutSSOTitleClass() {
      // class for the title of the copy embed code without sso button
      return this.getCopyButtonTitleClass(this.isPlioEmbedCodeWithoutSSOCopied);
    },
    copyEmbedCodeWithSSOButtonClass() {
      // class for the copy embed code with sso button
      return this.getCopyButtonClass(this.isPlioEmbedCodeWithSSOCopied);
    },
    copyEmbedCodeWithSSOTitleClass() {
      // class for the title of the copy embed code with sso button
      return this.getCopyButtonTitleClass(this.isPlioEmbedCodeWithSSOCopied);
    },
  },
};
</script>
