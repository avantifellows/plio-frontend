<template>
  <div
    v-if="showPaginator"
    class="bg-white px-4 py-3 flex items-center justify-between sm:px- mx-2 bp-360:mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14"
  >
    <!-- paginator for smaller screens -->
    <div class="flex-1 flex justify-between sm:hidden">
      <!-- previous button -->
      <button
        @click="setAndRouteToPage(paginatorDetails.currentPage - 1)"
        :class="[previousButtonClass, 'rounded-md']"
        :disabled="isFirstPage"
        data-test="smallPrevious"
      >
        {{ $t("home.paginator.previous") }}
      </button>
      <!-- next button -->
      <button
        @click="setAndRouteToPage(paginatorDetails.currentPage + 1)"
        :class="[nextButtonClass, 'rounded-md']"
        :disabled="isLastPage"
        data-test="smallNext"
      >
        {{ $t("home.paginator.next") }}
      </button>
    </div>

    <!-- paginator for bigger screens -->
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <!-- skeleton details -->
      <div
        v-if="pending"
        class="animate-pulse px-4 py-3 rounded-md w-1/4 bg-gray-300"
      ></div>

      <!-- details -->
      <div v-else>
        <p class="text-sm text-gray-700">
          <span class="font-medium">{{ paginatorDetails.startItemIndex + 1 }}</span>
          {{ " " + $t("home.paginator.description.to") + " " }}
          <span class="font-medium">{{ paginatorDetails.endItemIndex + 1 }}</span>
          {{ $t("home.paginator.description.of") }}
          <span class="font-medium" data-test="totalItems">{{ totalItems }}</span>
          {{ " " + $t("home.paginator.description.plios") }}
        </p>
      </div>

      <!-- pagingator nav bar -->
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <!-- "First" button -->
          <button
            @click="setAndRouteToPage(1)"
            :class="[previousButtonClass, 'rounded-l-md']"
            :disabled="isFirstPage"
          >
            {{ $t("home.paginator.first") }}
          </button>

          <!-- "Previous button" -->
          <button
            @click="setAndRouteToPage(paginatorDetails.currentPage - 1)"
            :class="previousButtonClass"
            :disabled="isFirstPage"
          >
            {{ $t("home.paginator.previous") }}
          </button>

          <!-- individual page numbers -->
          <button
            v-for="(pageNumber, index) in paginatorDetails.pageNumbers"
            :key="pageNumber"
            :class="setPageButtonClass(pageNumber)"
            @click="setAndRouteToPage(pageNumber)"
            :disabled="paginatorDetails.currentPage === pageNumber"
            :data-test="`pageButton-${index}`"
          >
            {{ pageNumber }}
          </button>

          <!-- "Next" button -->
          <button
            @click="setAndRouteToPage(paginatorDetails.currentPage + 1)"
            :class="nextButtonClass"
            :disabled="isLastPage"
          >
            {{ $t("home.paginator.next") }}
          </button>

          <!-- "Last" button -->
          <button
            @click="setAndRouteToPage(paginatorDetails.totalPages)"
            :class="[nextButtonClass, 'rounded-r-md']"
            :disabled="isLastPage"
          >
            {{ $t("home.paginator.last") }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Paginator",
  data() {
    return {
      // contails all the details that will be used to navigate
      // and render the paginator
      paginatorDetails: {},
      // styling class for the skeleton buttons
      skeletonButtonClass:
        "items-center px-6 py-4 mx-1 border border-gray-300 bg-gray-300",
    };
  },

  props: {
    totalItems: {
      // total items that need to be paginated
      type: Number,
      required: true,
    },
    initialPage: {
      // first page
      type: Number,
      default: 1,
    },
    pageSize: {
      // number of items to show on one page
      type: Number,
      default: 10,
    },
    maxPagesToShow: {
      // max pages to be shown in the nav bar
      type: Number,
      default: 5,
    },
  },

  created() {
    // populate paginator details for the initial page
    this.paginatorDetails = this.paginate(this.initialPage);
  },

  watch: {
    totalItems() {
      // if the number of items change, calculate the paginator details again
      this.paginatorDetails = this.paginate(this.initialPage);
    },
  },

  methods: {
    setPageButtonClass(page) {
      // set style classe for the page number buttons
      return [
        {
          "bg-primary cursor-not-allowed hover:bg-primary":
            this.paginatorDetails.currentPage === page && !this.pending,
          "animate-pulse bg-gray-300 text-opacity-0 hover:bg-gray-300": this.pending,
        },
        `relative inline-flex items-center px-4 py-2 border border-gray-300
          bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none`,
      ];
    },
    setAndRouteToPage(pageNumber) {
      // route to the selected page and update the paginator details accordingly
      this.$emit("page-selected", { pageNumber: pageNumber });
      this.paginatorDetails = this.paginate(pageNumber);
    },

    paginate(currentPage) {
      // takes in the page number as argument and calculates the paginator details
      // that are used for rendering the paginator nav bar

      // inspired from
      // https://jasonwatmore.com/post/2018/08/07/javascript-pure-pagination-logic-in-vanilla-js-typescript

      // calculate total pages
      let totalPages = Math.ceil(this.totalItems / this.pageSize);

      let startPageNumber; // starting page number to be shown on the navigator
      let endPageNumber; // ending page number to be shown on the navigator

      if (totalPages <= this.maxPagesToShow) {
        // total pages less than max pages to show so show all pages
        startPageNumber = 1;
        endPageNumber = totalPages;
      } else {
        // total pages more than the max pages allowed
        // need to calculate start and end page numbers
        let maxPagesBeforeCurrentPage = Math.floor(this.maxPagesToShow / 2);
        let maxPagesAfterCurrentPage = Math.ceil(this.maxPagesToShow / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
          // current page near the start
          startPageNumber = 1;
          endPageNumber = this.maxPagesToShow;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
          // current page near the end
          startPageNumber = totalPages - this.maxPagesToShow + 1;
          endPageNumber = totalPages;
        } else {
          // current page somewhere in the middle
          startPageNumber = currentPage - maxPagesBeforeCurrentPage;
          endPageNumber = currentPage + maxPagesAfterCurrentPage;
        }
      }

      // calculate start and end item indexes
      let startItemIndex = (currentPage - 1) * this.pageSize;
      let endItemIndex = Math.min(
        startItemIndex + this.pageSize - 1,
        this.totalItems - 1
      );

      // create an array of page numbers to be shown in the navigation bar
      let pageNumbers = Array.from(Array(endPageNumber - startPageNumber + 1).keys()).map(
        (i) => startPageNumber + i
      );

      // return object with all paginator details
      return {
        pageNumbers: pageNumbers,
        currentPage: currentPage,
        totalPages: totalPages,
        startPageNumber: startPageNumber,
        endPageNumber: endPageNumber,
        startItemIndex: startItemIndex,
        endItemIndex: endItemIndex,
      };
    },
  },

  computed: {
    ...mapState("sync", ["pending"]),
    showPaginator() {
      // to show the paginator or not
      return (
        this.paginatorDetails.pageNumbers && this.paginatorDetails.pageNumbers.length
      );
    },
    isFirstPage() {
      // if the current page is the first page or not
      return this.paginatorDetails.currentPage === 1;
    },
    isLastPage() {
      // if the current page is the last page or not
      return this.paginatorDetails.currentPage === this.paginatorDetails.totalPages;
    },
    previousButtonClass() {
      return [
        {
          "opacity-50 cursor-not-allowed hover:text-gray-700 hover:bg-white": this
            .isFirstPage,
          "sm:animate-pulse sm:bg-gray-300 sm:text-opacity-0 sm:hover:bg-gray-300": this
            .pending,
          "hover:text-gray-500": !this.pending,
        },
        `relative inline-flex items-center px-4 sm:px-2 py-2 border border-gray-300
          bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none
          active:bg-primary`,
      ];
    },

    nextButtonClass() {
      return [
        {
          "opacity-50 cursor-not-allowed hover:text-gray-700 hover:bg-white": this
            .isLastPage,
          "sm:animate-pulse sm:bg-gray-300 sm:text-gray-300 sm:hover:bg-gray-300 active": this
            .pending,
          "hover:text-gray-500": !this.pending,
        },
        `relative inline-flex items-center px-4 sm:px-2 py-2 border border-gray-300
          bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none
          active:bg-primary`,
      ];
    },
  },

  emits: ["page-selected"],
};
</script>
