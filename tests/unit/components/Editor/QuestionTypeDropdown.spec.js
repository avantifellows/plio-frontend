import { mount } from "@vue/test-utils";
import QuestionTypeDropdown from "@/components/Editor/QuestionTypeDropdown";
import { nextTick } from "vue";

describe("QuestionTypeDropdown.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(QuestionTypeDropdown);
    expect(wrapper).toBeTruthy();
  });

  it("renders options with images correctly", async () => {
    const options = [
      { label: "option 1", value: "1", icon: "radio-button.svg" },
      { label: "option 2", value: "2", icon: "subjective-question.svg" },
    ];
    const wrapper = mount(QuestionTypeDropdown, {
      props: {
        options: options,
      },
      data() {
        return {
          showDropdown: true,
        };
      },
    });
    await nextTick();
    var listItems = wrapper.findAll("li");
    expect(listItems.length).toBe(2);

    const option1 = wrapper.find('[data-test="option-0"]');
    expect(option1.find('[data-test="icon"]').exists()).toBe(true);
    expect(option1.find('[data-test="label"]').text()).toBe(options[0].label);
  });

  it("changes local selected index from prop", async () => {
    const wrapper = mount(QuestionTypeDropdown, {
      props: {
        options: [
          { label: "option 1", value: "1", icon: "radio-button.svg" },
          { label: "option 2", value: "2", icon: "subjective-question.svg" },
        ],
      },
    });

    await wrapper.setProps({
      selectedIndex: 1,
    });
    expect(wrapper.vm.localSelectedIndex).toBe(1);
  });

  it("making dropdown disabled hides dropdown", async () => {
    const hideDropdown = jest.spyOn(
      QuestionTypeDropdown.methods,
      "hideDropdown"
    );
    const wrapper = mount(QuestionTypeDropdown, {
      props: {
        options: [
          { label: "option 1", value: "1", icon: "radio-button.svg" },
          { label: "option 2", value: "2", icon: "subjective-question.svg" },
        ],
      },
      data() {
        return {
          showDropdown: true,
        };
      },
    });

    await wrapper.setProps({
      isDisabled: true,
    });
    expect(hideDropdown).toHaveBeenCalled();
    expect(wrapper.vm.showDropdown).toBe(false);
  });

  it("set selected option from selecting option in dropdown", async () => {
    const setOption = jest.spyOn(QuestionTypeDropdown.methods, "setOption");
    const toggleDropdownDisplay = jest.spyOn(
      QuestionTypeDropdown.methods,
      "toggleDropdownDisplay"
    );
    const wrapper = mount(QuestionTypeDropdown, {
      props: {
        options: [
          { label: "option 1", value: "1", icon: "radio-button.svg" },
          { label: "option 2", value: "2", icon: "subjective-question.svg" },
        ],
      },
      data() {
        return {
          showDropdown: true,
        };
      },
    });

    wrapper.find('[data-test="option-1"]').trigger("click");

    expect(setOption).toHaveBeenCalled();
    expect(toggleDropdownDisplay).toHaveBeenCalled();
    expect(wrapper.vm.localSelectedIndex).toBe(1);
    expect(wrapper.vm.showDropdown).toBe(false);
    expect(wrapper.emitted()).toHaveProperty("update:selectedIndex");
    expect(wrapper.emitted()).toHaveProperty("toggle-visibility");
  });
});
