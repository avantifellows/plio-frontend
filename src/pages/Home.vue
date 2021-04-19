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
          You have been added to the waitlist <br />
          You will hear from us soon
        </p>
      </div>
    </div>
    <div v-else>
      <Table :data="tableData" :columns="tableColumns" :tableTitle="'All Plios'"> </Table>
      <!-- no plios exist warning -->
      <div
        v-if="hasAnyPlios"
        class="bg-white w-full m-auto mt-32 text-2xl font-semibold tracking-tighter text-center px-8"
      >
        {{ noPliosCreatedWarning }}
      </div>
    </div>
  </div>
</template>

<script>
import Table from "@/components/UI/Table/Table.vue";
import PlioAPIService from "@/services/API/Plio.js";
import { mapState, mapActions } from "vuex";

export default {
  name: "Home",
  components: {
    Table,
  },
  props: {
    org: {
      default: "",
      type: String,
    },
  },
  watch: {
    activeWorkspace() {
      this.fetchAllPlioIds();
    },
  },
  data() {
    return {
      searchQuery: "",
      tableColumns: ["name", "no. of learners"],
      tableData: [],
      // dummy table data - to show skeletons when data is being loaded
      dummyTableData: Array(5).fill({
        name: { type: "component", value: "" },
        "no. of learners": "-",
      }),
      hasAnyPlios: false,
      noPliosCreatedWarning: "No plios exist! Use the button above to create a plio",
      confirmIcon: require("@/assets/images/check-circle-regular.svg"),
    };
  },
  async created() {
    // feed the dummy data to show skeletons before loading the actual data
    this.tableData = this.dummyTableData;
    await this.fetchAllPlioIds();
  },
  computed: {
    ...mapState("auth", ["activeWorkspace", "user"]),
    isUserApproved() {
      // whether the user is an approved user or in waitlist
      return this.user.status == "approved";
    },
  },
  methods: {
    ...mapActions("plioItems", ["purgeAllPlios"]),
    async fetchAllPlioIds() {
      var uuidOnly = true;
      await PlioAPIService.getAllPlios(uuidOnly).then((response) => {
        // if no plios exist, show the warning else hide the warning
        if (response.data.length <= 0) this.hasAnyPlios = true;
        else this.hasAnyPlios = false;

        this.prepareTableData(response.data);
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

            case "no. of learners":
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
