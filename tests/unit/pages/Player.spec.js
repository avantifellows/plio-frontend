import { flushPromises, mount } from "@vue/test-utils";
import Player from "@/pages/Player.vue";
import mockAxios from "jest-mock-axios";
import { dummyAccessToken, dummyItems } from "@/services/Testing/DummyData.js";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Player.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Player);
    expect(wrapper).toBeTruthy();
  });
});
