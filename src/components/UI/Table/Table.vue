<template>
  <div class="flex flex-col mx-2 xsm:mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14">
    <!-- nav bar for table -->
    <div class="flex flex-col xsm:flex-row justify-between pt-4" v-if="!isTableEmpty">
      <!-- table title -->
      <div
        class="flex flex-row gap-2 text-base sm:text-lg md:text-xl xl:text-2xl font-bold p-2 items-center"
      >
        <p>{{ tableTitle }}</p>
        <p v-if="!pending">({{ totalItemsInTable }})</p>
        <inline-svg
          v-if="pending"
          :src="require('@/assets/images/spinner-solid.svg')"
          class="animate-spin h-4 object-scale-down"
        ></inline-svg>
      </div>
      <!-- table search -->
      <div
        class="bg-white flex items-center rounded-full shadow-md border-2 w-full xsm:w-1/2 sm:w-1/3 float-right mb-2 mt-2"
        :class="disabledElementClass"
      >
        <form id="search" class="w-full px-4">
          <input
            class="w-full text-gray-700 leading-tight focus:outline-none"
            placeholder="Search"
            v-model="searchFilterKey"
          />
        </form>

        <div class="p-2 pr-3">
          <inline-svg
            :src="require('@/assets/images/search-solid.svg')"
            class="text-yellow-600 h-5 w-5"
          ></inline-svg>
        </div>
      </div>
    </div>

    <!-- table -->
    <!-- structure inspired from https://tailwindui.com/components/application-ui/lists/tables  -->
    <div class="flex flex-col" v-if="!isTableEmpty">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div
            class="shadow overflow-hidden border-b border-gray-200 rounded-lg border-l border-r"
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-200">
                <!-- table headers -->
                <tr>
                  <th
                    v-for="(columnName, columnIndex) in columns"
                    @click="sortBy(columnName)"
                    :key="columnName"
                    scope="col"
                    class="sm:px-6 sm:py-3 px-3 py-1.5 text-left text-xs sm:text-md font-medium text-gray-500 uppercase tracking-wider w-2/3"
                    :class="getColumnHeaderStyleClass(columnIndex)"
                  >
                    <div class="flex">
                      <div
                        class="p-1 my-auto whitespace-nowrap md:text-base xl:text-lg cursor-pointer"
                      >
                        {{ tableColumnName(columnName) }}
                      </div>
                      <div class="p-1 my-auto cursor-pointer">
                        <inline-svg
                          :src="require('@/assets/images/chevron-down-solid.svg')"
                          class="h-3 w-3 my-1 transition ease duration-800"
                          :class="getSortIconStyleClass(columnName)"
                        ></inline-svg>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- table values -->
                <tr v-for="(entry, entryIndex) in filteredData" :key="entry">
                  <td
                    v-for="(columnName, columnIndex) in columns"
                    :key="columnName"
                    class="sm:px-6 sm:py-3 px-3 py-1.5 whitespace-normal"
                    :class="{
                      'hidden sm:table-cell': columnIndex != 0,
                    }"
                  >
                    <div class="flex">
                      <div v-if="isComponent(entry[columnName])" class="w-full">
                        <PlioListItem
                          :plioId="entry[columnName].value"
                          @fetched="savePlioDetails(entryIndex, $event)"
                        >
                        </PlioListItem>
                      </div>

                      <div
                        v-else
                        class="text-sm sm:text-lg xl:text-2xl font-medium text-gray-900"
                      >
                        {{ entry[columnName] }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlioListItem from "@/components/Items/ListItems/PlioListItem.vue";
import { mapState, mapActions } from "vuex";

export default {
  props: {
    data: Array,
    columns: Array,
    org: {
      default: "",
      type: String,
    },
    tableTitle: {
      // title to be given to the table
      default: "",
      type: String,
    },
  },
  components: {
    PlioListItem,
  },
  mounted() {
    this.startLoading();
  },
  watch: {
    // as soon as filteredData changes, stop loading
    filteredData: {
      deep: true,
      handler() {
        this.stopLoading();
      },
    },
  },
  data() {
    return {
      sortKey: "", // the key (table column) to sort the table on
      searchFilterKey: "", // the string to use when filtering the results
      sortOrders: {}, // store the sorting orders of all columns of the table - asc or desc
      searchIconConfig: {
        enabled: true,
        iconName: "search-solid",
        iconClass: "text-yellow-600 h-5 w-5",
      },
    };
  },

  created() {
    this.initialiseSortOrders();
  },

  computed: {
    ...mapState("sync", ["pending"]),
    totalItemsInTable() {
      // total rows present in the table
      return this.filteredData.length || 0;
    },
    isTableEmpty() {
      return this.totalItemsInTable == 0 && this.searchFilterKey == "";
    },
    filteredData() {
      // contains the filtered data after applying sorting or searching to the raw data
      return this.orderBySort(this.filterBySearch(this.data));
    },
    disabledElementClass() {
      return {
        "pointer-events-none": this.pending,
      };
    },
  },
  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    tableColumnName(columnName) {
      // name of the column in the table
      return this.$t(`home.table.columns.${columnName}`);
    },
    isComponent(value) {
      // if a particular entry in the table is a component or not
      return value.type == "component";
    },
    initialiseSortOrders() {
      // initialise sorting orders for all table columns
      // set it to 1 - ascending
      const columnSortOrders = {};
      this.columns.forEach(function (key) {
        columnSortOrders[key] = 1;
      });
      this.sortOrders = columnSortOrders;
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    sortBy(key) {
      // invoked when sorting arrows are clicked on a table column
      // sortOrder value can be 1(ascending) or -1(descending)
      // everytime this method is involed, sortOrder for the "key" is toggled
      this.sortKey = key;
      this.sortOrders[key] = this.sortOrders[key] * -1;
    },
    savePlioDetails(entryIndex, plioDetails) {
      // save the plio details after they are fetched from the PlioListItem

      // to enable the search functionality on things like plio title, status, date etc,
      // those details need to be stored in the filteredData object and that too, inside the "name"
      // key as that key contains the details of plios
      if (this.filteredData != undefined && this.filteredData[entryIndex] != undefined) {
        this.filteredData[entryIndex]["name"] = {
          ...this.filteredData[entryIndex]["name"],
          ...plioDetails,
        };
      }
    },
    filterBySearch(data) {
      const searchFilterKey = this.searchFilterKey && this.searchFilterKey.toLowerCase();
      if (searchFilterKey) {
        data = data.filter((row) => {
          return Object.keys(row).some((key) => {
            var objectToFilter = row[key];
            if (typeof objectToFilter === "object" && objectToFilter !== null) {
              return Object.keys(objectToFilter).some((value) => {
                return (
                  String(objectToFilter[value]).toLowerCase().indexOf(searchFilterKey) >
                  -1
                );
              });
            } else
              return String(objectToFilter).toLowerCase().indexOf(searchFilterKey) > -1;
          });
        });
      }
      return data;
    },
    orderBySort(data) {
      const sortKey = this.sortKey;
      const order = this.sortOrders[sortKey];

      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey];
          b = b[sortKey];
          if (sortKey == "name") {
            // to apply sorting on the plio title
            a = a["title"].toLowerCase();
            b = b["title"].toLowerCase();
          }
          return (a === b ? 0 : a > b ? 1 : -1) * order;
        });
      }
      return data;
    },
    getColumnHeaderStyleClass(columnIndex) {
      return {
        "hidden sm:table-cell": columnIndex != 0,
      };
    },
    getSortIconStyleClass(columnName) {
      return {
        "transform rotate-180": this.sortOrders[columnName] == -1,
      };
    },
  },
};
</script>
