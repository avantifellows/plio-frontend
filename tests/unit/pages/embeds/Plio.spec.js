import { flushPromises, mount } from "@vue/test-utils";
import Plio from "@/pages/Embeds/Plio.vue";
import mockAxios from "jest-mock-axios";
import store from "@/store";
import router from "@/router";
import UserAPIService from "@/services/API/User.js";
import EventAPIService from "@/services/API/Event.js";
import { userFromTokenEndpoint } from "@/services/API/Endpoints";

let clonedeep = require("lodash.clonedeep");
let wrapper;
let plioId = "123";

let setPlayerAspectRatio;

const mountWrapper = async (
  params = { loadPlio: false, props: {}, data: {} }
) => {
  if (wrapper != undefined) await wrapper.unmount();
  setPlayerAspectRatio = jest
    .spyOn(Plio.methods, "setPlayerAspectRatio")
    .mockImplementation(() => jest.fn());

  wrapper = mount(Plio, {
    props: {
      plioId: plioId,
      ...params.props,
    },
    data() {
      return params.data;
    },
  });
  await flushPromises();

  if (params.loadPlio) {
    await loadPlio();
  }
};

const loadPlio = async () => {
  // resolve the `GET` request waiting in the queue (for receiving plio details)
  // using the fake response data
  mockAxios.mockResponse(
    clonedeep(global.dummyPublishedPlio),
    mockAxios.queue()[0]
  );

  // wait until the DOM updates after promises resolve
  await flushPromises();
};

const authenticateUser = async () => {
  // mock user service
  jest.spyOn(UserAPIService, "getUserByAccessToken").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve({ data: global.dummyUser });
    });
  });

  // set user
  await store.dispatch("auth/setAccessToken", global.dummyAccessToken);
};

beforeEach(async () => {
  jest.useFakeTimers();
});

afterEach(async () => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
  // unset user
  await store.dispatch("auth/unsetAccessToken");
});

describe("Plio.vue", () => {
  it("plio is not loaded by default", async () => {
    await mountWrapper();
    expect(wrapper.vm.isPlioLoaded).toBeFalsy();
  });

  it("requests for plio when plio id is passed", async () => {
    await mountWrapper();
    // `getPlio` inside services/API/Plio.js should've been called
    // 1 `GET` request is made
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}/play`);
  });

  it("renders plio when plio details are passed", async () => {
    const playerInitiated = jest.spyOn(Plio.methods, "playerInitiated");
    await mountWrapper({ loadPlio: true });

    expect(wrapper.vm.isPlioLoaded).toBeTruthy();
    expect(wrapper.items).toStrictEqual(global.dummyPublishedPlio.items);
    expect(setPlayerAspectRatio).toHaveBeenCalled();
    expect(playerInitiated).toHaveBeenCalled();
  });

  it("sets properties based on screen size when player is ready", async () => {
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

    const setPlayerVolumeVisibility = jest.spyOn(
      Plio.methods,
      "setPlayerVolumeVisibility"
    );

    await mountWrapper({ loadPlio: true });

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

  describe("session creation", () => {
    it("session should not be created if unauthenticated when plio request is resolved", async () => {
      const createSession = jest.spyOn(Plio.methods, "createSession");
      await mountWrapper({ loadPlio: true });

      expect(createSession).toHaveBeenCalled();

      // 0 `POST` request should have been made
      expect(mockAxios.post).toHaveBeenCalledTimes(0);
    });

    describe("authenticated user", () => {
      beforeEach(async () => {
        await authenticateUser();
      });
      it("creates session when plio request is resolved", async () => {
        await mountWrapper({ loadPlio: true });

        // 1 `POST` request should have been made
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).toHaveBeenCalledWith("/sessions/", {
          plio: global.dummyPublishedPlio.data.id,
        });
      });

      it("populates item responses when request to fetch sessions is resolved", async () => {
        await mountWrapper({ loadPlio: true });
        mockAxios.mockResponse(
          clonedeep(global.dummySession),
          mockAxios.queue()[0]
        );
        expect(wrapper.vm.itemResponses.length).toBe(
          global.dummyItemResponses.length
        );
        expect(wrapper.vm.numCorrect).toBe(4);
        expect(wrapper.vm.numWrong).toBe(1);
        expect(wrapper.vm.numSkipped).toBe(0);
      });

      it("does not create session if opened in preview mode", async () => {
        await mountWrapper();
        await wrapper.setProps({
          previewMode: true,
        });

        await loadPlio();

        // 0 `POST` request should have been made
        expect(mockAxios.post).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("SAML SSO", () => {
    const apiKey = "apiKey";
    const uniqueId = "0000000000";

    it("detects SAML SSO", async () => {
      await mountWrapper();
      // no SSO in the beginning
      expect(wrapper.vm.isThirdPartyAuth).toBeFalsy();
      // setting props for SSO
      await wrapper.setProps({
        thirdPartyApiKey: apiKey,
        thirdPartyUniqueId: uniqueId,
      });
      // SSO should be detected by now
      expect(wrapper.vm.isThirdPartyAuth).toBeTruthy();
    });

    it("handles SAML SSO", async () => {
      const fetchPlioCreateSession = jest.spyOn(
        Plio.methods,
        "fetchPlioCreateSession"
      );

      // the user navigates to a plio using SSO
      router.push(
        `/tempOrg/play/${plioId}?api_key=${apiKey}&unique_id=${uniqueId}`
      );
      await mountWrapper({
        props: {
          thirdPartyApiKey: apiKey,
          thirdPartyUniqueId: uniqueId,
        },
      });
      await router.isReady();
      // post request made to retrieve the SSO token
      expect(mockAxios.post).toHaveBeenCalledWith(
        "/generate-external-auth-access-token/",
        { api_key: apiKey, unique_id: uniqueId },
        { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
      );
      mockAxios.mockResponse(
        { data: global.dummyAccessToken },
        mockAxios.queue()[0]
      );
      await flushPromises();

      // get request to retrieve the user from the given access token
      expect(mockAxios.get).toHaveBeenCalledWith(userFromTokenEndpoint, {
        params: { token: global.dummyAccessToken.access_token },
      });
      mockAxios.mockResponse(
        { data: global.dummySSOUser },
        mockAxios.queue()[0]
      );
      await flushPromises();

      // the SSO user should be logged in properly and session fetching/creation should beging
      expect(store.getters["auth/isSSOUser"]).toBe(true);
      expect(store.getters["auth/isPersonalWorkspace"]).toBe(true);
      expect(store.getters["auth/isAuthenticated"]).toBe(true);
      expect(fetchPlioCreateSession).toHaveBeenCalled();
    });
  });

  it("checks for aspect ratio when the player has buffered", async () => {
    const checkAndSetPlayerAspectRatio = jest.spyOn(
      Plio.methods,
      "checkAndSetPlayerAspectRatio"
    );

    await mountWrapper({ loadPlio: true });

    // aspect ratio shouldn't have been checked at the start
    expect(wrapper.vm.isAspectRatioChecked).toBeFalsy();

    wrapper.vm.$refs.videoPlayer.$emit("buffered");

    expect(checkAndSetPlayerAspectRatio).toHaveBeenCalled();
    expect(wrapper.vm.isAspectRatioChecked).toBeTruthy();
  });

  describe("event updates", () => {
    let watchingEventDBId = 1;

    it("calls updateEvent method for consecutive 'watching' events for a given session", async () => {
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

      await authenticateUser();

      // simulating the case where a 'watching' event has already been created
      await mountWrapper({
        loadPlio: true,
        data: {
          watchingEventDBId: watchingEventDBId,
          sessionDBId: 1,
        },
      });

      // assert that updateEvent method has been called with the correct params
      expect(updateEvent).toHaveBeenCalledWith("watching", watchingEventDBId);
    });

    it("updates a watching event when updateEvent is called", () => {
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

      // invoke the method using the local context object and appropriate params
      Plio.methods.updateEvent.call(localThis, eventType, watchingEventDBId);

      // the updateEvent method inside EventAPIService would've been called
      // An update request would've been made with the correct payload
      expect(updateEventAPICall).toHaveBeenCalled();
      expect(mockAxios.put).toHaveBeenCalledTimes(1);
      expect(mockAxios.put).toHaveBeenCalledWith(
        `/events/${watchingEventDBId}`,
        {
          type: eventType,
          details: {},
          player_time: localThis.player.currentTime,
          session: localThis.sessionDBId,
        }
      );
    });
  });
  describe("submitting question", () => {
    let createEvent;

    const setupWrapper = async (params = { currentItemIndex: 0 }) => {
      await mountWrapper({
        loadPlio: true,
        data: {
          currentItemIndex: params.currentItemIndex,
          itemResponses: clonedeep(global.dummyItemResponses),
        },
      });
    };

    beforeEach(async () => {
      createEvent = jest.spyOn(Plio.methods, "createEvent");
      await setupWrapper();
    });

    it("does not make an API call if the user is not authenticated", async () => {
      wrapper.vm.$refs.plioModal.$emit("submit-question");
      expect(mockAxios.put).not.toHaveBeenCalled();
      expect(createEvent).not.toHaveBeenCalled();
    });

    it("does not make an API call if in preview mode", async () => {
      await wrapper.setProps({
        previewMode: true,
      });
      wrapper.vm.$refs.plioModal.$emit("submit-question");
      expect(mockAxios.put).not.toHaveBeenCalled();
      expect(createEvent).not.toHaveBeenCalled();
    });

    describe("for authenticated user", () => {
      beforeEach(async () => {
        await authenticateUser();
      });
      it("does not make an API call if in preview mode", async () => {
        await wrapper.setProps({
          previewMode: true,
        });
        wrapper.vm.$refs.plioModal.$emit("submit-question");
        expect(mockAxios.put).not.toHaveBeenCalled();
        expect(createEvent).not.toHaveBeenCalled();
      });
      it("makes an API call in non-preview mode", async () => {
        const showItemMarkersOnSlider = jest.spyOn(
          Plio.methods,
          "showItemMarkersOnSlider"
        );
        const calculateScorecardMetrics = jest.spyOn(
          Plio.methods,
          "calculateScorecardMetrics"
        );
        await setupWrapper();
        wrapper.vm.$refs.plioModal.$emit("submit-question");
        expect(mockAxios.put).toHaveBeenCalled();
        expect(createEvent).toHaveBeenCalled();
        expect(showItemMarkersOnSlider).toHaveBeenCalled();
        expect(calculateScorecardMetrics).toHaveBeenCalled();
      });
      it("converts checkbox answers from set to array", async () => {
        const currentItemIndex = 4;
        await setupWrapper({
          currentItemIndex: currentItemIndex,
        });
        wrapper.vm.$refs.plioModal.$emit("submit-question");
        let expectedItemResponse = clonedeep(
          global.dummyItemResponses[currentItemIndex]
        );
        expectedItemResponse["answer"] = Array.from(
          expectedItemResponse["answer"]
        );
        expect(mockAxios.put).toHaveBeenCalledWith(
          "/session-answers/5",
          expectedItemResponse
        );
      });
    });
  });
});
