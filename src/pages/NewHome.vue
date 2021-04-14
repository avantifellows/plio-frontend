<template>
  <Table :data="tableData" :columns="tableColumns"> </Table>
</template>

<script>
import Table from "@/components/UI/Table/Table.vue";
import PlioAPIService from "@/services/API/Plio.js";
import SessionAPIService from "@/services/API/Session.js";
import { mapState } from "vuex";

export default {
  name: "NewHome",
  components: {
    Table,
  },
  data() {
    return {
      searchQuery: "",
      tableColumns: ["name", "no. of learners", "% completion", "% accuracy"],
      tableData: [],
    };
  },
  async created() {
    await this.fetchAllPlioIds();
  },
  computed: {
    ...mapState("auth", ["userId"]),
  },
  methods: {
    async fetchAllPlioIds() {
      await PlioAPIService.getAllPlioIds(this.userId).then((response) => {
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

            case "% completion":
              tableRow[column] = "30%"; // TODO - dummy value
              break;

            case "% accuracy":
              tableRow[column] = "55%"; // TODO - dummy value
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
