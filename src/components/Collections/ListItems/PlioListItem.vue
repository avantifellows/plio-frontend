<template>
  <PlioListItemSkeleton v-if="pending" class="w-full" />
  <div v-else class="flex relative rounded-sm p-2 w-auto">
    <div class="grid grid-flow-row auto-rows-min gap-2 w-full">
      <!-- last updated date -->
      <div class="flex flex-row justify-start space-x-3">
        <p class="text-xs place-self-center">{{ updatedAt }}</p>

        <div class="flex relative place-self-center">
          <!-- status badge -->
          <simple-badge
            :text="statusBadge"
            class="absolute"
            :badgeClass="statusBadgeClass"
            v-tooltip="statusBadgeTooltip"
          ></simple-badge>

          <!--
            dummy badge to ensure that the dropdown button
            is placed at the same spot for both draft and published plios
          -->
          <simple-badge
            :text="$t(`generic.status.published`)"
            class="invisible"
            :badgeClass="statusBadgeClass"
            v-tooltip="statusBadgeTooltip"
          ></simple-badge>
        </div>

        <!-- the dropdown containing the action buttons -->
        <OptionDropdown
          :options="plioActionOptions"
          :scrollY="scrollY"
          :overflowMarginTop="optionsOverflowMarginTop"
          class="flex-grow flex justify-end sm:justify-start"
          @select="runAction"
          data-test="optionDropdown"
        ></OptionDropdown>
      </div>

      <div class="flex space-x-4 truncate">
        <!-- thumbnail -->
        <inline-svg
          :src="thumbnail"
          v-if="!isVideoIdValid"
          class="fill-current text-gray-400"
          :class="thumbnailClasses"
          data-test="defaultThumbnail"
        ></inline-svg>

        <img
          v-else
          :src="thumbnail"
          :class="thumbnailClasses"
          class="rounded-md"
          alt="Video thumbnail"
          data-test="videoThumbnail"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />

        <!-- plio title -->
        <div
          class="text-base sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold truncate flex items-center"
          :class="{ 'opacity-50': isUntitled }"
        >
          {{ title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import OptionDropdown from "@/components/UI/Selectors/OptionDropdown.vue";
import PlioListItemSkeleton from "@/components/UI/Skeletons/PlioListItemSkeleton.vue";
import { mapState, mapGetters, mapActions } from "vuex";
import { useToast } from "vue-toastification";

export default {
  name: "PlioListItem",
  props: {
    plioDetails: {
      default: () => {},
      type: Object,
    },
  },
  components: {
    SimpleBadge,
    PlioListItemSkeleton,
    OptionDropdown,
  },

  data() {
    return {
      // button, icon config and styling classes
      actionButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      urlCopyButtonClass: "text-yellow-600",
      scrollY: window.scrollY, // the number of pixels scrolled vertically
      toast: useToast(), // toast component
      optionsOverflowMarginTop: -14, // margin to be set from the top when the options would overflow from the screen
      thumbnailClasses: "h-12 w-16 bp-500:h-14 bp-500:w-18 md:h-16 md:w-20",
    };
  },
  async created() {
    // add listener for resize
    window.addEventListener("resize", this.handleResize);

    // add listener for scrolling
    window.addEventListener("scroll", this.handleScroll);

    this.setOptionsOverflowMarginTop();

    this.$nextTick(() => {
      // wait for the DOM to be updated
      if (this.updatedAt != "") {
        // only consider the plio loaded if the data is valid
        this.$emit("loaded");
      }
    });
  },
  unmounted() {
    // remove listeners
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapGetters("auth", [
      "isPersonalWorkspace",
      "hasWorkspaces",
      "workspaces",
      "activeWorkspaceDetails",
    ]),
    ...mapState("sync", ["pending"]),
    ...mapState("generic", ["selectedPlioId"]),
    ...mapGetters("generic", ["isTabScreen"]),
    ...mapState("dialog", {
      isDialogBoxShown: "isShown",
      dialogAction: "action",
      isDialogConfirmClicked: "isConfirmClicked",
      isDialogCancelClicked: "isCancelClicked",
    }),

    thumbnail() {
      if (this.isVideoIdValid) {
        return VideoFunctionalService.getYouTubeVideoThumbnailURL(this.videoId);
      }
      return require("@/assets/images/video-thumbnail.svg");
    },

    isVideoIdValid() {
      return this.videoId != "";
    },

    videoId() {
      if (this.plioDetails != undefined && this.plioDetails.video_url != null)
        return VideoFunctionalService.getYouTubeVideoIdfromURL(
          this.plioDetails.video_url
        );
      return "";
    },

    plioId() {
      if (this.plioDetails != undefined && "uuid" in this.plioDetails)
        return this.plioDetails["uuid"];
      return "";
    },

    /** whether the user is in the personal workspace while having other workspaces as well */
    inPersonalWorkspaceWithOtherWorkspaces() {
      return this.isPersonalWorkspace && this.hasWorkspaces;
    },

    /** the list of action buttons */
    plioActionOptions() {
      // when adding a new option to this list, make sure to update the
      // values in setOptionsOverflowMarginTop
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
          disabled: !this.isPublished,
        },
        {
          value: "share",
          label: this.$t("home.table.plio_list_item.buttons.share"),
          icon: "share.svg",
          disabled: !this.isPublished,
        },
        {
          value: "embed",
          label: this.$t("home.table.plio_list_item.buttons.embed"),
          icon: "code-braces.svg",
          disabled: !this.isPublished,
        },
        {
          value: "analyse",
          label: this.$t("home.table.plio_list_item.buttons.analyse"),
          icon: "analyze.svg",
          disabled: !this.isPublished,
        },
        {
          value: "duplicate",
          label: this.$t("home.table.plio_list_item.buttons.duplicate"),
          icon: "copy.svg",
        },
        {
          value: "delete",
          label: this.$t("home.table.plio_list_item.buttons.delete"),
          icon: "delete2.svg",
        },
      ];

      // now we allow people to copy plios from one workspace to another, given they are part of those workspaces
      // if (this.inPersonalWorkspaceWithOtherWorkspaces)
      options.push({
        value: "copy",
        label: this.$t("home.table.plio_list_item.buttons.copy"),
        icon: "move.svg",
      });
      return options;
    },
    statusBadge() {
      if (this.status == undefined) return null;
      return this.$t(`generic.status.${this.status}`);
    },
    isPublished() {
      return this.status == "published";
    },
    statusBadgeTooltip() {
      if (!this.isPublished) return this.$t("tooltip.editor.status.draft");
      return this.$t("tooltip.editor.status.published");
    },
    statusBadgeClass() {
      return {
        "text-green-700 border-green-700": this.isPublished,
        "border-black text-black": !this.isPublished,
        "text-xs": true,
        "px-2 py-1": true,
      };
    },
    /**
     * human readable date string
     * format: month (3-letter) day year
     */
    updatedAt() {
      if (this.plioDetails != undefined && "updated_at" in this.plioDetails)
        return new Date(this.plioDetails.updated_at).toDateString().slice(4);
      return "";
    },
    status() {
      if (this.plioDetails != undefined) return this.plioDetails.status;
      return "";
    },
    /** title of the plio. "Untitled" if no title is present */
    title() {
      if (this.plioDetails != undefined)
        return (
          this.plioDetails.name ||
          this.$t("generic.placeholders.empty_title_placeholder")
        );
      return "";
    },
    /** link to the player for a plio */
    plioLink() {
      if (this.plioId != "")
        return GenericUtilities.getPlioLink(this.plioId, this.activeWorkspace);
      return "";
    },
    /** whether the plio does not have a title */
    isUntitled() {
      return (
        this.title == this.$t("generic.placeholders.empty_title_placeholder")
      );
    },
  },

  watch: {
    isDialogConfirmClicked(value) {
      if (value) {
        switch (this.dialogAction) {
          case "deletePlio":
            this.deletePlio();
            break;
          default:
            // this watch will be triggered whenever the confirm button
            // of the shared dialog box will be clicked
            // returning here so that it doesn't interfere with the
            // confirmation step of a different dialogAction triggered
            // by a different component
            return;
        }
        this.unsetConfirmClicked();
        // if any of the cases above creates a new dialog box
        // with a new dialogAction, we do not want to unset it
        if (!this.isDialogBoxShown) this.unsetDialogAction();
      }
    },
    isDialogCancelClicked(value) {
      if (value) {
        switch (this.dialogAction) {
          case "deletePlio":
            break;
          default:
            // this watch will be triggered whenever the cancel button
            // of the shared dialog box will be clicked
            // returning here so that it doesn't interfere with the
            // cancellation step of a different dialogAction triggered
            // by a different component
            return;
        }
        this.unsetCancelClicked();
        // if any of the cases above creates a new dialog box
        // with a new dialogAction, we do not want to unset it
        if (!this.isDialogBoxShown) this.unsetDialogAction();
      }
    },
  },

  methods: {
    ...mapActions("generic", [
      "showSharePlioDialog",
      "showEmbedPlioDialog",
      "showSpinner",
      "hideSpinner",
      "setSelectedPlioId",
      "setSelectedPlioDetails",
    ]),
    ...mapActions("dialog", [
      "showDialogBox",
      "setDialogTitle",
      "setDialogDescription",
      "setConfirmButtonConfig",
      "setCancelButtonConfig",
      "setDialogAction",
      "unsetDialogAction",
      "unsetConfirmClicked",
      "unsetCancelClicked",
    ]),
    ...mapActions("selectors", ["showSelector"]),
    /**
     * sets various attributes based on the screen size
     */
    handleResize() {
      this.setOptionsOverflowMarginTop();
    },
    /**
     * set the default value of margin-top for the options container
     * for the condition when the container overflows from the bottom
     * of the screen.
     *
     * there are 3 conditions which require different values for the margin top:
     * 1. not a touch screen device
     * 2. touch screen device with screen width < 640
     * 3. touch screen device with screen width >= 640
     */
    setOptionsOverflowMarginTop() {
      if (this.isTabScreen) this.optionsOverflowMarginTop = -18;
      else this.optionsOverflowMarginTop = -16;

      if (this.inPersonalWorkspaceWithOtherWorkspaces)
        this.optionsOverflowMarginTop -= 2;
    },
    async runAction(_, action) {
      // invoked when one of the action buttons is clicked
      switch (action) {
        case "play":
          this.playPlio();
          break;
        case "edit":
          this.editPlio();
          break;
        case "share":
          this.sharePlio();
          break;
        case "embed":
          this.embedPlio();
          break;
        case "duplicate":
          this.duplicateThenRoute();
          break;
        case "analyse":
          this.analysePlio();
          break;
        case "delete":
          // configure the dialog box
          this.setDialogTitle(
            this.$t("home.table.plio_list_item.dialog.delete.title")
          );
          this.setDialogDescription(
            this.$t("home.table.plio_list_item.dialog.delete.description")
          );
          this.setConfirmButtonConfig({
            enabled: true,
            text: this.$t("generic.yes"),
            class:
              "bg-white hover:bg-gray-100 focus:outline-none focus:ring-0 text-primary",
          });
          this.setCancelButtonConfig({
            enabled: true,
            text: this.$t("generic.no"),
            class:
              "bg-primary hover:bg-primary-hover focus:outline-none text-white",
          });
          // show the dialog box
          this.showDialogBox();
          this.setDialogAction("deletePlio");
          await this.setSelectedPlioId(this.plioId);
          break;
        case "copy": {
          let selectorOptions = [];
          this.workspaces.forEach((workspace) => {
            if (workspace.shortcode != this.activeWorkspaceDetails.shortcode) {
              selectorOptions.push({
                value: workspace.shortcode,
                label: workspace.name,
              });
            }
          });
          await this.setSelectedPlioId(this.plioId);
          this.showSelector({
            type: "single",
            options: selectorOptions,
            title: this.$t(
              "home.table.plio_list_item.selectors.copy_to_workspace.title"
            ),
            info: this.$t(
              "home.table.plio_list_item.selectors.copy_to_workspace.info"
            ),
          });
          break;
        }
      }
    },
    handleScroll() {
      // handles all scrolling events
      this.scrollY = window.scrollY;
    },
    sharePlio() {
      // show the dialog containing the plio link to be shared
      this.showSharePlioDialog(this.plioLink);
    },
    embedPlio() {
      // show the dialog containing the code to embed plio
      this.showEmbedPlioDialog(this.plioId);
    },
    playPlio() {
      // invoked when play button is clicked
      let routeData = this.$router.resolve({
        name: "Player",
        params: { workspace: this.activeWorkspace, plioId: this.plioId },
      });
      // required for opening in a new tab
      window.open(routeData.href, "_blank");
    },
    editPlio() {
      // invoked when edit button is clicked
      this.$router.push({
        name: "Editor",
        params: { plioId: this.plioId, workspace: this.activeWorkspace },
      });
    },
    /**
     * deletes the selected plio
     */
    deletePlio() {
      this.showSpinner();
      // using selectedPlioId here instead of plioId because
      // the watcher that calls this function always runs on the
      // last plio in the list of plios
      PlioAPIService.deletePlio(this.selectedPlioId)
        .then(() => {
          this.hideSpinner();
          // notify of success
          this.toast.success(
            this.$t("toast.home.table.plio_list_item.delete.success")
          );
          this.$emit("deleted");
        })
        .catch(() => {
          // restore background
          this.hideSpinner();
          // notify of error
          this.toast.error(
            this.$t("toast.home.table.plio_list_item.delete.error")
          );
        });
    },
    /**
     * Duplicates the current plio in the following sequence:
     * 1. Duplicate the plio details, save the id of the duplicated plio
     * 2. Iterate through items and questions, duplicate each one of them
     * 3. Link the duplicated items and questions to the newly created plio
     */
    async duplicatePlio() {
      this.$Progress.start();
      this.$mixpanel.track("Click Duplicate", {
        "Plio UUID": this.plioId,
        "Plio Status": this.status,
      });
      let newPlio = await PlioAPIService.duplicatePlio(this.plioId);
      return newPlio.data.uuid;
    },

    async duplicateThenRoute() {
      // duplicate the plio and when it is done, route to the editor
      await this.duplicatePlio().then((duplicatedPlioId) => {
        this.$Progress.finish();
        this.$router.push({
          name: "Editor",
          params: { plioId: duplicatedPlioId, workspace: this.activeWorkspace },
        });
      });
    },

    analysePlio() {
      // redirects to the dashboard page for the selected plio
      this.$router.push({
        name: "Dashboard",
        params: { plioId: this.plioId, workspace: this.activeWorkspace },
      });
    },
  },
  emits: ["deleted", "loaded"],
};
</script>
