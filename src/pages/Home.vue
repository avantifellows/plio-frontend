<template>
  <div>
    <!-- table -->
    <Table
      v-if="isTableShown"
      :data="tableData"
      :columns="tableColumns"
      :tableTitle="tableTitle"
      :numTotal="totalNumberOfPlios"
      :workspace="workspace"
      @search-plios="fetchPlios($event)"
      @reset-search-string="resetSearchString"
      @sort-num-viewers="sortPlios"
      @delete-plio="plioDeleted"
      @loaded="stopLoading"
      data-test="table"
      ref="table"
    >
    </Table>

    <!-- pagination nav bar -->
    <Paginator
      v-if="isTableShown"
      :totalItems="totalNumberOfPlios"
      :pageSize="numPliosPerPage"
      :initialPage="currentPageNumber"
      @page-selected="fetchPlios($event)"
    >
    </Paginator>

    <!-- no plios exist warning -->
    <div
      v-if="!isTableShown"
      class="flex flex-col bg-white w-full m-auto mt-32 px-8"
      data-test="noPlio"
    >
      <inline-svg
        :src="noPliosIcon"
        class="w-50 h-50 opacity-50 place-self-center m-10"
      ></inline-svg>
      <p class="text-center text-md sm:text-lg md:text-xl lg:text-2xl">
        {{ $t("home.no_plios") }}
      </p>
      <!-- create plio button -->
      <icon-button
        :titleConfig="createButtonTextConfig"
        :buttonClass="createButtonClass"
        class="rounded-md shadow-lg mt-4 place-self-center"
        @click="createNewPlio"
        data-test="create"
      ></icon-button>
    </div>
  </div>
</template>

<script>
import Table from "@/components/Collections/Table/Table.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import PlioAPIService from "@/services/API/Plio.js";
import PlioFunctionalService from "@/services/Functional/Plio.js";
import Paginator from "@/components/UI/Navigation/Paginator.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { useToast } from "vue-toastification";

export default {
  name: "Home",
  components: {
    Table,
    IconButton,
    Paginator,
  },
  props: {
    workspace: {
      default: "",
      type: String,
    },
  },
  watch: {
    async activeWorkspace() {
      if (this.isAuthenticated) {
        // reset currentPageNumber
        this.currentPageNumber = 1;
        // reset search string
        this.resetSearchString();
        await this.fetchPlios();
      }
    },
    isTableShown(value) {
      if (!value) {
        this.$nextTick(() => this.stopLoading());
      }
    },
  },
  data() {
    return {
      tableColumns: ["name", "views"], // columns for the table
      tableData: [],
      // dummy table data - to show skeletons when data is being loaded
      dummyTableData: Array(5).fill({
        name: { type: "component", value: {} },
        views: "-",
      }),
      isTableShown: true, // whether to show the table or not
      confirmIcon: require("@/assets/images/check-circle-regular.svg"),
      noPliosIcon: require("@/assets/images/create.svg"),
      toast: useToast(),
      totalNumberOfPlios: 0, // total number of plios for the user
      numPliosPerPage: 5, // number of plios to show on one page (default: 5)
      searchString: "", // the search string to filter the plios on
      sortByField: undefined, // string which holds the field to sort the plios on
      currentPageNumber: 1, // holds the current page number
      // class for the create button
      createButtonClass:
        "bg-primary hover:bg-primary-hover rounded-lg h-14 w-40 sm:h-20 sm:w-60 ring-primary px-2 border-b-outset border-primary",
    };
  },
  async created() {
    // feed the dummy data to show skeletons before loading the actual data
    this.tableData = this.dummyTableData;
    await this.fetchPlios();
    this.$mixpanel.track("Visit Home");
  },
  computed: {
    ...mapState("auth", ["activeWorkspace", "userSettings"]),
    ...mapState("sync", ["pending"]),
    ...mapGetters("auth", [
      "isPersonalWorkspace",
      "activeWorkspaceSettings",
      "isAuthenticated",
    ]),
    createButtonTextConfig() {
      // config for the text of the create button shown when no plios have been created
      return {
        value: this.$t("home.create_button_empty"),
        class: "text-lg md:text-xl lg:text-2xl text-white",
      };
    },
    tableTitle() {
      // title for the table of all plios
      return this.$t("home.all_plios");
    },
  },
  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    ...mapActions("auth", ["setActiveWorkspace"]),
    plioDeleted() {
      // invoked when a plio is deleted

      // handle the case when there is only one plio on the current page
      // and the current page is not the first page
      if (this.tableData.length == 1 && this.currentPageNumber != 1) {
        this.currentPageNumber -= 1;
      }
      this.fetchPlios();
    },
    async sortPlios(sortByField) {
      // invoked when the user clicks the sort icon next to a column
      this.sortByField = sortByField;
      await this.fetchPlios();
    },
    async resetSearchString() {
      // reset the search string to ""
      // fetch all the plios again
      if (this.searchString != "") {
        this.searchString = "";
        await this.fetchPlios();
      }
    },

    async fetchPlios(params = undefined) {
      if (!this.pending) this.startLoading();

      // if params contain a searchString or pageNumber, save it into a variable,
      // else save the variable as undefined
      let searchString =
        params != undefined && "searchString" in params
          ? params.searchString
          : undefined;

      let pageNumber =
        params != undefined && "pageNumber" in params
          ? params.pageNumber
          : undefined;

      // if the params contain a valid searchString, update the local searchString variable
      if (searchString != undefined && searchString != "")
        this.searchString = searchString;

      // if the params contain a valid pageNumber, update the local currentPageNumber variable
      if (pageNumber != undefined) this.currentPageNumber = pageNumber;

      let response = await PlioAPIService.getAllPlios(
        this.currentPageNumber,
        this.searchString,
        this.sortByField
      );

      if (params == undefined) {
        // to distinguish the case when no plios have been created (hide the table)
        // with the case when plios have been created but there are no plios matching the
        // criteria specified by the params (based on search, for example)
        if (response.data.raw_count == 0) {
          this.isTableShown = false;
          return;
        } else this.isTableShown = true;
      }
      this.totalNumberOfPlios = response.data.count; // set total number of plios and show the paginator
      this.numPliosPerPage = response.data.page_size; // set the page size
      this.prepareTableData(response.data.results); // prepare the data for the table
    },

    async createNewPlio() {
      // invoked when the user clicks on Create
      // creates a new draft plio and redirects the user to the editor
      await PlioFunctionalService.createNewPlio(this);
    },

    async prepareTableData(plioList) {
      /**
       * prepares the data for the plios to be fed into the table
       */
      if (!plioList.length) {
        // no plios found
        this.stopLoading();
        this.tableData = [];
        return;
      }

      // holds the data to be fed to the table
      let tableData = [];

      // fill in the data for each plio
      for (let plioIndex = 0; plioIndex < plioList.length; plioIndex++) {
        let tableRow = {};

        for (
          let columnIndex = 0;
          columnIndex < this.tableColumns.length;
          columnIndex++
        ) {
          const column = this.tableColumns[columnIndex];
          switch (column) {
            case "name":
              tableRow[column] = {
                type: "component",
                value: plioList[plioIndex],
              };
              break;

            case "views":
              tableRow[column] = plioList[plioIndex].unique_viewers;
              break;
          }
        }

        tableData.push(tableRow);
      }

      // update the table's data
      this.tableData = tableData;
    },
  },
};
</script>
