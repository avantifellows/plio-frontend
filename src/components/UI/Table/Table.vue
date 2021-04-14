<template>
  <!-- search -->
  <div class="p-8">
    <div class="bg-white flex items-center rounded-full shadow-md border-2 max-w-sm">
      <form id="search" class="w-full">
        <input
          class="rounded-l-full w-full py-4 px-6 text-gray-700 leading-tight focus:outline-none"
          placeholder="Search"
          name="query"
          v-model="filterKey"
        />
      </form>

      <div class="p-4">
        <icon-button
          class="w-8 h-8"
          :iconConfig="searchIconConfig"
          :buttonClass="searchButtonClass"
        ></icon-button>
      </div>
    </div>
  </div>

  <!-- table -->
  <!-- structure inspired from https://tailwindui.com/components/application-ui/lists/tables  -->
  <div class="flex flex-col mx-10">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-200">
              <tr>
                <th
                  v-for="key in columns"
                  @click="sortBy(key)"
                  :key="key"
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-5"
                >
                  <div class="flex">
                    <div class="p-1 my-auto">
                      {{ capitalize(key) }}
                    </div>
                    <div class="p-1 my-auto">
                      <inline-svg
                        :src="require('@/assets/images/chevron-down-solid.svg')"
                        class="h-3 w-3 my-1"
                      ></inline-svg>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in filteredData" :key="entry">
                <td
                  v-for="columnName in columns"
                  :key="columnName"
                  class="px-6 py-4 whitespace-normal"
                >
                  <div class="flex items-center">
                    <div v-if="isComponent(entry[columnName])" class="text-left">
                      <PlioListItem :plioId="entry[columnName].value"> </PlioListItem>
                    </div>

                    <div v-else class="sm:text-lg text-sm font-medium text-gray-900">
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
</template>

<script>
import PlioListItem from "@/components/UI/ListItems/PlioListItem.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  props: {
    data: Array,
    columns: Array,
  },
  components: {
    PlioListItem,
    IconButton,
  },
  data() {
    return {
      sortKey: "",
      filterKey: "",
      sortOrders: {},
      searchIconConfig: {
        enabled: true,
        iconName: "search-solid",
        iconClass: "text-yellow-600 h-5 w-5",
      },
      searchButtonClass: "",
    };
  },

  created() {
    this.initialiseSortOrders();
  },

  computed: {
    filteredData() {
      // TODO - sorting and filtering

      // const sortKey = this.sortKey;
      // const filterKey = this.filterKey && this.filterKey.toLowerCase();
      // const order = this.sortOrders[sortKey] || 1;
      let data = this.data;
      // if (filterKey) {
      //   data = data.filter(function (row) {
      //     return Object.keys(row).some(function (key) {
      //       return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
      //     });
      //   });
      // }
      // if (sortKey) {
      //   data = data.slice().sort(function (a, b) {
      //     a = a[sortKey];
      //     b = b[sortKey];
      //     return (a === b ? 0 : a > b ? 1 : -1) * order;
      //   });
      // }
      return data;
    },
  },
  methods: {
    isComponent(value) {
      return value.type == "component";
    },
    initialiseSortOrders() {
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
      this.sortKey = key;
      this.sortOrders[key] = this.sortOrders[key] * -1;
    },
  },
};
</script>
