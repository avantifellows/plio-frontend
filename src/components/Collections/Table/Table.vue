<template>
  <div class="flex flex-col mx-2 xsm:mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14">
    <!-- nav bar for table : table title and search bar -->
    <div class="flex flex-col xsm:flex-row justify-between pt-4">
      <!-- table title -->
      <div :class="tableTitleClass">
        <p>{{ tableTitle }}</p>
        <p v-if="!pending">({{ totalItemsInTable }})</p>
        <inline-svg
          v-if="pending"
          :src="require('@/assets/images/spinner-solid.svg')"
          class="animate-spin h-4 object-scale-down"
        ></inline-svg>
      </div>
      <!-- table search -->

      <!-- search bar container -->
      <div :class="[disabledElementClass, searchContainerClass]">
        <!-- search bar input -->
        <input
          :class="searchInputBoxClass"
          type="text"
          :placeholder="searchPlaceholder"
          v-model="searchString"
        />

        <!-- 'x' icon to clear the search string -->
        <inline-svg
          v-if="isSearchStringPresent"
          :src="require('@/assets/images/times-light.svg')"
          class="w-10 hover:stroke-2"
          @click="resetSearchString"
        ></inline-svg>

        <!-- search button to perform the search when clicked -->
        <button :class="searchButtonClass" @click="search">
          <span class="w-auto flex justify-end items-center">
            <inline-svg
              :src="require('@/assets/images/search-solid.svg')"
              class="h-5 w-5"
            ></inline-svg>
          </span>
        </button>
      </div>
    </div>

    <!-- table -->
    <!-- structure inspired from https://tailwindui.com/components/application-ui/lists/tables  -->
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div
            class="shadow overflow-hidden border-b border-gray-200 rounded-lg border-l border-r"
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-300">
                <!-- table headers -->
                <tr>
                  <th
                    v-for="(columnName, columnIndex) in columns"
                    @click="sortBy(columnName)"
                    :key="columnName"
                    scope="col"
                    class="sm:py-3 py-1.5 text-left text-xs sm:text-md font-medium text-gray-500 uppercase tracking-wider w-2/3"
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
                <tr
                  v-for="(entry, entryIndex) in filteredData"
                  :key="entry"
                  :class="tableRowClass"
                  @mouseover="tableRowHoverOn(entryIndex)"
                  @mouseout="tableRowHoverOff"
                  @touchstart="tableRowTouchOn(entryIndex)"
                >
                  <td
                    v-for="(columnName, columnIndex) in columns"
                    :key="columnName"
                    class="sm:py-3 py-1.5 whitespace-normal flex relative"
                    :class="getColumnHeaderStyleClass(columnIndex)"
                  >
                    <div
                      class="absolute w-full flex justify-center"
                      :class="tableCellOverlayClass(entryIndex, columnIndex)"
                    >
                      <!-- analyse button -->
                      <icon-button
                        :titleConfig="analyseButtonTitleConfig"
                        :buttonClass="analyseButtonClass"
                        :isDisabled="!isPublished(entryIndex)"
                        @click="analysePlio(entryIndex)"
                        v-tooltip="analyseButtonTooltip(entryIndex)"
                      ></icon-button>
                    </div>
                    <!-- column content -->
                    <div class="flex w-full">
                      <div v-if="isComponent(entry[columnName])" class="w-full">
                        <PlioListItem
                          :plioId="entry[columnName].value"
                          @fetched="savePlioStatus(entryIndex, $event)"
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
                <!-- no search results warning -->
                <tr v-if="isSearchStringPresent && isTableEmpty">
                  <td :colspan="columns.length" class="text-center">
                    <div
                      class="text-xl tracking-tight font-extrabold text-gray-900 sm:text-2xl md:text-3xl inline-flex p-6"
                    >
                      {{ $t("home.table.search.no_plios_found") }}
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
import PlioListItem from "@/components/Collections/ListItems/PlioListItem.vue";
import IconButton from "@/components/UI/Buttons/IconButton";
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
    IconButton,
  },
  data() {
    return {
      sortKey: "", // the key (table column) to sort the table on
      sortOrders: {}, // store the sorting orders of all columns of the table - asc or desc
      searchString: "", // the string to use when filtering the results
      selectedRowIndex: null, // index of the row currently in focus / being hovered on
      isHoverOn: false, // whether a row is being hovered on
      isTouchMode: false, // whether touch events are accepted
      // classes for the analyse button
      analyseButtonClass:
        "bg-red-500 hover:bg-red-700 rounded-md shadow-md h-10 md:h-12 ring-red-500 -mt-2",
      // classes for the table title
      tableTitleClass:
        "flex flex-row gap-2 text-base sm:text-lg md:text-xl xl:text-2xl font-bold p-2 items-center",
      // classes for the search bar container
      searchContainerClass:
        "bg-white rounded-md flex shadow-md border border-grey-light w-full xsm:w-2/3 sm:w-2/3 md:w-1/3 float-right mb-2 mt-2",
      // classes for search bar input box
      searchInputBoxClass: "w-full text-gray-700 leading-tight p-2 focus:outline-none",
      // classes for search bar button
      searchButtonClass:
        "bg-grey-lightest border-grey border-l shadow hover:bg-primary-button p-4 text-primary hover:text-white",
    };
  },

  created() {
    this.initialiseSortOrders();
    this.startLoading();
  },

  watch: {
    searchString(value) {
      // emit a message whenever the search string becomes empty
      if (value == "") this.$emit("reset-search-string");
    },
  },

  computed: {
    ...mapState("sync", ["pending"]),
    isSearchStringPresent() {
      // if a string is present in the search bar
      return this.searchString != "";
    },
    analyseButtonTitleConfig() {
      // title config for the analyse button
      return {
        value: this.$t("home.table.buttons.analyse"),
        class: "p-4 text-white text-lg md:text-xl font-semibold",
      };
    },
    tableRowClass() {
      // class for each row of the table
      return [
        {
          "hover:bg-gray-100 hover:cursor-pointer": this.isHoverOn,
        },
        `active:bg-gray-100`,
      ];
    },
    searchPlaceholder() {
      // placeholder for the search box
      return this.$t("home.table.search.placeholder");
    },
    totalItemsInTable() {
      // total rows present in the table
      return this.filteredData.length || 0;
    },
    isTableEmpty() {
      return this.totalItemsInTable == 0;
    },
    filteredData() {
      // contains the filtered data after applying sorting
      return this.orderBySort(this.data);
    },
    disabledElementClass() {
      // class for elements that need to be disabled
      return {
        "pointer-events-none": this.pending,
      };
    },
  },
  methods: {
    ...mapActions("sync", ["startLoading"]),
    resetSearchString() {
      // start loading
      // reset the search string to an empty string
      this.startLoading();
      this.searchString = "";
    },
    tableRowTouchOn(rowIndex) {
      // invoked when a touch event is triggered for a row in the table
      // redirects to the dashboard page for the selected plio

      // mark that touch events are valid
      if (!this.isTouchMode) this.isTouchMode = true;
      if (this.isPublished(rowIndex) && !this.pending) {
        // only redirect to the dashboard if the plio is published
        this.analysePlio(rowIndex);
      }
    },
    analysePlio(rowIndex) {
      // redirects to the dashboard page for the selected plio
      this.$router.push({
        name: "Dashboard",
        params: { plioId: this.filteredData[rowIndex]["name"]["value"], org: this.org },
      });
    },
    analyseButtonTooltip(rowIndex) {
      // tooltip for the analyse button
      if (!this.isPublished(rowIndex))
        return this.$t(`tooltip.home.table.buttons.analyse_plio.disabled`);
      return this.$t(`tooltip.home.table.buttons.analyse_plio.enabled`);
    },
    isPublished(rowIndex) {
      // whether the plio in the given row is published
      return this.filteredData[rowIndex]["name"]["status"] == "published";
    },
    tableRowHoverOn(rowIndex) {
      // triggered upon hovering over a row
      if (!this.pending && !this.isTouchMode) {
        // only set these variables if touch events are not supported
        this.selectedRowIndex = rowIndex;
        this.isHoverOn = true;
      }
    },
    tableRowHoverOff() {
      // triggered when the hover over a row is exited
      // unset variables when hover is removed
      this.selectedRowIndex = null;
      this.isHoverOn = false;
    },
    isRowSelected(rowIndex) {
      // whether the given row index is selected
      return this.selectedRowIndex == rowIndex;
    },
    tableCellOverlayClass(entryIndex, columnIndex) {
      // class for each cell of the table
      return {
        hidden:
          !this.isLastColumn(columnIndex) ||
          !this.isRowSelected(entryIndex) ||
          this.pending,
      };
    },
    isLastColumn(columnIndex) {
      // whether the given column index is the last column index
      return columnIndex == this.columns.length - 1;
    },
    isFirstColumn(columnIndex) {
      // whether the given column index is the first column index
      return columnIndex == 0;
    },
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
    savePlioStatus(entryIndex, status) {
      // save the plio's status after they are fetched from the PlioListItem

      // Each plio's status us being stored in the filteredData object and that too,
      // inside the "name" key as that key contains the details of plios
      if (this.filteredData != undefined && this.filteredData[entryIndex] != undefined) {
        this.filteredData[entryIndex]["name"] = {
          ...this.filteredData[entryIndex]["name"],
          ...status,
        };
      }
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
        "hidden sm:table-cell": !this.isFirstColumn(columnIndex),
        "sm:px-6 px-3": this.isFirstColumn(columnIndex),
      };
    },
    getSortIconStyleClass(columnName) {
      return {
        "transform rotate-180": this.sortOrders[columnName] == -1,
      };
    },
    search() {
      // emit the search string whenever the user presses the search icon
      this.$emit("search-plios", { searchString: this.searchString });
    },
  },

  emits: ["search-plios", "reset-search-string"],
};
</script>
