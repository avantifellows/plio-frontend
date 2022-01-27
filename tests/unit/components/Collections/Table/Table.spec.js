import { mount, flushPromises } from "@vue/test-utils";
import Table from "@/components/Collections/Table/Table";
import store from "@/store";
import mockAxios from "jest-mock-axios";
let clonedeep = require("lodash.clonedeep");

let dummyTableData = [
  {
    name: {
      type: "component",
      value: global.dummyPublishedPlio.data,
      status: "draft",
    },
    views: "0",
  },
  {
    name: {
      type: "component",
      value: global.dummyPublishedPlio.data,
      status: "published",
    },
    views: "10",
  },
];

const tableColumns = ["name", "views"];
const totalNumberOfPlios = dummyTableData.length;

describe("Table.vue", () => {
  let wrapper;
  beforeEach(async () => {
    await store.dispatch("sync/stopLoading");
    global.setMatchMedia(false);
  });

  afterEach(() => {
    // cleanup all pending requests from the last test
    mockAxios.reset();
    wrapper.unmount();
  });

  it("should render with default values", () => {
    wrapper = mount(Table);
    expect(wrapper.vm.totalItemsInTable).toBe(0);
    expect(wrapper.vm.isTableEmpty).toBe(true);
  });

  describe("props are passed", () => {
    const mountWrapper = (
      params = {
        props: {
          data: dummyTableData,
          columns: tableColumns,
          numTotal: totalNumberOfPlios,
        },
      }
    ) => {
      wrapper = mount(Table, params);
    };

    beforeEach(() => {
      mountWrapper();
    });

    it("renders the right number of rows", async () => {
      expect(wrapper.findAll("th").length).toBe(dummyTableData.length);
      expect(wrapper.vm.totalItemsInTable).toBe(dummyTableData.length);
      expect(wrapper.vm.isTableEmpty).toBe(false);
    });

    it("clearing search string resets search", async () => {
      await wrapper.find('[data-test="searchBar"]').setValue("test");
      await wrapper.find('[data-test="searchBar"]').setValue("");

      expect(wrapper.emitted()).toHaveProperty("reset-search-string");
    });

    it("resets search string on button click", async () => {
      const resetSearchString = jest.spyOn(Table.methods, "resetSearchString");
      mountWrapper();

      await wrapper.find('[data-test="searchBar"]').setValue("test");

      wrapper.find('[data-test="resetSearch"]').trigger("click");
      expect(resetSearchString).toHaveBeenCalled();
      expect(wrapper.vm.searchString).toBeFalsy();
    });

    it("does not trigger search on button click when search string empty", async () => {
      const search = jest.spyOn(Table.methods, "search");
      mountWrapper();

      await wrapper.find('[data-test="searchButton"]').trigger("click");

      expect(search).not.toHaveBeenCalled();
    });

    it("triggers search on button click when search string non-empty", async () => {
      const search = jest.spyOn(Table.methods, "search");
      mountWrapper();

      await wrapper.find('[data-test="searchBar"]').setValue("test");
      await wrapper.find('[data-test="searchButton"]').trigger("click");

      expect(search).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("search-plios");
    });

    it("triggers search on pressing enter when search string non-empty", async () => {
      const search = jest.spyOn(Table.methods, "search");
      mountWrapper();

      // enter some search string
      await wrapper.find('[data-test="searchBar"]').setValue("test");

      // trigger the enter key press
      await wrapper.find('[data-test="searchBar"]').trigger("keypress", {
        key: "Enter",
      });

      expect(search).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("search-plios");
    });

    it("does not trigger search on pressing enter when search string empty", async () => {
      const search = jest.spyOn(Table.methods, "search");
      mountWrapper();

      // trigger the enter key press
      await wrapper.find('[data-test="searchBar"]').trigger("keypress", {
        key: "Enter",
      });

      /**
       * since we did not set any value for the search string, it would be
       * empty and hence, the search function should not be called
       */
      expect(search).not.toHaveBeenCalled();
    });

    it("shows warning on search when there are no plios matching the search string", async () => {
      mountWrapper({
        props: {
          data: [],
          columns: tableColumns,
          numTotal: totalNumberOfPlios,
        },
      });
      await store.dispatch("sync/stopLoading");

      // no plios warning should not be shown at first
      expect(wrapper.find('[data-test="noPliosWarning"]').exists()).toBeFalsy();

      // enter some search string that would not match any of the plios
      await wrapper
        .find('[data-test="searchBar"]')
        .setValue("someRandomString");
      await wrapper.find('[data-test="searchButton"]').trigger("click");

      // no plios warning should now be shown
      expect(
        wrapper.find('[data-test="noPliosWarning"]').exists()
      ).toBeTruthy();
    });

    it("selects row on hover", async () => {
      const tableRowHoverOn = jest.spyOn(Table.methods, "tableRowHoverOn");
      mountWrapper();

      // the table would be in pending state
      await store.dispatch("sync/stopLoading");
      await wrapper.findAll('[data-test="row"]')[0].trigger("mouseover");

      expect(tableRowHoverOn).toHaveBeenCalled();
      expect(wrapper.vm.selectedRowIndex).toBe(0);
    });

    it("deselects row on removing hover", async () => {
      const tableRowHoverOff = jest.spyOn(Table.methods, "tableRowHoverOff");
      mountWrapper();
      await wrapper.setData({
        selectedRowIndex: 0,
      });
      await wrapper.findAll('[data-test="row"]')[0].trigger("mouseout");

      expect(tableRowHoverOff).toHaveBeenCalled();
      expect(wrapper.vm.selectedRowIndex).toBe(null);
    });

    it("sorts on arrow click by num viewers", async () => {
      await wrapper.findAll('[data-test="tableHeader"]')[1].trigger("click");
      expect(wrapper.emitted()).toHaveProperty("sort-num-viewers");
    });

    it("emits on deleting plio", async () => {
      wrapper.vm.$refs.plio[0].$emit("deleted");

      // check emit
      expect(wrapper.emitted()).toHaveProperty("delete-plio");
    });
  });
});
