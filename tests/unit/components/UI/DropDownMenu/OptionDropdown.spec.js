import { mount } from "@vue/test-utils";
import OptionDropdown from "@/components/UI/DropDownMenu/OptionDropdown";

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
    expect(wrapper.find('[data-test="option-a"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="option-b"]').exists()).toBeFalsy();

    // trigger dropdown
    await wrapper.find('[data-test="toggleButton"]').trigger("click");

    expect(wrapper.find('[data-test="option-a"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="option-b"]').exists()).toBeTruthy();
  });

  it("sets margin of the option container correctly", async () => {
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

  it("closes dropdown after clicking on button when it's opened", async () => {
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
    // trigger dropdown
    await wrapper.find('[data-test="toggleButton"]').trigger("click");

    // options show up
    expect(wrapper.find('[data-test="option-a"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="option-b"]').exists()).toBeTruthy();

    // close dropdown
    await wrapper.find('[data-test="toggleButton"]').trigger("click");

    // options should be gone
    expect(wrapper.find('[data-test="option-a"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="option-b"]').exists()).toBeFalsy();
  });

  it("changing default margin rem updates box styling", async () => {
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
    // update default margin rem
    await wrapper.setData({
      defaultOptionMarginRem: 10,
    });

    expect(wrapper.vm.optionBoxStyling).toEqual({
      "margin-top": "10rem",
    });
  });

  it("changing default margin rem and scrollY updates box styling", async () => {
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
    // update default margin rem
    await wrapper.setData({
      defaultOptionMarginRem: 8,
    });

    await wrapper.setProps({
      scrollY: 100,
    });

    expect(wrapper.vm.optionBoxStyling).toEqual({
      "margin-top": "-20px",
    });
  });
});
