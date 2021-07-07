import { mount } from "@vue/test-utils";
import Dashboard from "@/pages/Dashboard.vue";

describe("Dashboard.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Dashboard);
    expect(wrapper).toBeTruthy();
  });
});
