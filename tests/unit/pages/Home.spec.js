import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import Home from "@/pages/Home.vue";
import store from "@/store";

import mockAxios from "jest-mock-axios";
import {
  dummyUser,
  dummyPublishedPlio,
  dummyEmptyPlioList,
  dummyPlioList,
  dummyUniqueUserCountList,
} from "@/services/Testing/DummyData.js";

var cloneDeep = require("lodash.clonedeep");

afterEach(async () => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
  // reset active workspace
  await store.dispatch("auth/setActiveWorkspace", "");
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
      params: {
        page: 1,
      },
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

  it("sorts correctly based on column value", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    jest
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

    // invoke sorting
    await wrapper
      .find('[data-test="table"]')
      .findAll('[data-test="tableHeader"]')[1]
      .trigger("click");

    const sortField = "-unique_viewers";
    expect(wrapper.vm.sortByField).toBe(sortField);
    // `getAllPlios` inside services/API/Plio.js should've been called with the ordering params
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/list_uuid/`, {
      params: {
        ordering: sortField,
        page: 1,
      },
    });
  });

  it("searches plios when search string is present", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    jest
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

    // add some text in the search string
    const searchString = "abc";
    await wrapper
      .find('[data-test="table"]')
      .find('[data-test="searchBar"]')
      .setValue(searchString);
    // trigger search button
    await wrapper
      .find('[data-test="table"]')
      .find('[data-test="searchButton"]')
      .trigger("click");

    expect(wrapper.vm.searchString).toBe(searchString);
    // `getAllPlios` inside services/API/Plio.js should've been called with the search params
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/list_uuid/`, {
      params: {
        search: searchString,
        page: 1,
      },
    });
  });

  it("fetches all plios when search string is reset", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    jest
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

    // add some text in the search string
    await wrapper
      .find('[data-test="table"]')
      .find('[data-test="searchBar"]')
      .setValue("abc");
    // trigger search button
    await wrapper
      .find('[data-test="table"]')
      .find('[data-test="searchButton"]')
      .trigger("click");
    // reset axios
    mockAxios.reset();
    // reset search
    await wrapper
      .find('[data-test="table"]')
      .find('[data-test="resetSearch"]')
      .trigger("click");

    expect(wrapper.vm.searchString).toBe("");
    // `getAllPlios` inside services/API/Plio.js should've been called with no additional params
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/list_uuid/`, {
      params: {
        page: 1,
      },
    });
  });

  it("destroys all plios on unmount", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    jest
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

    await wrapper.unmount();
    expect(store.state.plioItems.allPlioDetails).toStrictEqual({});
  });

  it("responds to workspace changing", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    jest
      .spyOn(PlioAPIService, "getUniqueUsersCountList")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(dummyUniqueUserCountList);
        });
      });
    mount(Home);

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(dummyPlioList, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // reset axios
    mockAxios.reset();

    await store.dispatch("auth/setActiveWorkspace", "test");
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/list_uuid/`, {
      params: {
        page: 1,
      },
    });
  });

  it("fetches plios when a plio is deleted", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    // mock getUniqueUsersCountList method
    jest
      .spyOn(PlioAPIService, "getUniqueUsersCountList")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(dummyUniqueUserCountList);
        });
      });

    // mock the plioDeleted method
    const plioDeleted = jest.spyOn(Home.methods, "plioDeleted");

    const wrapper = mount(Home);

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(dummyPlioList, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    mockAxios.mockResponse(dummyPublishedPlio, mockAxios.queue()[0]);

    await flushPromises();

    // reset axios
    mockAxios.reset();

    // trigger emit from table
    wrapper.vm.$refs.table.$emit("delete-plio");

    expect(plioDeleted).toHaveBeenCalled();
  });

  it("fetches plios from last page if last plio from current page is deleted", async () => {
    // set user
    await store.dispatch("auth/setUser", dummyUser);

    // changing the user to approved makes another API call to list UUIDs
    // this resets it
    mockAxios.reset();

    // mock getUniqueUsersCountList method
    jest
      .spyOn(PlioAPIService, "getUniqueUsersCountList")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(dummyUniqueUserCountList);
        });
      });

    const wrapper = mount(Home);
    await wrapper.setData({
      // set the page number to not be the first page
      currentPageNumber: 2,
    });

    // mock how the response for page 2 with one plio would look like
    let plioList = cloneDeep(dummyPlioList);
    plioList.data.count = 6;
    plioList.data.page_size = 5;
    plioList.data.results = [plioList.data.results[0]];

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    // only send in one plio as we want to simulate the case when
    // the last plio from the current page (not the first page) is deleted
    mockAxios.mockResponse(plioList, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    mockAxios.mockResponse(
      {
        access_token: "",
        expires_in: "",
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    // trigger emit from table
    wrapper.vm.$refs.table.$emit("delete-plio");

    // current page number should be changed
    expect(wrapper.vm.currentPageNumber).toBe(1);
  });
});
