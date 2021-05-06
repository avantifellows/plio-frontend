<template>
  <PlioListItemSkeleton v-if="pending" class="w-full" />
  <div v-else class="rounded-sm p-2 w-auto">
    <div class="grid grid-flow-row auto-rows-min gap-2">
      <!-- last updated date -->
      <div class="flex flex-row justify-start gap-3">
        <p class="text-xs place-self-center">{{ updatedAt }}</p>

        <!-- status badge -->
        <simple-badge
          :text="statusBadge"
          :badgeClass="statusBadgeClass"
          v-tooltip.top="statusBadgeTooltip"
        ></simple-badge>
      </div>

      <!-- plio title -->
      <div
        class="text-base sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold truncate"
        :class="{ 'opacity-50': isUntitled }"
      >
        {{ title }}
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
          v-tooltip="editButtonTooltip"
          @click="editPlio"
        ></icon-button>

        <!-- duplicate button -->
        <icon-button
          :titleConfig="duplicateButtonTitleConfig"
          :iconConfig="duplicateButtonIconConfig"
          :buttonClass="duplicateButtonClass"
          @click="duplicateThenRoute"
          v-tooltip="duplicateButtonTooltip"
        ></icon-button>
      </div>
    </div>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import URL from "@/components/UI/Text/URL.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import PlioListItemSkeleton from "@/components/UI/Skeletons/PlioListItemSkeleton.vue";
import { mapState, mapActions } from "vuex";

export default {
  name: "PlioThumbnail",
  props: {
    plioId: {
      // the id of the plio to render
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
      // button, icon config and styling classes
      plioDetails: {},
      playButtonIconConfig: {
        enabled: false,
        iconName: "",
        iconClass: "",
      },
      playButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      editButtonIconConfig: {
        enabled: false,
        iconName: "",
        iconClass: "",
      },
      editButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      duplicateButtonIconConfig: {
        enabled: false,
        iconName: "",
        iconClass: "",
      },
      duplicateButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      urlStyleClass: "text-sm font-bold text-yellow-600",
      urlCopyButtonClass: "text-yellow-600",
    };
  },

  async created() {
    // load the plio only if the plio id is not empty
    if (this.isPlioIdValid) await this.loadPlio();
  },

  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapState("sync", ["pending"]),
    ...mapState("plioItems", ["allPlioDetails"]),
    statusBadge() {
      // text for the status badge
      if (this.status == undefined) return null;
      return this.$t(`generic.status.${this.status}`);
    },
    playButtonTitleConfig() {
      // title config for the play button
      return {
        value: this.$t("home.table.plio_list_item.buttons.play"),
        class: "p-2 text-primary font-semibold",
      };
    },
    editButtonTitleConfig() {
      // title config for the play button
      return {
        value: this.$t("home.table.plio_list_item.buttons.edit"),
        class: "p-2 text-primary font-semibold",
      };
    },
    duplicateButtonTitleConfig() {
      // title config for the duplicate button
      return {
        value: this.$t("home.table.plio_list_item.buttons.duplicate"),
        class: "p-2 text-primary font-semibold",
      };
    },
    playButtonTooltip() {
      // tooltip for the play button
      if (!this.status) return "";
      return this.$t(`tooltip.home.table.plio_list_item.buttons.play.${this.status}`);
    },
    editButtonTooltip() {
      // tooltip for the edit button
      if (!this.status) return "";
      return this.$t("tooltip.home.table.plio_list_item.buttons.edit");
    },
    duplicateButtonTooltip() {
      // tooltip for the duplicate button
      if (!this.status) return "";
      return this.$t("tooltip.home.table.plio_list_item.buttons.duplicate");
    },
    isPublished() {
      // whether the plio was published
      return this.status == "published";
    },
    statusBadgeTooltip() {
      // tooltip for the status badge
      if (!this.isPublished) return this.$t("tooltip.editor.status.draft");
      return this.$t("tooltip.editor.status.published");
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
      // human readable date string
      return new Date(this.plioDetails.updated_at).toDateString();
    },
    status() {
      // status of the plio - draft or published
      return this.plioDetails.status;
    },
    title() {
      // title of the plio. "Untitled" if no title is present
      return (
        this.plioDetails.plioTitle ||
        this.$t("home.table.plio_list_item.empty_title_placeholder")
      );
    },
    plioLink() {
      // prepare the link for the plio from the plio ID
      if (this.plioId == "") {
        return "";
      }
      var baseURL = process.env.VUE_APP_FRONTEND + "/#";
      if (this.activeWorkspace != "") baseURL += "/" + this.activeWorkspace;
      return baseURL + "/play/" + this.plioId;
    },
    isUntitled() {
      // if the plio is untitled or not
      return !this.plioDetails.plioTitle;
    },
    isPlioIdValid() {
      return this.plioId != "";
    },
  },

  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    ...mapActions("plioItems", ["fetchPlio"]),
    async loadPlio() {
      this.startLoading();
      // fetch the details of the plio if they don't exist in the store
      if (!(this.plioId in this.allPlioDetails)) await this.fetchPlio(this.plioId);

      this.plioDetails = this.allPlioDetails[this.plioId];
      var dataToEmit = {
        status: this.status,
        updateAt: this.updatedAt,
        title: this.title,
        plioLink: this.plioLink,
      };

      this.$emit("fetched", dataToEmit);
      this.stopLoading();
    },
    playPlio() {
      // invoked when play button is clicked
      this.$router.push({
        name: "Player",
        params: { plioId: this.plioId, org: this.activeWorkspace },
      });
    },
    editPlio() {
      // invoked when edit button is clicked
      this.$router.push({
        name: "Editor",
        params: { plioId: this.plioId, org: this.activeWorkspace },
      });
    },
    async duplicatePlio() {
      // invoked when duplicate button is clicked

      // 1. Duplicate the plio, save the id of the duplicated plio
      // 2. Iterate through items and questions, duplicate each one of them
      // 3. Link the duplicated items and questions to the newly created plio

      this.startLoading();
      var newPlio = await PlioAPIService.duplicatePlio(this.plioId);
      var newPlioDBId = newPlio.data.id;

      await Promise.all(
        this.plioDetails.items.map(async (item) => {
          // duplicate item and update it to link the item to the plio
          var newItem = await ItemAPIService.duplicateItem(item.id, newPlioDBId);

          // duplicate question and update it to link the item to the question
          await QuestionAPIService.duplicateQuestion(item.details.id, newItem.data.id);
        })
      );
      return newPlio.data.uuid;
    },

    async duplicateThenRoute() {
      // duplicate the plio and when it's done, route to the editor
      await this.duplicatePlio().then((duplicatedPlioId) => {
        this.stopLoading();
        this.$router.push({
          name: "Editor",
          params: { plioId: duplicatedPlioId, org: this.activeWorkspace },
        });
      });
    },
  },
  emits: ["fetched"],
};
</script>
