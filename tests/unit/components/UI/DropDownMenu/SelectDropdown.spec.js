import { mount } from "@vue/test-utils";
import SelectDropdown from "@/components/UI/DropDownMenu/SelectDropdown";

const optionsList = [
  {
    label: "Option 1",
    value: "1",
  },
  {
    label: "Option 2",
    value: "2",
  },
];

describe("SelectDropdown.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(SelectDropdown);
    expect(wrapper).toBeTruthy();
  });

  it("renders options list correctly", () => {
    const wrapper = mount(SelectDropdown, {
      props: {
        optionsList,
      },
    });
    expect(wrapper.find("option").html()).toContain(optionsList[0].label);
    expect(wrapper.find("option").element.value).toMatch(optionsList[0].value);
    expect(wrapper.find("option:nth-child(2)").html()).toContain(
      optionsList[1].label
    );
    expect(wrapper.find("option:nth-child(2)").element.value).toMatch(
      optionsList[1].value
    );
  });
});
