import { flushPromises, mount } from "@vue/test-utils";
import Player from "@/pages/Player.vue";
import mockAxios from "jest-mock-axios";
import {
  dummyAccessToken,
  dummyItemResponses,
  dummyItems,
} from "@/services/Testing/DummyData.js";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Player.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Player);
    expect(wrapper).toBeTruthy();
  });

  it("detects and handles SAML SSO", async () => {
    const wrapper = mount(Player);

    // no SSO in the beginning
    expect(wrapper.vm.isThirdPartyAuth).not.toBeTruthy();
    // setting props for SS)
    await wrapper.setProps({
      thirdPartyApiKey: "apiKey",
      thirdPartyUniqueId: "0000000000",
    });
    // SSO should be detected by now
    expect(wrapper.vm.isThirdPartyAuth).toBeTruthy();
  });

  it("handles SAML SSO", async () => {
    const apiKey = "apiKey";
    const uniqueId = "0000000000";
    const setAccessToken = jest
      .spyOn(Player.methods, "setAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });
    const setActiveWorkspace = jest
      .spyOn(Player.methods, "setActiveWorkspace")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });
    const wrapper = mount(Player, {
      props: {
        thirdPartyApiKey: apiKey,
        thirdPartyUniqueId: uniqueId,
      },
    });

    expect(wrapper).toBeTruthy();

    // post request made to retrieve the SSO token
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/generate-external-auth-access-token/",
      { api_key: apiKey, unique_id: uniqueId },
      { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
    );

    mockAxios.mockResponse({ data: dummyAccessToken }, mockAxios.queue()[0]);
    await flushPromises();
    expect(setAccessToken).toHaveBeenCalled();
    await flushPromises();
    expect(setActiveWorkspace).toHaveBeenCalled();
    await flushPromises();
  });

  it("updates the scorecard accordingly as the user responds to questions", async () => {
    const calculateScorecardMetrics = jest.spyOn(
      Player.methods,
      "calculateScorecardMetrics"
    );
    jest
      .spyOn(Player.methods, "showItemMarkersOnSlider")
      .mockImplementation(() => jest.fn());
    jest
      .spyOn(Player.methods, "fetchPlioCreateSession")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });
    const wrapper = mount(Player, {
      data() {
        return {
          videoId: "qJWALEoGge4",
          items: dummyItems.data,
        };
      },
    });

    expect(wrapper.vm.numOfCorrect).toBe(0);
    expect(wrapper.vm.numOfWrong).toBe(0);
    expect(wrapper.vm.numOfSkipped).toBe(0);

    await wrapper.setData({
      itemResponses: dummyItemResponses,
    });
    // this is done to call the watcher. refer to this
    // https://github.com/vuejs/vue-test-utils/issues/331#issuecomment-382037200
    wrapper.vm.$options.watch.itemResponses.handler.call(
      wrapper.vm,
      wrapper.vm.itemResponses
    );

    expect(calculateScorecardMetrics).toHaveBeenCalled();
    expect(wrapper.vm.numOfCorrect).toBe(2);
    expect(wrapper.vm.numOfWrong).toBe(0);
    expect(wrapper.vm.numOfSkipped).toBe(0);
  });
});
