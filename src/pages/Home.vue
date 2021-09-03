<template>
  <div>
    <div v-if="!isUserApproved" class="flex flex-col w-full h-full mt-10">
      <div class="flex justify-center">
        <inline-svg
          :src="confirmIcon"
          class="h-12 w-12 sm:h-20 sm:w-20 place-self-center text-green-600"
        ></inline-svg>
      </div>
      <div class="mt-10">
        <p class="text-center text-lg sm:text-2xl">
          {{ $t("home.waitlist.1") }} <br />
          {{ $t("home.waitlist.2") }} <br />
          {{ $t("home.waitlist.3") }}
          <a
            href="https://forms.gle/7dxyWSi66FLrckBY8"
            target="_blank"
            class="text-green-600"
            >{{ $t("home.waitlist.4") }}</a
          >
          {{ $t("home.waitlist.5") }}
        </p>
      </div>
    </div>
    <div v-else>
      <!-- table -->
      <Table
        v-if="showTable"
        :data="tableData"
        :columns="tableColumns"
        :tableTitle="tableTitle"
        :numTotal="totalNumberOfPlios"
        :org="org"
        @search-plios="fetchPlioIds($event)"
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
        v-if="showTable"
        :totalItems="totalNumberOfPlios"
        :pageSize="numberOfPliosPerPage"
        :initialPage="currentPageNumber"
        @page-selected="fetchPlioIds($event)"
      >
      </Paginator>

      <!-- no plios exist warning -->
      <div
        v-if="!showTable"
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
  </div>
</template>

<script>
import Table from "@/components/Collections/Table/Table.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import PlioAPIService from "@/services/API/Plio.js";
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
    org: {
      default: "",
      type: String,
    },
  },
  watch: {
    async activeWorkspace() {
      if (this.isUserApproved) await this.fetchPlioIds();
    },
    isUserApproved(value) {
      // fetch plios again if user approval status changes
      if (value) this.fetchPlioIds();
    },
  },
  data() {
    return {
      tableColumns: ["name", "number_of_viewers"], // columns for the table
      tableData: [],
      countUniqueUsersList: [], // holds the number of unique users for all the plios fetched
      // dummy table data - to show skeletons when data is being loaded
      dummyTableData: Array(5).fill({
        name: { type: "component", value: "" },
        number_of_viewers: "-",
      }),
      showTable: true, // whether to show the table or not
      confirmIcon: require("@/assets/images/check-circle-regular.svg"),
      noPliosIcon: require("@/assets/images/create.svg"),
      toast: useToast(), // use the toast component
      totalNumberOfPlios: 0, // total number of plios for the user
      numberOfPliosPerPage: 5, // number of plios to show on one page (default: 5)
      searchString: "", // the search string to filter the plios on
      sortByField: undefined, // string which holds the field to sort the plios on
      currentPageNumber: 1, // holds the current page number
    };
  },
  async created() {
    // feed the dummy data to show skeletons before loading the actual data
    this.tableData = this.dummyTableData;
    if (this.isUserApproved) await this.fetchPlioIds();
    this.$mixpanel.track("Visit Home");

    // show the chatwoot bubble
    var chatwootBubble = document.querySelector(".woot-widget-bubble");
    if (chatwootBubble != undefined) chatwootBubble.classList.remove("hidden");
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
    ...mapState("sync", ["pending"]),
    ...mapGetters("auth", ["isUserApproved"]),
    createButtonTextConfig() {
      // config for the text of the main create button
      return {
        value: this.$t("home.create_button_empty"),
        class: "text-lg md:text-xl lg:text-2xl text-white",
      };
    },
    createButtonClass() {
      // class for the create button
      return "bg-primary hover:bg-primary-hover rounded-lg h-14 w-40 sm:h-20 sm:w-60 ring-primary px-2";
    },
    tableTitle() {
      // title for the table of all plios
      return this.$t("home.all_plios");
    },
  },
  methods: {
    ...mapActions("plioItems", ["purgeAllPlios"]),
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    plioDeleted() {
      // invoked when a plio is deleted

      // handle the case when there is only one plio on the current page
      // and the current page is not the first page
      if (this.tableData.length == 1 && this.currentPageNumber != 1) {
        this.currentPageNumber -= 1;
      }
      this.fetchPlioIds();
    },
    async sortPlios(sortByField) {
      // invoked when the user clicks the sort icon next to a column
      this.sortByField = sortByField;
      await this.fetchPlioIds();
    },
    async resetSearchString() {
      // reset the search string to ""
      // fetch all the plios again
      if (this.searchString != "") {
        this.searchString = "";
        await this.fetchPlioIds();
      }
    },

    async fetchPlioIds(params = undefined) {
      if (!this.pending) this.startLoading();
      var uuidOnly = true;

      //if params contain a searchString or pageNumber, save it into a variable,
      //else save the variable as undefined
      var searchString =
        params != undefined && "searchString" in params ? params.searchString : undefined;

      var pageNumber =
        params != undefined && "pageNumber" in params ? params.pageNumber : undefined;

      // if the params contain a valid searchString, update the local searchString variable
      if (searchString != undefined && searchString != "")
        this.searchString = searchString;

      // if the params contain a valid pageNumber, update the local currentPageNumber variable
      if (pageNumber != undefined) this.currentPageNumber = pageNumber;

      await PlioAPIService.getAllPlios(
        uuidOnly,
        this.currentPageNumber,
        this.searchString,
        this.sortByField
      )
        .then((response) => {
          // to handle the case when the user lands on the homepage for the first time
          // if no plios exist, then hide the table else show it
          if (params == undefined) {
            if (response.data.count <= 0) {
              this.showTable = false;
              this.stopLoading();
            } else this.showTable = true;
          }
          this.totalNumberOfPlios = response.data.count; // set total number of plios and show the paginator
          this.numberOfPliosPerPage = response.data.page_size; // set the page size
          return Promise.resolve(response.data.results);
        })
        .then(async (plioIdList) => {
          // fetch the list of unique users for each plio
          await PlioAPIService.getUniqueUsersCountList(plioIdList).then((response) => {
            this.countUniqueUsersList = response;
          });
          return Promise.resolve(plioIdList);
        })
        .then((plioIdList) => this.prepareTableData(plioIdList)); // prepare the data for the table
    },

    createNewPlio() {
      // invoked when the user clicks on Create
      // creates a new draft plio and redirects the user to the editor
      this.$Progress.start();
      this.$mixpanel.track("Click Create");
      this.$mixpanel.people.set_once({
        "First Plio Created": new Date().toISOString(),
      });
      this.$mixpanel.people.set({
        "Last Plio Created": new Date().toISOString(),
      });
      this.$mixpanel.people.increment("Total Plios Created");
      PlioAPIService.createPlio()
        .then((response) => {
          this.$Progress.finish();
          if (response.status == 201) {
            this.$router.push({
              name: "Editor",
              params: { plioId: response.data.uuid, org: this.activeWorkspace },
            });
          }
        })
        .catch(() => this.toast.error(this.$t("error.create_plio")));
    },

    async prepareTableData(plioIdList) {
      // holds the data to be fed to the table
      var tableData = [];

      // fill in the data for each plio
      for (let plioIndex = 0; plioIndex < plioIdList.length; plioIndex++) {
        const plioId = plioIdList[plioIndex];
        var tableRow = {};

        for (let colIndex = 0; colIndex < this.tableColumns.length; colIndex++) {
          const column = this.tableColumns[colIndex];
          switch (column) {
            case "name":
              tableRow[column] = {
                type: "component",
                value: plioId,
              };
              break;

            case "number_of_viewers":
              tableRow[column] = this.countUniqueUsersList[plioIndex];
              break;
          }
        }

        tableData.push(tableRow);
      }

      // update the table's data
      this.tableData = tableData;
    },
  },

  unmounted() {
    // remove all plio details from the store
    // when user navigates away from the home page
    this.purgeAllPlios();
  },
};
</script>
