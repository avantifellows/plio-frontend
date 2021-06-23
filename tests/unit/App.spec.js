import { mount } from "@vue/test-utils";
import App from "@/App";

describe("App.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(App);
    expect(wrapper).toBeTruthy();
  });
});
