import { mount } from "@vue/test-utils";
import OptionDropdown from "@/components/App/OptionDropdown";

describe("OptionDropdown.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(OptionDropdown);
    expect(wrapper).toBeTruthy();
  });

  it("renders options provided as props", async () => {
    const wrapper = mount(OptionDropdown, {
      props: {
        options: [
          {
            value: "a",
            label: "A",
          },
          {
            value: "b",
            label: "B",
          },
        ],
      },
    });
    // no options should exist at first
    expect(wrapper.findAll('[data-test="option"]').length).toBe(0);

    // trigger dropdown
    await wrapper.find('[data-test="toggleButton"]').trigger("click");

    expect(wrapper.findAll('[data-test="option"]').length).toBe(2);
  });

  it("sets margin of the option container correctly", async () => {
    Object.defineProperty(window, "getComputedStyle", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        fontSize: 10,
      })),
    });

    const wrapper = mount(OptionDropdown, {
      props: {
        options: [
          {
            value: "a",
            label: "A",
          },
          {
            value: "b",
            label: "B",
          },
        ],
      },
      global: {
        mocks: {
          getComputedStyle: getComputedStyle,
        },
      },
    });
    expect(wrapper.vm.optionBoxStyling).toStrictEqual({
      "margin-top": "2rem",
    });
  });

  it("sets margin of the option container correctly on scroll", async () => {
    Object.defineProperty(window, "getComputedStyle", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        fontSize: 10,
      })),
    });

    const wrapper = mount(OptionDropdown, {
      props: {
        options: [
          {
            value: "a",
            label: "A",
          },
          {
            value: "b",
            label: "B",
          },
        ],
        scrollY: 100,
      },
    });
    expect(wrapper.vm.optionBoxStyling).toStrictEqual({
      "margin-top": "-80px",
    });
  });
});
