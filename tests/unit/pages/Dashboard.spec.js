import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import mockAxios from "jest-mock-axios";

import Dashboard from "@/pages/Dashboard.vue";
import clonedeep from "lodash/cloneDeep";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

const plioId = "abc";
let wrapper;
let mockRouter;
let getDashboardMetrics;

describe("Dashboard.vue", () => {
  const mountWrapper = (analyticsData = global.dummyPlioAnalytics) => {
    // mock router
    mockRouter = {
      replace: jest.fn(),
      push: jest.fn(),
    };
    // mock method to fetch dashboard metrics from analytics client
    getDashboardMetrics = jest
      .spyOn(PlioAPIService, "getDashboardMetrics")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(analyticsData);
        });
      });
    wrapper = mount(Dashboard, {
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
  };

  beforeEach(() => {
    mountWrapper();
  });

  it("makes an API call for fetching plio details", () => {
    // `getPlio` inside services/API/Plio.js should've been called
    // 1 `GET` requests is made
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);
  });

  it("routes to 404 for draft plio", async () => {
    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: "404",
    });
  });

  describe("published plio", () => {
    const resolveAPICall = async () => {
      // resolve the `GET` request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        clonedeep(global.dummyPublishedPlio),
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();
    };
    beforeEach(async () => {
      resolveAPICall();
    });

    it("renders values for a published Plio", () => {
      let dummyVideoID = global.dummyPublishedPlio.data.video.url.split("=")[1];
      expect(wrapper.vm.videoID).toBe(dummyVideoID);
      expect(wrapper.find('[data-test="thumbnail"]').exists()).toBe(true);
      expect(wrapper.vm.videoThumbnailURL).toBe(
        `https://img.youtube.com/vi/${dummyVideoID}/sddefault.jpg`
      );

      expect(wrapper.find('[data-test="title"]').text()).toBe(
        global.dummyPublishedPlio.data.name
      );
      expect(getDashboardMetrics).toHaveBeenCalled();

      expect(wrapper.find('[data-test="numViewers"]').text()).toBe(
        String(global.dummyPlioAnalytics["Session.uniqueUsers"])
      );
      expect(wrapper.find('[data-test="watchTime"]').text()).toBe(
        "3 mins 22 secs"
      );
      expect(wrapper.find('[data-test="completion"]').text()).toBe(
        String(
          global.dummyPlioAnalytics[
            "AggregateSessionMetrics.completionPercentage"
          ]
        ) + "%"
      );
      expect(wrapper.find('[data-test="questionAnswered"]').text()).toBe(
        String(
          global.dummyPlioAnalytics[
            "AggregateSessionMetrics.numQuestionsAnswered"
          ]
        )
      );
      expect(wrapper.find('[data-test="accuracy"]').text()).toBe(
        String(global.dummyPlioAnalytics["AggregateSessionMetrics.accuracy"]) +
          "%"
      );
      expect(wrapper.find('[data-test="retention"]').text()).toBe(
        String(
          global.dummyPlioAnalytics[
            "GroupedSessionRetention.averageOneMinuteRetention"
          ]
        ) + "%"
      );
    });

    it("renders analytics values when none available", async () => {
      await mountWrapper({});
      await resolveAPICall();

      expect(wrapper.find('[data-test="numViewers"]').text()).toBe("0");
      expect(wrapper.find('[data-test="watchTime"]').text()).toBe("0 secs");
      expect(wrapper.find('[data-test="completion"]').text()).toBe("0%");
      expect(wrapper.find('[data-test="questionAnswered"]').text()).toBe("0");
      expect(wrapper.find('[data-test="accuracy"]').text()).toBe("0%");
      expect(wrapper.find('[data-test="retention"]').text()).toBe("0%");
    });

    describe("button clicks", () => {
      it("routes to editor on clicking edit", async () => {
        await wrapper.find('[data-test="edit"]').trigger("click");

        expect(mockRouter.push).toHaveBeenCalledWith({
          name: "Editor",
          params: {
            org: "",
            plioId: plioId,
          },
        });
      });

      it("routes to player on clicking play", async () => {
        await wrapper.find('[data-test="play"]').trigger("click");

        expect(mockRouter.push).toHaveBeenCalledWith({
          name: "Player",
          params: {
            org: "",
            plioId: plioId,
          },
        });
      });

      it("downloads report", async () => {
        const downloadReport = jest.spyOn(Dashboard.methods, "downloadReport");
        await mountWrapper({});
        await resolveAPICall();

        await wrapper.find('[data-test="download"]').trigger("click");
        expect(downloadReport).toHaveBeenCalled();
      });
    });
  });
});
