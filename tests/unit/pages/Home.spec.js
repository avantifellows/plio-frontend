import { mount } from "@vue/test-utils";
import Home from "@/pages/Home.vue";
import store from "@/store";

import { dummyUser } from "@/services/Testing/DummyData.js";

describe("Home.vue", () => {
  it("renders properly with default values", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);
    const wrapper = mount(Home);
    expect(wrapper).toBeTruthy();
  });
});
