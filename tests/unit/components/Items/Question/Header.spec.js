// import { calculateButtonPosition } from "@/components/Items/Question/HeaderUtils";
import { mount } from "@vue/test-utils";
import Header from "@/components/Items/Question/Header";

// jest.mock("@/components/Items/Question/HeaderUtils")
// beforeEach(() => calculateButtonPosition.mockClear())

global.document.getElementById = jest.fn(() => ({
  getBoundingClientRect: jest.fn(),
}));

describe("Header.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Header);
    expect(wrapper).toBeTruthy();
  });

  it("should render when modal minimized", () => {
    const wrapper = mount(Header, {
      props: {
        isModalMinimized: true,
      },
    });
    expect(wrapper).toBeTruthy();
  });

  it("should render when in preview mode", () => {
    const wrapper = mount(Header, {
      props: {
        previewMode: true,
      },
    });
    expect(wrapper).toBeTruthy();
  });

  it("should render with default values", () => {
    const wrapper = mount(Header);
    expect(wrapper).toBeTruthy();
  });

  it("clicking skip button works correctly", () => {
    const wrapper = mount(Header);
    wrapper.find('[data-test="skip"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("skip-question");
  });

  it("clicking minimize modal works correctly", async () => {
    const calculateButtonPositionMock = jest.spyOn(
      Header.methods,
      "calculateButtonPosition"
    );
    const getLeftCenterCoordinatesMock = jest.spyOn(
      Header.methods,
      "getLeftCenterCoordinates"
    );
    const wrapper = mount(Header);
    await wrapper.find('[data-test="minimize"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("toggle-minimize");
    expect(calculateButtonPositionMock).toHaveBeenCalled();
    expect(getLeftCenterCoordinatesMock).toHaveBeenCalled();
  });

  it("clicking minimize modal with fullscreen works correctly", async () => {
    const calculateButtonPositionMock = jest.spyOn(
      Header.methods,
      "calculateButtonPosition"
    );
    const getLeftCenterCoordinatesMock = jest.spyOn(
      Header.methods,
      "getLeftCenterCoordinates"
    );
    const wrapper = mount(Header, {
      props: {
        isFullscreen: true,
      },
    });
    await wrapper.find('[data-test="minimize"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("toggle-minimize");
    expect(calculateButtonPositionMock).toHaveBeenCalled();
    expect(getLeftCenterCoordinatesMock).toHaveBeenCalled();
  });
});
