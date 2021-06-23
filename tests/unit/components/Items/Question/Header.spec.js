import { mount } from "@vue/test-utils";
import Header from "@/components/Items/Question/Header";

describe("Header.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Header);
    expect(wrapper).toBeTruthy();
  });
});
