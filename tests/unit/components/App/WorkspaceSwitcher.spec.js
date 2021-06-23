import { mount } from "@vue/test-utils";
import WorkspaceSwitcher from "@/components/App/WorkspaceSwitcher";

describe("WorkspaceSwitcher.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(WorkspaceSwitcher);
    expect(wrapper).toBeTruthy();
  });
});
