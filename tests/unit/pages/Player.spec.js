import { mount, flushPromises } from "@vue/test-utils";
import Player from "@/pages/Player.vue";
import mockAxios from "jest-mock-axios";
import PlioAPIService from "@/services/API/Plio.js";
import SessionAPIService from "@/services/API/Session.js";
import store from "@/store";

import {
  dummyUser,
  dummyEmptyPlioList,
  dummySession,
  dummyPlioPlay,
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

  it("throws no error on item modal fullscreen button", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    const plioId = "abc";

    // mock method to plio play session response
    jest.spyOn(PlioAPIService, "getPlio").mockImplementation(() => {
      return new Promise((resolve) => {
        resolve(dummyPlioPlay);
      });
    });

    // mock method to fetch session response
    jest.spyOn(SessionAPIService, "createSession").mockImplementation(() => {
      return new Promise((resolve) => {
        resolve(dummySession);
      });
    });

    const wrapper = mount(Player, {
      propsData: {
        plioId: plioId,
      },
    });

    console.log("mockAxios.queue()", mockAxios.queue());

    // Wait until the DOM updates.
    await flushPromises();

    // blur classes should not be present initially
    // console.log(wrapper.html());

    // // wait until the DOM updates after promises resolve
    // await flushPromises();

    expect(wrapper.get('[data-plyr="fullscreen"]')).toBeTruthy();
  });
});
