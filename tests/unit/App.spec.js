import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { routes } from "@/router";
import App from "@/App";

describe("App.vue", () => {
  it("should render with default values", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });
    router.push("/");

    // After this line, router is ready
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
      stubs: {
        "vue-progress-bar": true,
      },
    });
    expect(wrapper.vm.isAuthenticated).toBeFalsy();
    expect(wrapper).toBeTruthy();
  });
});
