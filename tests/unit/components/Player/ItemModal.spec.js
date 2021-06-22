import { mount } from "@vue/test-utils";
import ItemModal from "@/components/Player/ItemModal";

describe("ItemModal.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ItemModal);
    expect(wrapper).toBeTruthy();
  });
});
