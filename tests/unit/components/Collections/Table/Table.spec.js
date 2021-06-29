import { mount } from "@vue/test-utils";
import Table from "@/components/Collections/Table/Table";
import { setMatchMedia } from "@/services/Testing/Utilities";

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
    await setMatchMedia(false);
  });

  it("should render with default values", () => {
    const wrapper = mount(Table);
    expect(wrapper).toBeTruthy();
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
});
