import { mount } from "@vue/test-utils";
import Home from "@/pages/Home.vue";

describe("Home.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Home);
    expect(wrapper).toBeTruthy();
  });
});
