import { mount } from "@vue/test-utils";
import PlioListItem from "@/components/Collections/ListItems/PlioListItem";

describe("PlioListItem.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(PlioListItem);
    expect(wrapper).toBeTruthy();
  });
});
