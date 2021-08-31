<template>
  <div class="flex flex-col mx-2 xsm:mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14">
    <!-- nav bar for table : table title and search bar -->
    <div class="flex flex-col xsm:flex-row justify-between pt-4">
      <!-- table title -->
      <div :class="tableTitleClass">
        <p class="whitespace-nowrap">{{ tableTitle }}</p>
        <p v-if="!pending">({{ numTotal }})</p>
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
          autocomplete="off"
          data-test="searchBar"
        />

        <!-- 'x' icon to clear the search string -->
        <inline-svg
          v-if="isSearchStringPresent"
          :src="require('@/assets/images/times-light.svg')"
          class="w-10 hover:stroke-2"
          @click="resetSearchString"
          data-test="resetSearch"
        ></inline-svg>

        <!-- search button to perform the search when clicked -->
        <button
          :class="searchButtonClass"
          @click="search"
          :disabled="!this.isSearchStringPresent"
          data-test="searchButton"
        >
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
                    data-test="tableHeader"
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
                  v-for="(entry, rowIndex) in localData"
                  :key="entry"
                  :class="tableRowClass"
                  @mouseover="tableRowHoverOn(rowIndex)"
                  @mouseout="tableRowHoverOff"
                  data-test="row"
                >
                  <td
                    v-for="(columnName, columnIndex) in columns"
                    :key="columnName"
                    class="sm:py-3 py-1.5 whitespace-normal flex relative"
                    :class="getColumnHeaderStyleClass(columnIndex)"
                  >
                    <div
                      class="absolute w-full flex justify-center"
                      :class="tableCellOverlayClass(rowIndex, columnIndex)"
                    >
                      <!-- analyse button -->
                      <icon-button
                        :titleConfig="analyseButtonTitleConfig"
                        :buttonClass="analyseButtonClass"
                        :isDisabled="!isPublished(rowIndex)"
                        @click="analysePlio(rowIndex)"
                        v-tooltip="analyseButtonTooltip(rowIndex)"
                        v-if="!isTouchDevice"
                        data-test="analyzeButton"
                      ></icon-button>
                    </div>
                    <!-- column content -->
                    <div class="flex w-full">
                      <div v-if="isComponent(entry[columnName])" class="w-full">
                        <PlioListItem
                          :plioId="entry[columnName].value"
                          @fetched="savePlioDetails(rowIndex, $event)"
                          @deleted="deletePlio"
                          :key="entry[columnName].value"
                        >
                        </PlioListItem>
                      </div>

                      <div
                        v-else
                        class="text-sm sm:text-lg xl:text-2xl font-medium text-gray-900"
                      >
                        <!-- skeleton when loading -->
                        <div
                          v-if="pending"
                          class="animate-pulse w-6 bg-gray-500 h-6 rounded-md"
                        ></div>
                        <!-- actual value -->
                        <div v-else>
                          {{ entry[columnName] }}
                        </div>
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
    numTotal: {
      // total number of plios for the user
      default: 0,
      type: Number,
    },
  },
  components: {
    PlioListItem,
    IconButton,
  },
  data() {
    return {
      searchString: "", // the string to use when filtering the results
      selectedRowIndex: null, // index of the row currently in focus / being hovered on
      // classes for the analyse button
      analyseButtonClass:
        "bg-red-500 hover:bg-red-700 rounded-md shadow-md h-10 md:h-12 ring-red-500 -mt-2",
      // classes for the table title
      tableTitleClass:
        "flex flex-row space-x-2 text-base sm:text-lg md:text-xl xl:text-2xl font-bold p-2 items-center",
      // classes for the search bar container
      searchContainerClass:
        "bg-white rounded-md flex shadow-md border border-grey-light w-full xsm:w-2/3 sm:w-2/3 md:w-1/3 float-right mb-2 mt-2",
      // classes for search bar input box
      searchInputBoxClass:
        "w-full text-gray-700 leading-tight p-2 pl-4 focus:outline-none",
      // sort order for the "number of viewers" column. 1 - ascending, -1 - descending
      numViewersSortOrder: 1,
    };
  },

  created() {
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
    isTouchDevice() {
      // detects if the user's device has a touchscreen or not
      return window.matchMedia("(any-pointer: coarse)").matches;
    },
    isSearchStringPresent() {
      // if a string is present in the search bar
      return this.searchString != "";
    },
    searchButtonClass() {
      // classes for search bar button
      return [
        { "pointer-events-none": !this.isSearchStringPresent },
        "bg-grey-lightest border-grey border-l shadow hover:bg-primary-button p-4 text-primary hover:text-white",
      ];
    },
    analyseButtonTitleConfig() {
      // title config for the analyse button
      return {
        value: this.$t("home.table.buttons.analyse"),
        class: "pl-4 pr-4 text-white text-lg md:text-xl font-semibold",
      };
    },
    tableRowClass() {
      // class for each row of the table
      return [{ "hover:bg-gray-100": !this.isTouchDevice }, "hover:cursor-pointer"];
    },
    searchPlaceholder() {
      // placeholder for the search box
      return this.$t("home.table.search.placeholder");
    },
    totalItemsInTable() {
      // total rows present in the table
      if (this.localData == undefined) return 0;
      return this.localData.length || 0;
    },
    isTableEmpty() {
      return this.totalItemsInTable == 0;
    },
    localData() {
      // contains the local copy of the table data
      return this.data;
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
      // starts loading and resets the search string
      this.startLoading();
      this.searchString = "";
    },
    analysePlio(rowIndex) {
      // redirects to the dashboard page for the selected plio
      this.$router.push({
        name: "Dashboard",
        params: { plioId: this.localData[rowIndex]["name"]["value"], org: this.org },
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
      return this.localData[rowIndex]["name"]["status"] == "published";
    },
    tableRowHoverOn(rowIndex) {
      // triggered upon hovering over a row
      if (!this.pending) {
        // only set these variables if touch events are not supported
        this.selectedRowIndex = rowIndex;
      }
    },
    tableRowHoverOff() {
      // triggered when the hover over a row is exited
      // unset variables when hover is removed
      this.selectedRowIndex = null;
    },
    isRowSelected(rowIndex) {
      // whether the given row index is selected
      return this.selectedRowIndex == rowIndex;
    },
    tableCellOverlayClass(rowIndex, columnIndex) {
      // class for each cell of the table
      return {
        hidden:
          !this.isLastColumn(columnIndex) ||
          !this.isRowSelected(rowIndex) ||
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
    sortBy(columnName) {
      // toggle the sort order for "number_of_viewers" column
      // and emit it to the parent
      if (columnName == "number_of_viewers") {
        this.numViewersSortOrder = this.numViewersSortOrder * -1;
        this.$emit(
          "sort-num-viewers",
          this.numViewersSortOrder == -1 ? "-unique_viewers" : "unique_viewers"
        );
      }
    },
    deletePlio() {
      // invoked when a plio is deleted
      this.$emit("delete-plio");
    },
    savePlioDetails(rowIndex, plioDetails) {
      // save the plio's status after they are fetched from the PlioListItem

      // Each plio's status is being stored in the localData object and that too,
      // inside the "name" key as that key contains the details of plios
      if (this.localData != undefined && this.localData[rowIndex] != undefined) {
        this.localData[rowIndex]["name"] = {
          ...this.localData[rowIndex]["name"],
          ...plioDetails,
        };
      }
    },
    getColumnHeaderStyleClass(columnIndex) {
      return {
        "hidden sm:table-cell": !this.isFirstColumn(columnIndex),
        "sm:px-6 px-3": this.isFirstColumn(columnIndex),
      };
    },
    getSortIconStyleClass(columnName) {
      // flip the icon if sort order changes
      // hide the icon for the "name" column
      return {
        "transform rotate-180": this.numViewersSortOrder == -1,
        hidden: columnName == "name",
      };
    },
    search() {
      // emit the search string whenever the user presses the search icon
      this.$emit("search-plios", { searchString: this.searchString });
    },
  },

  emits: ["search-plios", "reset-search-string", "sort-num-viewers", "delete-plio"],
};
</script>
