<template>
  <Table :data="tableData" :columns="tableColumns" :org="org" :tableTitle="'All Plios'">
  </Table>
</template>

<script>
import Table from "@/components/UI/Table/Table.vue";
import PlioAPIService from "@/services/API/Plio.js";
import SessionAPIService from "@/services/API/Session.js";
import { mapState } from "vuex";

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
    };
  },
  async created() {
    await this.fetchAllPlioIds();
  },
  computed: {
    ...mapState("auth", ["activeWorkspace"]),
  },
  methods: {
    async fetchAllPlioIds() {
      var uuidOnly = true;
      await PlioAPIService.getAllPlios(uuidOnly).then((response) => {
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
              tableRow[column] = await SessionAPIService.getUniqueUsersCount(plioId);
              tableRow[column] = tableRow[column].data;
              break;
          }
        }

        tableData.push(tableRow);
      }
      this.tableData = tableData;
    },

    countUniqueUsers(plioId) {
      return SessionAPIService.getUniqueUsersCount(plioId);
    },
  },
};
</script>
