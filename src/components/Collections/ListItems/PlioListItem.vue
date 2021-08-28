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

          <!--
            dummy badge to ensure that the dropdown button
            is placed at the same spot for both draft and published plios
          -->
          <simple-badge
            :text="$t(`generic.status.published`)"
            class="invisible"
            :badgeClass="statusBadgeClass"
            v-tooltip.top="statusBadgeTooltip"
          ></simple-badge>
        </div>

        <!-- the dropdown containing the action buttons -->
        <OptionDropdown
          :options="plioActionOptions"
          :scrollY="scrollY"
          :isTouchDevice="isTouchDevice"
          class="flex-grow flex relative justify-end sm:justify-start"
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
  <!-- generic dialog box -->
  <dialog-box
    class="fixed left-1/3 z-10"
    v-if="showDialogBox"
    :title="dialogTitle"
    :description="dialogDescription"
    :confirmButtonConfig="dialogConfirmButtonConfig"
    :cancelButtonConfig="dialogCancelButtonConfig"
    @confirm="dialogConfirmed"
    @cancel="dialogCancelled"
    data-test="dialogBox"
    v-click-away="dialogCancelled"
  ></dialog-box>
</template>

<script>
import PlioAPIService from "@/services/API/Plio.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import Utilities from "@/services/Functional/Utilities.js";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import OptionDropdown from "@/components/App/OptionDropdown.vue";
import DialogBox from "@/components/UI/Alert/DialogBox";
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
    SimpleBadge,
    PlioListItemSkeleton,
    OptionDropdown,
    DialogBox
  },

  data() {
    return {
      // button, icon config and styling classes
      plioDetails: {},
      actionButtonClass:
        "bg-gray-100 hover:bg-gray-200 rounded-md shadow-md h-10 ring-primary",
      urlCopyButtonClass: "text-yellow-600",
      scrollY: window.scrollY, // the number of pixels scrolled vertically
      showDialogBox: false,
      dialogTitle: "",
      dialogDescription: "",
      dialogConfirmButtonConfig: {},
      dialogCancelButtonConfig: {}
    };
  },
  async created() {
    // load the plio only if the plio id is not empty
    if (this.isPlioIdValid) await this.loadPlio();

    // add listener for scrolling
    window.addEventListener('scroll', this.handleScroll);
  },
  unmounted() {
    // remove listeners
    window.removeEventListener('scroll', this.handleScroll);
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapState("sync", ["pending"]),
    ...mapState("plioItems", ["allPlioDetails"]),


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
          disabled: !this.isPublished
        },
        {
          value: "share",
          label: this.$t("home.table.plio_list_item.buttons.share"),
          icon: "share.svg",
          disabled: !this.isPublished
        }
      ]
      if (this.isTouchDevice) {
        options.push({
          value: "analyse",
          label: this.$t("home.table.plio_list_item.buttons.analyse"),
          icon: "analyze.svg",
          disabled: !this.isPublished
        })
      }
      let moreOptions = [
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
      ]
      options.push(...moreOptions)
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
      // removed the first four characters of the output as they represent the day
      // and lead to inconsistent length of the string
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

  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    ...mapActions("plioItems", ["fetchPlio"]),
    ...mapActions("generic", ["showSharePlioDialog", "setDialogBoxShown"]),
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
        case "delete":
          // configure the dialog box
          if (!this.dialogTitle) {
            this.dialogTitle = this.$t("home.table.plio_list_item.dialog.delete.title")
            this.dialogDescription = this.$t("home.table.plio_list_item.dialog.delete.description")
            this.dialogConfirmButtonConfig = {
              enabled: true,
              text: this.$t("generic.yes"),
              class:
                "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
            };
            this.dialogCancelButtonConfig = {
              enabled: true,
              text: this.$t("generic.no"),
              class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
            };
          }
          this.showDialogBox = true;
          this.setDialogBoxShown()
          break
      }
    },
    handleScroll() {
      // handles all scrolling events
      this.scrollY = window.scrollY
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
    dialogConfirmed() {

    },
    dialogCancelled() {
      this.showDialogBox = false;
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
