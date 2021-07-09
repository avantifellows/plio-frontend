import { mount } from "@vue/test-utils";
import axios from "axios";
import Dashboard from "@/pages/Dashboard.vue";

// Following lines tell Jest to mock any call to `axios.get`
jest.mock("axios", () => ({
  get: jest.fn(),
}));

describe("Dashboard.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Dashboard, {
      props: {
        plioId: "abc",
      },
    });
    expect(wrapper).toBeTruthy();
    expect(axios.get).toHaveBeenCalledTimes(2);

    console.log(wrapper.vm.videoID);
  });
});
