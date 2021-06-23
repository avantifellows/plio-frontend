import { mount } from "@vue/test-utils";
import LocaleSwitcher from "@/components/App/LocaleSwitcher";

describe("LocaleSwitcher.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(LocaleSwitcher);
    expect(wrapper).toBeTruthy();
  });
});
