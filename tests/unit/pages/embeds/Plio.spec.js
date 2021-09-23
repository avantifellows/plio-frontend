import { flushPromises, mount } from "@vue/test-utils";
import Plio from "@/pages/Embeds/Plio.vue";
import mockAxios from "jest-mock-axios";
import { dummyAccessToken, dummyItems } from "@/services/Testing/DummyData.js";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Plio.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Plio);
    expect(wrapper).toBeTruthy();
  });

  it("detects SAML SSO", async () => {
    const wrapper = mount(Plio);

    // no SSO in the beginning
    expect(wrapper.vm.isThirdPartyAuth).toBeFalsy();
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
      .spyOn(Plio.methods, "setAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });
    const setActiveWorkspace = jest
      .spyOn(Plio.methods, "setActiveWorkspace")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });
    const wrapper = mount(Plio, {
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
      Plio.methods,
      "calculateScorecardMetrics"
    );
    jest
      .spyOn(Plio.methods, "showItemMarkersOnSlider")
      .mockImplementation(() => jest.fn());
    jest
      .spyOn(Plio.methods, "fetchPlioCreateSession")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });

    jest.spyOn(Plio.methods, "closeItemModal").mockImplementation(() => {
      return;
    });
    const wrapper = mount(Plio);

    await wrapper.setData({
      videoId: "qJWALEoGge4",
      items: dummyItems.data,
    });
    expect(wrapper.vm.numCorrect).toBe(0);
    expect(wrapper.vm.numWrong).toBe(0);
    expect(wrapper.vm.numSkipped).toBe(0);

    // set the first item to open, and emulate a user skipping by setting the
    // item responses
    await wrapper.setData({
      currentItemIndex: 0,
      itemResponses: [
        {
          id: 1,
          deleted: null,
          session: 36,
          item: 211,
          answer: NaN,
          created_at: "2021-09-14T13:25:44.357052Z",
          updated_at: "2021-09-14T13:25:44.357290Z",
        },
      ],
    });

    // click the skip button for recalculation of scorecard metrics
    await wrapper
      .find('[data-test="item-modal"]')
      .find('[data-test="header"]')
      .find('[data-test="skip"]')
      .trigger("click");

    expect(calculateScorecardMetrics).toHaveBeenCalled();
    expect(wrapper.vm.numCorrect).toBe(0);
    expect(wrapper.vm.numWrong).toBe(0);
    expect(wrapper.vm.numSkipped).toBe(1);
  });
});
