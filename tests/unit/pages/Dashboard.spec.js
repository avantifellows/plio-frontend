import { mount, flushPromises } from "@vue/test-utils";
import PlioAPIService from "@/services/API/Plio.js";
import mockAxios from "jest-mock-axios";

import Dashboard from "@/pages/Dashboard.vue";
let clonedeep = require("lodash.clonedeep");

const plioId = "abc";
let wrapper;
let mockRouter;

describe("Dashboard.vue", () => {
  const mountWrapper = () => {
    // mock router
    mockRouter = {
      replace: jest.fn(),
      push: jest.fn(),
    };

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

  afterEach(() => {
    // cleaning up the mess left behind by the previous test
    mockAxios.reset();
  });

  it("makes an API call for fetching plio details", () => {
    // `getPlio` and `getMetrics` inside services/API/Plio.js should've been called
    // 1 `GET` requests is made
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}/metrics/`);
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
    const resolveAPICall = async (
      metrics = clonedeep(global.dummyPlioMetrics)
    ) => {
      // resolve the getPlio request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        clonedeep(global.dummyPublishedPlio),
        mockAxios.queue()[0]
      );

      // resolve the getMetrics request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        {
          data: metrics,
        },
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();
    };
    beforeEach(async () => {
      resolveAPICall();
    });

    it("renders values for a published Plio", async () => {
      let dummyVideoID = global.dummyPublishedPlio.data.video.url.split("=")[1];
      expect(wrapper.vm.videoID).toBe(dummyVideoID);
      expect(wrapper.find('[data-test="thumbnail"]').exists()).toBe(true);
      expect(wrapper.vm.videoThumbnailURL).toBe(
        `https://img.youtube.com/vi/${dummyVideoID}/sddefault.jpg`
      );

      expect(wrapper.find('[data-test="title"]').text()).toBe(
        global.dummyPublishedPlio.data.name
      );

      expect(wrapper.find('[data-test="numViewers"]').text()).toBe(
        String(global.dummyPlioMetrics["num_views"])
      );
      expect(wrapper.find('[data-test="watchTime"]').text()).toBe(
        "3 mins 22 secs"
      );
      expect(wrapper.find('[data-test="completion"]').text()).toBe(
        String(global.dummyPlioMetrics["percent_completed"]) + "%"
      );
      expect(wrapper.find('[data-test="questionAnswered"]').text()).toBe(
        String(global.dummyPlioMetrics["average_num_answered"])
      );
      expect(wrapper.find('[data-test="accuracy"]').text()).toBe(
        String(global.dummyPlioMetrics["accuracy"]) + "%"
      );
      expect(wrapper.find('[data-test="retention"]').text()).toBe(
        String(global.dummyPlioMetrics["percent_one_minute_retention"]) + "%"
      );
    });

    it("renders default metric values when none available", async () => {
      await mountWrapper();
      await resolveAPICall({});

      expect(wrapper.find('[data-test="numViewers"]').text()).toBe("0");
      expect(wrapper.find('[data-test="watchTime"]').text()).toBe("0 secs");
      expect(wrapper.find('[data-test="completion"]').text()).toBe("-");
      expect(wrapper.find('[data-test="questionAnswered"]').text()).toBe("-");
      expect(wrapper.find('[data-test="accuracy"]').text()).toBe("-");
      expect(wrapper.find('[data-test="retention"]').text()).toBe("-");
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
