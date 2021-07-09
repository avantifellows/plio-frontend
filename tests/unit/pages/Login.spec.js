import { mount } from "@vue/test-utils";
import Login from "@/pages/Login.vue";

describe("Login.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Login);
    expect(wrapper).toBeTruthy();
  });
});
