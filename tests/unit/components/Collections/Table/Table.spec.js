import { mount, flushPromises } from "@vue/test-utils";
import Table from "@/components/Collections/Table/Table";
import { setMatchMedia } from "@/services/Testing/Utilities";
import store from "@/store";
import mockAxios from "jest-mock-axios";
import { dummyPublishedPlio } from "@/services/Testing/DummyData.js";
var clonedeep = require("lodash.clonedeep");

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

  afterEach(() => {
    // cleanup all pending requests from the last test
    mockAxios.reset();
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

  it("does not render analyze button on hover on phone ", async () => {
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
    // num rows (2) x num columns (2)

    // disabled for draft plio
    expect(
      wrapper.findAll('[data-test="analyzeButton"]')[1].element.disabled
    ).toBe(true);

    // not disabled for published plio
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

  it("triggers search on pressing enter when search string non-empty", async () => {
    const search = jest.spyOn(Table.methods, "search");
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

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
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

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
    const wrapper = mount(Table, {
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
    await wrapper.find('[data-test="searchBar"]').setValue("test");
    await wrapper.find('[data-test="searchButton"]').trigger("click");

    // no plios warning should now be shown
    expect(wrapper.find('[data-test="noPliosWarning"]').exists()).toBeTruthy();
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

  it("sorts on arrow click by num viewers", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });
    await wrapper.findAll('[data-test="tableHeader"]')[1].trigger("click");
    expect(wrapper.emitted()).toHaveProperty("sort-num-viewers");
  });

  it("emits after all plios have been loaded", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

    // resolve the two `GET` requests (for each plio) waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[1]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(wrapper.emitted()).toHaveProperty("loaded");
    expect(wrapper.vm.numPliosLoaded).toBe(2);
  });

  it("emits on deleting plio", async () => {
    const wrapper = mount(Table, {
      props: {
        data: dummyTableData,
        columns: tableColumns,
        numTotal: totalNumberOfPlios,
      },
    });

    // the table would be in pending state
    await store.dispatch("sync/stopLoading");

    // cleanup past requests
    mockAxios.reset();

    // find the first plio list item
    const plioListItem = wrapper.findAll('[data-test="plioListItem"]')[0];

    // click the options dropdown
    await plioListItem.find('[data-test="toggleButton"]').trigger("click");

    // click on delete
    await plioListItem
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // click the confirm button of the dialog box
    await plioListItem
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

    // mock the response to the request
    mockAxios.mockResponse(
      {
        status: 204,
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    // check emit
    expect(wrapper.emitted()).toHaveProperty("delete-plio");
  });
});
