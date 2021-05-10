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
          {{ $t("home.waitlist.2") }}
        </p>
      </div>
    </div>
    <div v-else>
      <!-- table -->
      <Table
        v-if="hasAnyPlios"
        :data="tableData"
        :columns="tableColumns"
        :tableTitle="tableTitle"
        @search-plios="fetchPliosBySearchString"
        @reset-search-string="resetSearchString"
      >
      </Table>

      <!-- pagination nav bar -->
      <Paginator
        v-if="hasAnyPlios && totaNumberOfPlios"
        :totalItems="totaNumberOfPlios"
        :pageSize="numberOfPliosPerPage"
        @page-selected="fetchPage"
      >
      </Paginator>

      <!-- no plios exist warning -->
      <div v-if="!hasAnyPlios" class="flex flex-col bg-white w-full m-auto mt-32 px-8">
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
      if (this.isUserApproved) await this.fetchAllPlioIds();
    },
    isUserApproved(value) {
      // fetch plios again if user approval status changes
      if (value) this.fetchAllPlioIds();
    },
  },
  data() {
    return {
      tableColumns: ["name", "number_of_viewers"], // columns for the table
      tableData: [],
      // dummy table data - to show skeletons when data is being loaded
      dummyTableData: Array(5).fill({
        name: { type: "component", value: "" },
        number_of_viewers: "-",
      }),
      hasAnyPlios: true, // whether there are any plios
      confirmIcon: require("@/assets/images/check-circle-regular.svg"),
      noPliosIcon: require("@/assets/images/create.svg"),
      toast: useToast(), // use the toast component
      totaNumberOfPlios: null, // total number of plios that the user has access to
      numberOfPliosPerPage: 5, // number of plios to show on one page (default: 5)
      searchString: "", // the search string to filter the plios on
    };
  },
  async created() {
    // feed the dummy data to show skeletons before loading the actual data
    this.tableData = this.dummyTableData;
    if (this.isUserApproved) await this.fetchAllPlioIds();
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
    async resetSearchString() {
      // reset the search string to ""
      // fetch all the plios again
      if (this.searchString != "") {
        this.startLoading();
        await this.fetchAllPlioIds();
        this.stopLoading();
        this.searchString = "";
      }
    },
    async fetchAllPlioIds() {
      var uuidOnly = true;
      await PlioAPIService.getAllPlios(uuidOnly).then((response) => {
        // if no plios exist, show the warning else hide the warning
        if (response.data.count <= 0) {
          // if not plios exist, show the warning
          this.hasAnyPlios = false;
        } else {
          // if plios exist
          this.hasAnyPlios = true; // hide the warning and show the table
          this.totaNumberOfPlios = response.data.count; // set total number of plios and show the paginator
          this.numberOfPliosPerPage = response.data.page_size; // set the page size
          this.prepareTableData(response.data.results); // prepare the data for the table
        }
      });
    },

    async fetchPage(pageNumber) {
      // fetch the plio uuids at the given page number
      // (also filter with a search string if present)
      this.startLoading();
      var uuidOnly = true;
      await PlioAPIService.getAllPlios(uuidOnly, pageNumber, this.searchString).then(
        (response) => {
          // when fetched, feed the new data into the table
          this.prepareTableData(response.data.results);
        }
      );
    },

    createNewPlio() {
      // invoked when the user clicks on Create
      // creates a new draft plio and redirects the user to the editor
      this.$Progress.start();
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
      var tableData = [];
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
              tableRow[column] = await PlioAPIService.getUniqueUsersCount(plioId);
              break;
          }
        }

        tableData.push(tableRow);
      }
      this.tableData = tableData;
      if (this.pending) this.stopLoading();
    },

    async fetchPliosBySearchString(searchString) {
      // filter and fetch plios using a search string and populate the table and paginator again
      this.searchString = searchString;
      this.startLoading();

      var uuidOnly = true;
      await PlioAPIService.getAllPlios(uuidOnly, undefined, this.searchString).then(
        (response) => {
          this.totaNumberOfPlios = response.data.count; // set total number of plios
          this.numberOfPliosPerPage = response.data.page_size; // set the page size
          this.prepareTableData(response.data.results); // prepare the data for the table
        }
      );
    },
  },
  unmounted() {
    // remove all plio details from the store
    // when user navigates away from the home page
    this.purgeAllPlios();
  },
};
</script>
