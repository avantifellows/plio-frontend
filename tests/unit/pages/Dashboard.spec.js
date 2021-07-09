import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import mockAxios from "jest-mock-axios";

import Dashboard from "@/pages/Dashboard.vue";
import {
  dummyDraftPlio,
  dummyPublishedPlio,
  dummyItems,
  dummyPlioAnalytics,
} from "@/services/Testing/DummyData.js";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Dashboard.vue", () => {
  it("renders values for a published Plio", async () => {
    const plioId = "abc";
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
    // 2 `GET` requests are made
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);
    expect(mockAxios.get).toHaveBeenCalledWith("/items/", {
      params: { plio: `${plioId}` },
    });

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call
    let plioResponse = dummyDraftPlio;
    let itemResponse = dummyItems;

    // resolve the two `GET` requests waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(plioResponse, mockAxios.queue()[0]);
    mockAxios.mockResponse(itemResponse, mockAxios.queue()[1]);

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
});
