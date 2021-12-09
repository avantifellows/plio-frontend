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
import OptionDropdown from "@/components/UI/DropDownMenu/OptionDropdown.vue";
import PlioListItemSkeleton from "@/components/UI/Skeletons/PlioListItemSkeleton.vue";
import { mapState, mapGetters, mapActions } from "vuex";
import { useToast } from "vue-toastification";

export default {
  name: "PlioThumbnail",
  props: {
    plioId: {
      default: "",
      type: String,
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
      plioDetails: {},
      actionButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      urlCopyButtonClass: "text-yellow-600",
      scrollY: window.scrollY, // the number of pixels scrolled vertically
      toast: useToast(), // toast component
      optionsOverflowMarginTop: -14, // margin to be set from the top when the options would overflow from the screen
    };
  },
  async created() {
    // load the plio only if the plio id is not empty
    if (this.isPlioIdValid) await this.loadPlio();

    this.$nextTick(() => {
      // wait for the DOM to be updated
      if (this.plioDetails.updatedAt != undefined) {
        // only consider the plio loaded if the data is valid
        this.$emit("fetched", {
          status: this.status,
          title: this.title,
        });
      }
    });

    // add listener for resize
    window.addEventListener("resize", this.handleResize);

    // add listener for scrolling
    window.addEventListener("scroll", this.handleScroll);

    this.setOptionsOverflowMarginTop();
  },
  unmounted() {
    // remove listeners
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapState("sync", ["pending"]),
    ...mapState("generic", ["selectedPlioId"]),
    ...mapState("plioItems", ["allPlioDetails"]),
    ...mapGetters("generic", ["isTabScreen"]),
    ...mapState("dialog", {
      isDialogBoxShown: "isShown",
      dialogAction: "action",
      isDialogConfirmClicked: "isConfirmClicked",
      isDialogCancelClicked: "isCancelClicked",
    }),

    plioActionOptions() {
      // the list of action buttons
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
      return options;
    },
    statusBadge() {
      // text for the status badge
      if (this.status == undefined) return null;
      return this.$t(`generic.status.${this.status}`);
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
        "text-green-700 border-green-700": this.isPublished,
        "border-black text-black": !this.isPublished,
        "text-xs": true,
        "px-2 py-1": true,
      };
      return badgeClass;
    },
    updatedAt() {
      // human readable date string
      // format: month (3-letter) day year
      return new Date(this.plioDetails.updatedAt).toDateString().slice(4);
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
    ...mapActions("plioItems", ["fetchPlio"]),
    ...mapActions("generic", [
      "showSharePlioDialog",
      "showEmbedPlioDialog",
      "showSpinner",
      "hideSpinner",
      "setSelectedPlioId",
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
    ...Utilities,
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
          this.setDialogTitle(this.$t("home.table.plio_list_item.dialog.delete.title"));
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
            class: "bg-primary hover:bg-primary-hover focus:outline-none text-white",
          });
          // show the dialog box
          this.showDialogBox();
          this.setDialogAction("deletePlio");
          await this.setSelectedPlioId(this.plioId);
          break;
      }
    },
    handleScroll() {
      // handles all scrolling events
      this.scrollY = window.scrollY;
    },
    async loadPlio() {
      // fetch the details of the plio if they don't exist in the store
      if (!(this.plioId in this.allPlioDetails)) await this.fetchPlio(this.plioId);

      this.plioDetails = this.allPlioDetails[this.plioId];
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
        params: { org: this.activeWorkspace, plioId: this.plioId },
      });
      // required for opening in a new tab
      window.open(routeData.href, "_blank");
    },
    editPlio() {
      // invoked when edit button is clicked
      this.$router.push({
        name: "Editor",
        params: { plioId: this.plioId, org: this.activeWorkspace },
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
          this.toast.success(this.$t("home.table.plio_list_item.toast.delete.success"));
          this.$emit("deleted");
        })
        .catch(() => {
          // restore background
          this.hideSpinner();
          // notify of error
          this.toast.error(this.$t("home.table.plio_list_item.toast.delete.error"));
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
      var newPlio = await PlioAPIService.duplicatePlio(this.plioId);
      await Promise.all(
        this.plioDetails.items.map(async (item, index) => {
          // duplicate item and link it to the newly created plio
          var newItem = await ItemAPIService.duplicateItem(item.id, newPlio.data.id);
          // duplicate question and link it to the newly created item
          await QuestionAPIService.duplicateQuestion(
            this.plioDetails.itemDetails[index].id,
            newItem.data.id
          );
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
  emits: ["fetched", "deleted"],
};
</script>
