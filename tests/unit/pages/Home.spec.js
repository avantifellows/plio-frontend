import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import Home from "@/pages/Home.vue";
import store from "@/store";

import mockAxios from "jest-mock-axios";

let clonedeep = require("lodash.clonedeep");

afterEach(async () => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
  // reset active workspace
  await store.dispatch("auth/setActiveWorkspace", "");
});

describe("Home.vue", () => {
  let wrapper;

  const mountWrapper = (params = {}) => {
    wrapper = mount(Home, params);
  };

  beforeEach(() => {
    // set user
    store.dispatch("auth/setUser", global.dummyUser);
    mountWrapper();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("renders properly with default values", async () => {
    expect(wrapper).toBeTruthy();
  });

  it("requests for fetching plios", () => {
    // `getAllPlios` inside services/API/Plio.js should've been called
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/`, {
      params: {
        page: 1,
      },
    });
  });

  describe("user with no plios", () => {
    const mockEmptyResponse = async () => {
      // resolve the `GET` request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        clonedeep(global.dummyEmptyPlioList),
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();
    };
    beforeEach(async () => {
      await mockEmptyResponse();
    });

    it("renders plios for user with no plios", () => {
      // expect(getAllPlios).toHaveBeenCalled();
      expect(wrapper.find('[data-test="table"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="noPlio"]').exists()).toBe(true);
    });

    it("creates new plio on clicking no plios create button", async () => {
      // mock router
      const mockRouter = {
        push: jest.fn(),
      };

      mountWrapper({
        global: {
          mocks: {
            $router: mockRouter,
          },
        },
      });

      await mockEmptyResponse();

      // trigger click on create plio button
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

  describe("has plios", () => {
    const getPlioList = async () => {
      // resolve the `GET` request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        {
          data: global.getDummyPlioList(),
        },
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();
    };
    beforeEach(async () => {
      await getPlioList();
    });

    it("renders plios for user with multiple plios", async () => {
      expect(wrapper.find('[data-test="table"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="noPlio"]').exists()).toBe(false);
    });

    it("requests plios with a chosen sorting order", async () => {
      // invoke sorting
      await wrapper
        .find('[data-test="table"]')
        .findAll('[data-test="tableHeader"]')[1]
        .trigger("click");

      const sortField = "-unique_viewers";
      expect(wrapper.vm.sortByField).toBe(sortField);
      // `getAllPlios` inside services/API/Plio.js should've been called with the ordering params
      expect(mockAxios.get).toHaveBeenCalledWith(`/plios/`, {
        params: {
          ordering: sortField,
          page: 1,
        },
      });
    });

    it("requests plios with a chosen search string", async () => {
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
      expect(mockAxios.get).toHaveBeenCalledWith(`/plios/`, {
        params: {
          search: searchString,
          page: 1,
        },
      });
    });

    it("fetches all plios when search string is reset", async () => {
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
      expect(mockAxios.get).toHaveBeenCalledWith(`/plios/`, {
        params: {
          page: 1,
        },
      });
    });

    it("requests plio list on workspace changing", async () => {
      await store.dispatch("auth/setActiveWorkspace", "test");
      expect(mockAxios.get).toHaveBeenCalledWith(`/plios/`, {
        params: {
          page: 1,
        },
      });
      await store.dispatch("auth/unsetActiveWorkspace");
    });

    it("fetches plios when a plio is deleted", async () => {
      // mock the plioDeleted method
      const plioDeleted = jest.spyOn(Home.methods, "plioDeleted");

      await mountWrapper();
      await getPlioList();

      // trigger emit from table
      wrapper.vm.$refs.table.$emit("delete-plio");

      expect(plioDeleted).toHaveBeenCalled();
    });

    it("fetches plios from last page if last plio from current page is deleted", async () => {
      await mountWrapper({
        data() {
          return {
            // set the page number to not be the first page
            currentPageNumber: 2,
          };
        },
      });

      // mock how the response for page 2 with one plio would look like
      let plioList = global.getDummyPlioList();
      plioList.count = 6;

      // only send in one plio as we want to simulate the case when
      // the last plio from the current page (not the first page) is deleted
      plioList.results = [plioList.results[0]];

      // resolve the `GET` request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        {
          data: plioList,
        },
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();

      // trigger emit from table
      wrapper.vm.$refs.table.$emit("delete-plio");

      // current page number should be changed
      expect(wrapper.vm.currentPageNumber).toBe(1);
    });
  });
});
