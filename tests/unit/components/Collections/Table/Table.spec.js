import { mount } from "@vue/test-utils";
import Table from "@/components/Collections/Table/Table";
import { setMatchMedia } from "@/services/Testing/Utilities";
import store from "@/store";

var dummyTableData = [
  {
    name: { type: "component", value: "123", status: "draft" },
    number_of_viewers: "0",
  },
  {
    name: { type: "component", value: "234", status: "published" },
    number_of_viewers: "10",
  },
];

const tableColumns = ["name", "number_of_viewers"];
const totalNumberOfPlios = dummyTableData.length;

describe("Table.vue", () => {
  beforeEach(async () => {
    await store.dispatch("sync/stopLoading");
    await setMatchMedia(false);
  });

  it("should render with default values", () => {
    const wrapper = mount(Table);
    expect(wrapper.vm.totalItemsInTable).toBe(0);
    expect(wrapper.vm.isTableEmpty).toBe(true);
  });

  it("renders the right number of rows ", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });
    expect(wrapper.findAll("th").length).toBe(dummyTableData.length);
    expect(wrapper.vm.totalItemsInTable).toBe(dummyTableData.length);
    expect(wrapper.vm.isTableEmpty).toBe(false);

    // number of rows * number of columns (the button is rendered for each columns
    // but is hidden on all columns except the last column)
    expect(wrapper.findAll('[data-test="analyzeButton"]').length).toBe(4);
  });

  it("does not render analyze on phone ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });
    expect(wrapper.findAll('[data-test="analyzeButton"]').length).toBe(0);
  });

  it("does not render analyze on pending", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
      data() {
        return {
          selectedRowIndex: 0,
        };
      },
    });

    store.dispatch("sync/startLoading");
    expect(wrapper.vm.tableCellOverlayClass(0, 1)).toEqual({ hidden: true });
  });

  it("analyze button should be disabled for draft plio ", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });
    // the button is rendered for each columns but is hidden on all columns
    // except the last column
    expect(
      wrapper.findAll('[data-test="analyzeButton"]')[1].element.disabled
    ).toBe(true);
    expect(
      wrapper.findAll('[data-test="analyzeButton"]')[3].element.disabled
    ).toBe(false);
  });

  it("clicking analyze routes to Dashboard ", async () => {
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

    wrapper.findAll('[data-test="analyzeButton"]')[3].trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Dashboard",
      params: {
        org: "",
        plioId: dummyTableData[1]["name"]["value"],
      },
    });
  });

  it("clearing search string resets search", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

    await wrapper.find('[data-test="searchBar"]').setValue("test");
    await wrapper.find('[data-test="searchBar"]').setValue("");

    expect(wrapper.emitted()).toHaveProperty("reset-search-string");
  });

  it("resets search string on button click", async () => {
    const resetSearchString = jest.spyOn(Table.methods, "resetSearchString");
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

    await wrapper.find('[data-test="searchBar"]').setValue("test");

    wrapper.find('[data-test="resetSearch"]').trigger("click");
    expect(resetSearchString).toHaveBeenCalled();
    expect(wrapper.vm.searchString).toBeFalsy();
  });

  it("does not trigger search on button click when search string empty", async () => {
    const search = jest.spyOn(Table.methods, "search");
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

    await wrapper.find('[data-test="searchButton"]').trigger("click");

    expect(search).not.toHaveBeenCalled();
  });

  it("triggers search on button click when search string non-empty", async () => {
    const search = jest.spyOn(Table.methods, "search");
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

    await wrapper.find('[data-test="searchBar"]').setValue("test");
    await wrapper.find('[data-test="searchButton"]').trigger("click");

    expect(search).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("search-plios");
  });

  it("selects row on hover", async () => {
    const tableRowHoverOn = jest.spyOn(Table.methods, "tableRowHoverOn");
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });
    // the table would be in pending state
    await store.dispatch("sync/stopLoading");
    await wrapper.findAll('[data-test="row"]')[0].trigger("mouseover");

    expect(tableRowHoverOn).toHaveBeenCalled();
    expect(wrapper.vm.selectedRowIndex).toBe(0);
  });

  it("deselects row on removing hover", async () => {
    const tableRowHoverOff = jest.spyOn(Table.methods, "tableRowHoverOff");
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
      data() {
        return {
          selectedRowIndex: 0,
        };
      },
    });
    await wrapper.findAll('[data-test="row"]')[0].trigger("mouseout");

    expect(tableRowHoverOff).toHaveBeenCalled();
    expect(wrapper.vm.selectedRowIndex).toBe(null);
  });
});
