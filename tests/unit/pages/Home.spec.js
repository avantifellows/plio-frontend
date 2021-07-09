import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import Home from "@/pages/Home.vue";
import store from "@/store";

import mockAxios from "jest-mock-axios";
import { dummyUser } from "@/services/Testing/DummyData.js";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Home.vue", () => {
  it("renders properly with default values", async () => {
    const wrapper = mount(Home);
    expect(wrapper).toBeTruthy();
  });

  it("renders plios for approved user with no plios", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // mock method to fetch dashboard metrics from analytics client
    const getAllPlios = jest
      .spyOn(PlioAPIService, "getAllPlios")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({
            data: {
              count: 0,
              page_size: 5,
              results: [],
            },
          });
        });
      });
    const wrapper = mount(Home);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(getAllPlios).toHaveBeenCalled();
    expect(wrapper.find('[data-test="table"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="noPlio"]').exists()).toBe(true);
  });
});
