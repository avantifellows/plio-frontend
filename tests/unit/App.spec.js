import { mount } from "@vue/test-utils";
import UserAPIService from "@/services/API/User.js";
import router from "@/router";
import store from "@/store";
import App from "@/App";
import { dummyAccessToken, dummyUser } from "@/services/Testing/DummyData.js";

describe("App.vue", () => {
  let wrapper;

  it("should render for unauthenticated user", async () => {
    router.push("/");

    wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.vm.isAuthenticated).toBeFalsy();
    expect(wrapper).toBeTruthy();
  });

  it("should render for authenticated user", async () => {
    // mock user service
    jest
      .spyOn(UserAPIService, "getUserByAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyUser });
        });
      });

    // set user
    await store.dispatch("auth/setAccessToken", dummyAccessToken);

    router.push("/home");

    wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    // After this line, router is ready
    await router.isReady();

    expect(wrapper.vm.isAuthenticated).toBeTruthy();
    console.log(wrapper.vm.pending);
  });
});
