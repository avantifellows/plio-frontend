import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Dashboard from "@/pages/Dashboard.vue";
import { dummyPlio, dummyItems } from "@/services/Testing/DummyData.js";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Dashboard.vue", () => {
  it("renders properly for a given Plio", () => {
    const plioId = "abc";
    const wrapper = mount(Dashboard, {
      props: {
        plioId: plioId,
      },
    });
    expect(wrapper).toBeTruthy();
    // `getPlio` inside services/API/Plio.js should've been called
    // 2 `GET` requests are made
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);
    expect(mockAxios.get).toHaveBeenCalledWith("/items/", {
      params: { plio: `${plioId}` },
    });
  });
});
