<template>
  <!-- search -->
  <div>
    <form id="search">Search <input name="query" v-model="filterKey" /></form>
  </div>

  <!-- table -->
  <div class="container mx-auto shadow-xl max-w-6xl">
    <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
      <div class="inline-block min-w-full shadow rounded-lg overflow-hidden">
        <table class="table-auto min-w-full leading-normal">
          <!-- headers -->
          <thead>
            <tr>
              <th
                v-for="key in columns"
                @click="sortBy(key)"
                :key="key"
                class="px-5 py-2 bg-white border-b-8 border-gray-200 text-gray-800 text-left text-md uppercase font-medium w-1/3"
              >
                <div class="flex justify-center">
                  <div class="p-1">
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

          <!-- table body -->
          <tbody>
            <tr v-for="entry in filteredData" :key="entry">
              <td
                v-for="columnName in columns"
                :key="columnName"
                class="px-5 py-5 border-b-4 border-gray-200 bg-white text-2xl"
              >
                <div>
                  <div v-if="isComponent(entry[columnName])" class="text-left">
                    <PlioListItem :plioId="entry[columnName].value"> </PlioListItem>
                  </div>

                  <div v-else class="text-center">
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
</template>

<script>
import PlioListItem from "@/components/UI/ListItems/PlioListItem.vue";

export default {
  props: {
    data: Array,
    columns: Array,
  },
  components: {
    PlioListItem,
  },
  data() {
    return {
      sortKey: "",
      filterKey: "",
      sortOrders: {},
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
