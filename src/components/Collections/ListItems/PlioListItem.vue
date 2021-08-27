<template>
  <PlioListItemSkeleton v-if="pending" class="w-full" />
  <div v-else class="flex relative rounded-sm p-2 w-auto">
    <div class="grid grid-flow-row auto-rows-min gap-2 w-full">
      <!-- last updated date -->
      <div class="flex flex-row justify-start space-x-3">
        <p class="text-xs place-self-center">{{ updatedAt }}</p>

        <div class="flex relative">
          <!-- status badge -->
          <simple-badge
            :text="statusBadge"
            class="absolute"
            :badgeClass="statusBadgeClass"
            v-tooltip.top="statusBadgeTooltip"
          ></simple-badge>

          <simple-badge
            text="published"
            class="invisible"
            :badgeClass="statusBadgeClass"
            v-tooltip.top="statusBadgeTooltip"
          ></simple-badge>
        </div>

        <OptionDropdown
        :options="plioActionOptions"
        :scrollY="scrollY"
        class="flex-grow flex relative justify-end sm:justify-start"
        @select="runAction"
      ></OptionDropdown>
      </div>

      <!-- plio title -->
      <div
        class="text-base sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold truncate"
        :class="{ 'opacity-50': isUntitled }"
      >
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import Utilities from "@/services/Functional/Utilities.js";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import OptionDropdown from "@/components/App/OptionDropdown.vue";
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
    showActionsByDefault: {
      // whether to show the action buttons by default
      // on smaller screen sizes
      type: Boolean,
      default: false,
    },
  },
  components: {
    SimpleBadge,
    PlioListItemSkeleton,
    OptionDropdown
  },

  data() {
    return {
      // button, icon config and styling classes
      plioDetails: {},
      actionButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      urlCopyButtonClass: "text-yellow-600",
      showActionButtons: true, // whether to show the action buttons
      // whether the visibility of the action buttons has been manually set
      hasUserSetActionVisibility: false,
      scrollY: window.scrollY
    };
  },
  async created() {
    // load the plio only if the plio id is not empty
    if (this.isPlioIdValid) await this.loadPlio();

    // determine the screen orientation when the list item is created
    this.checkScreenOrientation();
    // add listener for screen size being changed
    window.addEventListener("resize", this.checkScreenOrientation);

    window.addEventListener('scroll', this.handleScroll);
  },
  unmounted() {
    // remove listeners
    window.removeEventListener("resize", this.checkScreenOrientation);

    window.removeEventListener('scroll', this.handleScroll);
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapState("sync", ["pending"]),
    ...mapState("plioItems", ["allPlioDetails"]),
    toggleIconClass() {
      return [
        { "transform rotate-180": this.showActionButtons },
        "transition ease duration-800",
      ];
    },

    plioActionOptions() {
      let options = [
        {
          value: "edit",
          label: this.$t("home.table.plio_list_item.buttons.edit"),
          icon: "edit.svg",
        },
        {
          value: "play",
          label: this.$t("home.table.plio_list_item.buttons.play"),
          icon: "play.svg",
        },
        {
          value: "share",
          label: this.$t("home.table.plio_list_item.buttons.share"),
          icon: "share.svg",
        },
        {
          value: "duplicate",
          label: this.$t("home.table.plio_list_item.buttons.duplicate"),
          icon: "copy.svg",
        },
      ]
      if (this.isTouchDevice) {
        options.push({
          value: "analyse",
          label: this.$t("home.table.plio_list_item.buttons.analyse"),
          icon: "analyze.svg",
        })
      }
      return options
    },
    isTouchDevice() {
      // detects if the user's device has a touch screen or not
      return window.matchMedia("(any-pointer: coarse)").matches;
    },
    statusBadge() {
      // text for the status badge
      if (this.status == undefined) return null;
      return this.$t(`generic.status.${this.status}`);
    },
    shareButtonTitleConfig() {
      // title config for the share button
      return {
        value: this.$t("home.table.plio_list_item.buttons.share"),
        class:
          "p-2 text-sm bp-500:text-base text-primary font-medium bp-500:font-semibold",
      };
    },
    playButtonTitleConfig() {
      // title config for the play button
      return {
        value: this.$t("home.table.plio_list_item.buttons.play"),
        class:
          "p-2 text-sm bp-500:text-base text-primary font-medium bp-500:font-semibold",
      };
    },
    editButtonTitleConfig() {
      // title config for the play button
      return {
        value: this.$t("home.table.plio_list_item.buttons.edit"),
        class:
          "p-2 text-sm bp-500:text-base text-primary font-medium bp-500:font-semibold",
      };
    },
    duplicateButtonTitleConfig() {
      // title config for the duplicate button
      return {
        value: this.$t("home.table.plio_list_item.buttons.duplicate"),
        class:
          "p-2 text-sm bp-500:text-base text-primary font-medium bp-500:font-semibold",
      };
    },
    analyseButtonTitleConfig() {
      // title config for the analyse button
      return {
        value: this.$t("home.table.plio_list_item.buttons.analyse"),
        class:
          "p-2 text-sm bp-500:text-base text-primary font-medium bp-500:font-semibold",
      };
    },
    playButtonTooltip() {
      // tooltip for the play button
      if (!this.status) return "";
      return this.$t(`tooltip.home.table.plio_list_item.buttons.play.${this.status}`);
    },
    shareButtonTooltip() {
      // tooltip for the play button
      if (!this.status) return "";
      return this.$t(`tooltip.home.table.plio_list_item.buttons.share.${this.status}`);
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
    analyseButtonTooltip() {
      // tooltip for the analyse button
      if (!this.isPublished)
        return this.$t(`tooltip.home.table.buttons.analyse_plio.disabled`);
      return this.$t(`tooltip.home.table.buttons.analyse_plio.enabled`);
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
      return new Date(this.plioDetails.updatedAt).toDateString();
    },
    status() {
      // status of the plio - draft or published
      return this.plioDetails.status;
    },
    title() {
      // title of the plio. "Untitled" if no title is present
      return (
        this.plioDetails.plioTitle ||
        this.$t("generic.placeholders.empty_title_placeholder")
      );
    },
    plioLink() {
      // prepare the link for the plio from the plio ID
      return this.getPlioLink(this.plioId, this.activeWorkspace);
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
    ...mapActions("generic", ["showSharePlioDialog"]),
    ...Utilities,
    runAction(_, action) {
      // invoked when one of the action buttons is clicked
      switch(action) {
        case "play":
          this.playPlio()
          break
        case "edit":
          this.editPlio()
          break
        case "share":
          this.sharePlio()
          break
        case "duplicate":
          this.duplicateThenRoute()
          break
        case "analyse":
          this.analysePlio()
          break
      }
    },
    toggleActionButtonVisibility() {
      // toggles the visibility of the action buttons
      this.showActionButtons = !this.showActionButtons;
      this.hasUserSetActionVisibility = true;
    },
    handleScroll() {
      this.scrollY = window.scrollY
    },

    checkScreenOrientation() {
      var screenWidth = screen.availWidth;
      // always show action buttons if screen-width >= 420
      if (screenWidth >= 420) this.showActionButtons = true;
      // always hide action buttons if screen-width < 420 if their visibility
      // has not been manually set
      if (
        screenWidth < 420 &&
        !this.hasUserSetActionVisibility &&
        !this.showActionsByDefault
      )
        this.showActionButtons = false;
    },
    async loadPlio() {
      this.startLoading();
      // fetch the details of the plio if they don't exist in the store
      if (!(this.plioId in this.allPlioDetails)) await this.fetchPlio(this.plioId);

      this.plioDetails = this.allPlioDetails[this.plioId];
      var dataToEmit = {
        status: this.status,
        title: this.title,
      };

      this.$emit("fetched", dataToEmit);
      this.stopLoading();
    },
    sharePlio() {
      // invoked when share button is clicked
      this.showSharePlioDialog(this.plioLink);
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

      this.$Progress.start();
      this.$mixpanel.track("Click Duplicate", {
        "Plio UUID": this.plioId,
        "Plio Status": this.status,
      });
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
        this.$Progress.finish();
        this.$router.push({
          name: "Editor",
          params: { plioId: duplicatedPlioId, org: this.activeWorkspace },
        });
      });
    },

    analysePlio() {
      // redirects to the dashboard page for the selected plio
      this.$router.push({
        name: "Dashboard",
        params: { plioId: this.plioId, org: this.activeWorkspace },
      });
    },
  },
  emits: ["fetched"],
};
</script>
