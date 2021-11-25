import { flushPromises, mount } from "@vue/test-utils";
import Plio from "@/pages/Embeds/Plio.vue";
import mockAxios from "jest-mock-axios";
import store from "@/store";
import UserAPIService from "@/services/API/User.js";
import EventAPIService from "@/services/API/Event.js";
import {
  dummyPublishedPlio,
  dummyAccessToken,
  dummyUser,
} from "@/services/Testing/DummyData.js";
var clonedeep = require("lodash.clonedeep");

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Plio.vue", () => {
  it("plio is not loaded by default", () => {
    const wrapper = mount(Plio);
    expect(wrapper.vm.isPlioLoaded).toBeFalsy();
  });

  it("requests for plio when plio id is passed", async () => {
    const plioId = "123";
    mount(Plio, {
      props: {
        plioId: plioId,
      },
    });
    await flushPromises();
    // `getPlio` inside services/API/Plio.js should've been called
    // 1 `GET` request is made
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}/play`);
  });

  it("renders plio when plio details are passed", async () => {
    const plioId = "123";
    const setPlayerAspectRatio = jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());
    const playerInitiated = jest.spyOn(Plio.methods, "playerInitiated");
    const wrapper = mount(Plio, {
      props: {
        plioId: plioId,
      },
    });
    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(wrapper.vm.isPlioLoaded).toBeTruthy();
    expect(wrapper.items).toStrictEqual(dummyPublishedPlio.items);
    expect(setPlayerAspectRatio).toHaveBeenCalled();
    expect(playerInitiated).toHaveBeenCalled();
  });

  it("sets properties based on screen size when player is ready", async () => {
    const plioId = "123";
    const mockPlyrVolumeElement = [
      {
        style: {
          display: "",
        },
      },
    ];

    const playerReady = jest.spyOn(Plio.methods, "playerReady");
    const setPlayerTime = jest
      .spyOn(Plio.methods, "setPlayerTime")
      .mockImplementation(() => jest.fn());
    const setScreenProperties = jest.spyOn(Plio.methods, "setScreenProperties");
    const setPlayerAspectRatio = jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());
    const setPlayerVolumeVisibility = jest.spyOn(
      Plio.methods,
      "setPlayerVolumeVisibility"
    );

    const wrapper = mount(Plio, {
      props: {
        plioId: plioId,
      },
    });

    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // mock plyr width > 640
    global.document.getElementById = jest.fn(() => ({
      clientWidth: 700,
      getElementsByClassName: () => {
        return mockPlyrVolumeElement;
      },
    }));

    wrapper.vm.$refs.videoPlayer.$emit("ready");

    expect(playerReady).toHaveBeenCalled();
    expect(setScreenProperties).toHaveBeenCalled();
    expect(setPlayerTime).toHaveBeenCalled();
    expect(setPlayerAspectRatio).toHaveBeenCalled();
    expect(setPlayerVolumeVisibility).toHaveBeenCalled();
    expect(mockPlyrVolumeElement[0].style.display).toBe("flex");

    // mock plyr width < 640
    global.document.getElementById = jest.fn(() => ({
      clientWidth: 500,
      getElementsByClassName: () => {
        return mockPlyrVolumeElement;
      },
    }));

    wrapper.vm.$refs.videoPlayer.$emit("ready");

    expect(mockPlyrVolumeElement[0].style.display).toBe("none");
  });

  it("session should not be created if unauthenticated when plio request is resolved", async () => {
    const plioId = "123";
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());
    const createSession = jest.spyOn(Plio.methods, "createSession");
    mount(Plio, {
      props: {
        plioId: plioId,
      },
    });
    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(createSession).toHaveBeenCalled();

    // 1 `POST` request should have been made
    expect(mockAxios.post).toHaveBeenCalledTimes(0);
  });

  it("creates session if authenticated when plio request is resolved", async () => {
    const plioId = "123";
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());

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

    mount(Plio, {
      props: {
        plioId: plioId,
      },
    });
    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // 1 `POST` request should have been made
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith("/sessions/", {
      plio: dummyPublishedPlio.data.id,
    });
  });

  it("does not create session with authenticated user if opened in preview mode", async () => {
    const plioId = "123";
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());

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

    mount(Plio, {
      props: {
        plioId: plioId,
        previewMode: true,
      },
    });
    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // 1 `POST` request should have been made
    expect(mockAxios.post).toHaveBeenCalledTimes(0);
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

  it("checks for aspect ratio when the player has buffered", async () => {
    const plioId = "123";
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => new Promise((resolve) => resolve()));
    const checkAndSetPlayerAspectRatio = jest.spyOn(
      Plio.methods,
      "checkAndSetPlayerAspectRatio"
    );
    const wrapper = mount(Plio, {
      props: {
        plioId: plioId,
      },
    });
    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // aspect ratio shouldn't have been checked at the start
    expect(wrapper.vm.isAspectRatioChecked).toBeFalsy();

    wrapper.vm.$refs.videoPlayer.$emit("buffered");

    expect(checkAndSetPlayerAspectRatio).toHaveBeenCalled();
    expect(wrapper.vm.isAspectRatioChecked).toBeTruthy();
  });

  it("calls updateEvent method for consecutive 'watching' events for a given session", async () => {
    const plioId = "123";

    // mock setPlayerAspectRatio method
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());

    // mock createSession method
    jest.spyOn(Plio.methods, "createSession").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    // mock updateEvent method
    let updateEvent = jest
      .spyOn(Plio.methods, "updateEvent")
      .mockImplementation(() => {
        return;
      });

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

    // stimulating the case where a 'watching' event has already been created
    let sessionDBId = 1;
    let watchingEventDBId = 1;

    mount(Plio, {
      shallow: true,
      props: {
        plioId: plioId,
      },
      data() {
        return {
          watchingEventDBId: watchingEventDBId,
          sessionDBId: sessionDBId,
          videoId: "_hJEyDOn6Ho",
        };
      },
    });
    await flushPromises();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();
    // assert that updateEvent method has been called with the correct params
    expect(updateEvent).toHaveBeenCalledWith("watching", watchingEventDBId);
  });

  it("makes a PATCH call to update a watching event", () => {
    // spy on the updateEvent method inside EventAPIService
    let updateEventAPICall = jest.spyOn(EventAPIService, "updateEvent");

    // Testing the individual method using 'call'
    // refer to this - https://lmiller1990.github.io/vue-testing-handbook/v3/computed-properties.html#testing-with-call
    // build a local context object - localThis. It will serve as 'this' in our test.
    let localThis = {
      hasSessionStarted: true,
      isAuthenticated: true,
      previewMode: false,
      sessionDBId: 3,
      player: {
        currentTime: 10,
      },
    };

    let eventType = "watching";
    let eventDBId = 1;

    // invoke the method using the local context object and appropriate params
    Plio.methods.updateEvent.call(localThis, eventType, eventDBId);

    // the updateEvent method inside EventAPIService would've been called
    // An update request would've been made with the correct payload
    expect(updateEventAPICall).toHaveBeenCalled();
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    expect(mockAxios.put).toHaveBeenCalledWith(`/events/${eventDBId}`, {
      type: eventType,
      details: {},
      player_time: localThis.player.currentTime,
      session: localThis.sessionDBId,
    });
  });
});
