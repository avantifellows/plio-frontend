import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import Home from "@/pages/Home.vue";
import store from "@/store";

import mockAxios from "jest-mock-axios";
import {
  dummyUser,
  dummyEmptyPlioList,
  dummyPlioList,
  dummyUniqueUserCountList,
} from "@/services/Testing/DummyData.js";

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

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();
    const wrapper = mount(Home);

    // `getAllPlios` inside services/API/Plio.js should've been called
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/list_uuid/`, {
      params: {},
    });

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(dummyEmptyPlioList, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // expect(getAllPlios).toHaveBeenCalled();
    expect(wrapper.find('[data-test="table"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="noPlio"]').exists()).toBe(true);
  });

  it("renders plios for approved user with multiple plios", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    const getUniqueUsersCountList = jest
      .spyOn(PlioAPIService, "getUniqueUsersCountList")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(dummyUniqueUserCountList);
        });
      });
    const wrapper = mount(Home);

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(dummyPlioList, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(getUniqueUsersCountList).toHaveBeenCalled();
    expect(wrapper.find('[data-test="table"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="noPlio"]').exists()).toBe(false);
  });

  it("creates new plio on clicking no plios create button", async () => {
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };

    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    const wrapper = mount(Home, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(dummyEmptyPlioList, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // trigger click
    await wrapper.find('[data-test="create"]').trigger("click");

    // `createPlio` inside services/API/Plio.js should've been called
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(`/plios/`);

    // resolve the `POST` request waiting in the queue
    // using the fake response data
    const testPlioId = "abcd";
    mockAxios.mockResponse(
      { status: 201, data: { uuid: testPlioId } },
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Editor",
      params: {
        org: "",
        plioId: testPlioId,
      },
    });
  });
});
