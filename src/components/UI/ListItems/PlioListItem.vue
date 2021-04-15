<template>
  <PlioListItemSkeleton v-if="!isDataLoaded" />
  <div v-else class="rounded-sm p-2">
    <div class="grid grid-flow-row auto-rows-min gap-2">
      <!-- last updated date -->
      <div class="flex flex-row justify-start gap-3">
        <p class="text-xs place-self-center">{{ updatedAt }}</p>

        <!-- status badge -->
        <simple-badge
          :text="status"
          :badgeClass="statusBadgeClass"
          v-tooltip.top="statusBadgeTooltip"
        ></simple-badge>
      </div>

      <!-- plio title -->
      <div>
        <p class="text-l sm:text-xl font-bold w-64 sm:w-auto">{{ title }}</p>
      </div>

      <!-- plio link -->
      <div>
        <URL
          :link="plioLink"
          :urlStyleClass="urlStyleClass"
          :urlCopyButtonClass="urlCopyButtonClass"
        ></URL>
      </div>

      <!-- action buttons -->
      <div class="flex flex-row justify-start gap-3">
        <!-- play button -->
        <icon-button
          :titleConfig="playButtonTitleConfig"
          :iconConfig="playButtonIconConfig"
          :buttonClass="playButtonClass"
          @click="playPlio"
          :isDisabled="!isPublished"
          v-tooltip="playButtonTooltip"
        ></icon-button>

        <!-- edit button -->
        <icon-button
          :titleConfig="editButtonTitleConfig"
          :iconConfig="editButtonIconConfig"
          :buttonClass="editButtonClass"
          @click="editPlio"
        ></icon-button>

        <!-- duplicate button -->
        <icon-button
          :titleConfig="duplicateButtonTitleConfig"
          :iconConfig="duplicateButtonIconConfig"
          :buttonClass="duplicateButtonClass"
          @click="duplicatePlio"
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import URL from "@/components/UI/Text/URL.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import PlioListItemSkeleton from "@/components/UI/Skeletons/PlioListItemSkeleton.vue";
import { mapState } from "vuex";

export default {
  name: "PlioThumbnail",
  props: {
    plioId: {
      default: "",
      type: String,
    },
    org: {
      default: "",
      type: String,
    },
  },
  components: {
    URL,
    IconButton,
    SimpleBadge,
    PlioListItemSkeleton,
  },

  data() {
    return {
      plioDetails: {},
      playButtonTitleConfig: {
        value: "Play",
        class: "p-2 text-primary font-semibold",
      },
      playButtonIconConfig: {
        enabled: false,
        iconName: "",
        iconClass: "",
      },
      playButtonClass: "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10",

      editButtonTitleConfig: {
        value: "Edit",
        class: "p-2 text-primary font-semibold",
      },
      editButtonIconConfig: {
        enabled: false,
        iconName: "",
        iconClass: "",
      },
      editButtonClass: "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10",

      duplicateButtonTitleConfig: {
        value: "Duplicate",
        class: "p-2 text-primary font-semibold",
      },
      duplicateButtonIconConfig: {
        enabled: false,
        iconName: "",
        iconClass: "",
      },
      duplicateButtonClass: "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10",
      urlStyleClass: "text-xs font-bold text-yellow-600",
      urlCopyButtonClass: "text-yellow-600",
      isDataLoaded: false,
    };
  },

  async created() {
    this.isDataLoaded = false;
    await this.loadPlio();
  },

  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    playButtonTooltip() {
      return this.isPublished ? "Play this plio" : "Cannot play a draft plio";
    },
    isPublished() {
      return this.status == "published";
    },
    statusBadgeTooltip() {
      // tooltip for the status badge
      if (!this.isPublished)
        return "This plio is currently in draft mode and only accessible to you. To make it publicly accessible, publish the plio";
      return "This plio has been published and is publicly accessible";
    },
    statusBadgeClass() {
      // class for the status badge
      var badgeClass = {
        "text-green-500 border-green-500": this.isPublished,
        "border-black text-black": !this.isPublished,
        "text-xs": true,
        "px-2 py-1": true,
      };
      return badgeClass;
    },
    updatedAt() {
      return new Date(this.plioDetails.updated_at).toDateString();
    },
    status() {
      return this.plioDetails.status;
    },
    title() {
      return this.plioDetails.plioTitle;
    },
    plioLink() {
      // prepare the link for the plio from the plio ID
      if (this.plioId == "") {
        return "";
      }
      var baseURL = process.env.VUE_APP_FRONTEND + "/#";
      if (this.org != "") baseURL += "/" + this.org;
      return baseURL + "/play/" + this.plioId;
    },
  },

  methods: {
    async loadPlio() {
      await PlioAPIService.getPlio(this.plioId).then((plioDetails) => {
        this.isDataLoaded = true;
        this.plioDetails = plioDetails;
        this.$emit("fetched", this.plioDetails);
      });
    },
    playPlio() {
      this.$router.push({
        name: "Player",
        params: { plioId: this.plioId, org: this.activeWorkspace },
      });
    },
    editPlio() {
      this.$router.push({
        name: "Editor",
        params: { plioId: this.plioId, org: this.activeWorkspace },
      });
    },
    duplicatePlio() {},
  },
  emits: ["fetched"],
};
</script>
