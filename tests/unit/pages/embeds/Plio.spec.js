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
});
