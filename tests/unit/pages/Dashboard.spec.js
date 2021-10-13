import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import mockAxios from "jest-mock-axios";

import Dashboard from "@/pages/Dashboard.vue";
import {
  dummyDraftPlio,
  dummyPublishedPlio,
  dummyPlioAnalytics,
} from "@/services/Testing/DummyData.js";
var clonedeep = require("lodash.clonedeep");

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Dashboard.vue", () => {
  it("renders values for a published Plio", async () => {
    const plioId = "abc";

    // mock method to fetch dashboard metrics from analytics client
    const getDashboardMetrics = jest
      .spyOn(PlioAPIService, "getDashboardMetrics")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(dummyPlioAnalytics);
        });
      });
    const wrapper = mount(Dashboard, {
      props: {
        plioId: plioId,
      },
    });
    expect(wrapper).toBeTruthy();
    // `getPlio` inside services/API/Plio.js should've been called
    // 1 `GET` requests is made
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    let dummyVideoID = dummyPublishedPlio.data.video.url.split("=")[1];
    expect(wrapper.vm.videoID).toBe(dummyVideoID);
    expect(wrapper.find('[data-test="thumbnail"]').exists()).toBe(true);
    expect(wrapper.vm.videoThumbnailURL).toBe(
      `https://img.youtube.com/vi/${dummyVideoID}/sddefault.jpg`
    );

    expect(wrapper.find('[data-test="title"]').text()).toBe(
      dummyPublishedPlio.data.name
    );
    expect(getDashboardMetrics).toHaveBeenCalled();

    expect(wrapper.find('[data-test="numViewers"]').text()).toBe(
      String(dummyPlioAnalytics["Session.uniqueUsers"])
    );
    expect(wrapper.find('[data-test="watchTime"]').text()).toBe(
      "3 mins 22 secs"
    );
    expect(wrapper.find('[data-test="completion"]').text()).toBe(
      String(
        dummyPlioAnalytics["AggregateSessionMetrics.completionPercentage"]
      ) + "%"
    );
    expect(wrapper.find('[data-test="questionAnswered"]').text()).toBe(
      String(dummyPlioAnalytics["AggregateSessionMetrics.numQuestionsAnswered"])
    );
    expect(wrapper.find('[data-test="accuracy"]').text()).toBe(
      String(dummyPlioAnalytics["AggregateSessionMetrics.accuracy"]) + "%"
    );
    expect(wrapper.find('[data-test="retention"]').text()).toBe(
      String(
        dummyPlioAnalytics["GroupedSessionRetention.averageOneMinuteRetention"]
      ) + "%"
    );
  });

  it("renders analytics values when none available", async () => {
    const plioId = "abc";
    jest.spyOn(PlioAPIService, "getDashboardMetrics").mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({});
      });
    });
    const wrapper = mount(Dashboard, {
      props: {
        plioId: plioId,
      },
    });

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call and
    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(wrapper.find('[data-test="numViewers"]').text()).toBe("0");
    expect(wrapper.find('[data-test="watchTime"]').text()).toBe("0 secs");
    expect(wrapper.find('[data-test="completion"]').text()).toBe("0%");
    expect(wrapper.find('[data-test="questionAnswered"]').text()).toBe("0");
    expect(wrapper.find('[data-test="accuracy"]').text()).toBe("0%");
    expect(wrapper.find('[data-test="retention"]').text()).toBe("0%");
  });

  it("routes to 404 for draft plio", async () => {
    // mock router
    const mockRouter = {
      replace: jest.fn(),
    };
    const plioId = "abc";
    jest.spyOn(PlioAPIService, "getDashboardMetrics").mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({});
      });
    });
    mount(Dashboard, {
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call
    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: "404",
    });
  });

  it("routes to editor on clicking edit", async () => {
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };
    const plioId = "abc";
    // mock method to fetch dashboard metrics from analytics client
    jest.spyOn(PlioAPIService, "getDashboardMetrics").mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({});
      });
    });
    const wrapper = mount(Dashboard, {
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call and
    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    await wrapper.find('[data-test="edit"]').trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Editor",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("downloads report", async () => {
    const downloadReport = jest.spyOn(Dashboard.methods, "downloadReport");
    const plioId = "abc";
    // mock method to fetch dashboard metrics from analytics client
    jest.spyOn(PlioAPIService, "getDashboardMetrics").mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({});
      });
    });
    const wrapper = mount(Dashboard, {
      props: {
        plioId: plioId,
      },
    });

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call and
    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(clonedeep(dummyPublishedPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    await wrapper.find('[data-test="download"]').trigger("click");

    expect(downloadReport).toHaveBeenCalled();
  });
});
