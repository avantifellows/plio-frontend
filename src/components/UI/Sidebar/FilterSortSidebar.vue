<template>
  <div class="bg-white border-l-2 border-black w-1/3">
    <div class="flex flex-col sm:flex-row sm:justify-around">
      <div class="h-screen w-full">
        <div class="flex items-center justify-between bg-primary p-4 -ml-1">
          <span class="text-white ml-4 text-xl font-bold"> Filter & Sort Plios </span>
          <inline-svg
            :src="require('@/assets/images/times-light.svg')"
            class="w-10 text-white hover:stroke-2"
            @click="closeSidebar"
          ></inline-svg>
        </div>
        <nav class="mt-10 px-6">
          <!-- sort by menu -->
          <div
            class="hover:text-gray-800 hover:bg-gray-100 flex rounded-md p-2 my-6"
            @click="toggleSortByMenu"
          >
            <div class="mx-4 text-lg font-normal">Sort By</div>
            <inline-svg
              :src="require('@/assets/images/chevron-down-solid.svg')"
              class="h-3 w-3 my-1 transition ease duration-800"
              :class="{ 'transform rotate-180': isSortMenuVisible }"
            ></inline-svg>
          </div>

          <div>
            <div>
              <input type="checkbox" id="checkbox" v-model="checked" />
              <label for="checkbox">{{ checked }}</label>
            </div>

            <div>
              <input type="checkbox" id="checkbox" v-model="checked" />
              <label for="checkbox">{{ checked }}</label>
            </div>

            <div>
              <input type="checkbox" id="checkbox" v-model="checked" />
              <label for="checkbox">{{ checked }}</label>
            </div>
          </div>

          <a
            class="hover:text-gray-800 hover:bg-gray-100 flex items-center p-2 my-6 transition-colors dark:hover:text-white dark:hover:bg-gray-600 duration-200 text-gray-600 dark:text-gray-400 rounded-lg"
            href="#"
          >
            <span class="mx-4 text-lg font-normal"> Element </span>
            <span class="flex-grow text-right"> </span>
          </a>
          <a
            class="hover:text-gray-800 hover:bg-gray-100 flex items-center p-2 my-6 transition-colors dark:hover:text-white dark:hover:bg-gray-600 duration-200 text-gray-800 dark:text-gray-100 rounded-lg bg-gray-100 dark:bg-gray-600"
            href="#"
          >
            <span class="mx-4 text-lg font-normal"> Form </span>
            <span class="flex-grow text-right"> </span>
          </a>
          <a
            class="hover:text-gray-800 hover:bg-gray-100 flex items-center p-2 my-6 transition-colors dark:hover:text-white dark:hover:bg-gray-600 duration-200 text-gray-600 dark:text-gray-400 rounded-lg"
            href="#"
          >
            <span class="mx-4 text-lg font-normal"> Commerce </span>
            <span class="flex-grow text-right">
              <button
                type="button"
                class="w-6 h-6 text-xs rounded-full text-white bg-red-500"
              >
                <span class="p-1"> 7 </span>
              </button>
            </span>
          </a>
          <a
            class="hover:text-gray-800 hover:bg-gray-100 flex items-center p-2 my-6 transition-colors dark:hover:text-white dark:hover:bg-gray-600 duration-200 text-gray-600 dark:text-gray-400 rounded-lg"
            href="#"
          >
            <span class="mx-4 text-lg font-normal"> Navigation </span>
            <span class="flex-grow text-right"> </span>
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterSortSidebar",
  data() {
    return {
      isSortMenuVisible: false,
    };
  },
  methods: {
    closeSidebar() {
      this.$emit("close-sidebar");
    },
    toggleSortByMenu() {
      this.isSortMenuVisible = !this.isSortMenuVisible;
    },
  },
  emits: ["close-sidebar"],
};
</script>
