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
      <Table
        v-if="hasAnyPlios"
        :data="tableData"
        :columns="tableColumns"
        :tableTitle="tableTitle"
      >
      </Table>
      <!-- no plios exist warning -->
      <div v-else class="flex flex-col bg-white w-full m-auto mt-32 px-8">
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
    <vue-progress-bar></vue-progress-bar>
  </div>
</template>

<script>
import Table from "@/components/UI/Table/Table.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import PlioAPIService from "@/services/API/Plio.js";
import { mapState, mapActions, mapGetters } from "vuex";
import { useToast } from "vue-toastification";

export default {
  name: "Home",
  components: {
    Table,
    IconButton,
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
      searchQuery: "", // string being queried in the search bar
      tableColumns: ["name", "number_of_learners"], // columns for the table
      tableData: [],
      // dummy table data - to show skeletons when data is being loaded
      dummyTableData: Array(5).fill({
        name: { type: "component", value: "" },
        number_of_learners: "-",
      }),
      hasAnyPlios: false, // whether there are any plios
      confirmIcon: require("@/assets/images/check-circle-regular.svg"),
      noPliosIcon: require("@/assets/images/create.svg"),
      toast: useToast(), // use the toast component
    };
  },
  async created() {
    // feed the dummy data to show skeletons before loading the actual data
    this.tableData = this.dummyTableData;
    if (this.isUserApproved) await this.fetchAllPlioIds();
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
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
    async fetchAllPlioIds() {
      var uuidOnly = true;
      await PlioAPIService.getAllPlios(uuidOnly).then((response) => {
        // if no plios exist, show the warning else hide the warning
        if (response.data.length <= 0) this.hasAnyPlios = false;
        else this.hasAnyPlios = true;

        this.prepareTableData(response.data);
      });
    },

    createNewPlio() {
      // invoked when the user clicks on Create
      // creates a new draft plio and redirects the user to the editor
      this.$Progress.start();
      PlioAPIService.createPlio().then((response) => {
        this.$Progress.finish();
        if (response.status == 201) {
          this.$router.push({
            name: "Editor",
            params: { plioId: response.data.uuid, org: this.activeWorkspace },
          });
        } else {
          this.toast.error(this.$t("error.create_plio"));
        }
      });
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

            case "number_of_learners":
              tableRow[column] = await PlioAPIService.getUniqueUsersCount(plioId);
              break;
          }
        }

        tableData.push(tableRow);
      }
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
