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
});
