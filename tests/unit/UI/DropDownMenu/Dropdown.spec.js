import { shallowMount } from "@vue/test-utils";
import Dropdown from "@/components/UI/DropDownMenu/Dropdown";

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

describe("Dropdown.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = shallowMount(Dropdown);
    expect(wrapper).toBeTruthy();
  });

  it("renders options list correctly", () => {
    const wrapper = shallowMount(Dropdown, {
      props: {
        optionsList,
      },
    });
    expect(wrapper.find("option").html()).toContain(optionsList[0].label);
    expect(wrapper.find("option").element.value).toMatch(optionsList[0].value);
  });
});
