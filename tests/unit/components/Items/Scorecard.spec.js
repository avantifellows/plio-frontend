import { mount, flushPromises } from "@vue/test-utils";
import Scorecard from "@/components/Items/Scorecard";
import i18n from "@/services/Localisation/i18n.js";
import domtoimage from "dom-to-image";

jest.mock("@/services/Functional/Utilities.js", () => ({
  __esModule: true,
  throwConfetti: jest.fn(),
  resetConfetti: jest.fn(),
  isScreenPortrait: jest.fn(),
  default: {
    getImageSource: jest.fn(),
  },
}));

/**
 * we are only declaring the mock for window.open here instead of defining it too;
 * this is because we will destroy it after each test and recreate it before each;
 */
let mockWindowOpen;

beforeEach(() => {
  jest.useFakeTimers();
  mockWindowOpen = jest.fn().mockImplementation(() => ({
    focus: jest.fn(),
  }));
  Object.defineProperty(window, "open", {
    writable: true,
    value: mockWindowOpen,
  });
});

afterEach(() => {
  // required otherwise the calls to window.open get stacked
  mockWindowOpen.mockRestore();
});

describe("Scorecard.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Scorecard);
    expect(wrapper).toBeTruthy();
  });

  it("should show/hide the scorecard popup using isShown prop", async () => {
    const progressPercentage = 50;
    const wrapper = mount(Scorecard, {
      props: {
        progressPercentage: progressPercentage,
      },
    });

    await wrapper.setProps({
      isShown: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressBarPercentage).toBe(progressPercentage);

    await wrapper.setProps({
      isShown: false,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressBarPercentage).toBe(0);
  });

  it("should adjust the radius/stroke of the progress bar according to screen size and orientation", async () => {
    const wrapper = mount(Scorecard);

    expect(wrapper.vm.circularProgressRadius).toBe(130);
    expect(wrapper.vm.circularProgressStroke).toBe(20);

    await wrapper.setData({
      innerWidth: 1300,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(150);
    expect(wrapper.vm.circularProgressStroke).toBe(22);

    await wrapper.setData({
      innerWidth: 800,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(110);
    expect(wrapper.vm.circularProgressStroke).toBe(18);

    await wrapper.setData({
      innerWidth: 700,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(90);
    expect(wrapper.vm.circularProgressStroke).toBe(14);

    await wrapper.setData({
      innerWidth: 500,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(80);
    expect(wrapper.vm.circularProgressStroke).toBe(12);
  });

  it("should emit a signal when watch again is clicked", async () => {
    const restartVideo = jest.spyOn(Scorecard.methods, "restartVideo");
    const wrapper = mount(Scorecard);

    await wrapper.find('[data-test="watchAgainButton"]').trigger("click");
    expect(restartVideo).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("restart-video");
  });

  it("calls the right method on clicking share button", async () => {
    const shareScorecard = jest.spyOn(Scorecard.methods, "shareScorecard");

    const wrapper = mount(Scorecard);
    await wrapper.find('[data-test="share"]').trigger("click");

    expect(shareScorecard).toHaveBeenCalled();
  });

  it("triggers sharing text on whatsapp upon clicking share button", async () => {
    const wrapper = mount(Scorecard);
    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it("share text on whatsapp when no questions answered", async () => {
    const wrapper = mount(Scorecard);
    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Plio!*%20%F0%9F%8F%86%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A"
    );
  });

  it("share text on whatsapp when one question answered", async () => {
    const progressPercentage = 50;
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 1,
        progressPercentage: progressPercentage,
      },
    });
    await wrapper.setProps({
      isShown: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Plio!*%20%F0%9F%8F%86%0A%0AI%20answered%201%20question%20with%2050%25%20accuracy%20on%20Plio%20today%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });

  it("share text on whatsapp when multiple questions answered", async () => {
    const progressPercentage = 50;
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 4,
        progressPercentage: progressPercentage,
      },
    });
    await wrapper.setProps({
      isShown: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Plio!*%20%F0%9F%8F%86%0A%0AI%20answered%204%20questions%20with%2050%25%20accuracy%20on%20Plio%20today%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });

  it("share hindi text on whatsapp when one question answered", async () => {
    i18n.global.locale = "hi";
    const progressPercentage = 50;
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 1,
        progressPercentage: progressPercentage,
      },
    });
    await wrapper.setProps({
      isShown: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*%E0%A4%B9%E0%A5%81%E0%A4%B0%E0%A5%8D%E0%A4%B0%E0%A5%87!%20%E0%A4%AE%E0%A5%88%E0%A4%82%E0%A4%A8%E0%A5%87%20%E0%A4%85%E0%A4%AA%E0%A4%A8%E0%A4%BE%20%E0%A4%AA%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%AF%E0%A5%8B%E0%A4%82%20%E0%A4%AA%E0%A5%82%E0%A4%B0%E0%A4%BE%20%E0%A4%95%E0%A4%B0%20%E0%A4%B2%E0%A4%BF%E0%A4%AF%E0%A4%BE!*%20%F0%9F%8F%86%0A%0A%E0%A4%AE%E0%A5%88%E0%A4%82%E0%A4%A8%E0%A5%87%20%E0%A4%86%E0%A4%9C%20%E0%A4%95%E0%A5%87%20%E0%A4%AA%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%AF%E0%A5%8B%E0%A4%82%20%E0%A4%AA%E0%A4%B0%2050%25%20%E0%A4%B8%E0%A4%9F%E0%A5%80%E0%A4%95%E0%A4%A4%E0%A4%BE%20%E0%A4%95%E0%A5%87%20%E0%A4%B8%E0%A4%BE%E0%A4%A5%201%20%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%B6%E0%A5%8D%E0%A4%A8%20%E0%A4%95%E0%A4%BE%20%E0%A4%89%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%B0%20%E0%A4%A6%E0%A4%BF%E0%A4%AF%E0%A4%BE%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A"
    );
  });

  it("share hindi text on whatsapp when multiple questions answered", async () => {
    i18n.global.locale = "hi";
    const progressPercentage = 50;
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 4,
        progressPercentage: progressPercentage,
      },
    });
    await wrapper.setProps({
      isShown: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*%E0%A4%B9%E0%A5%81%E0%A4%B0%E0%A5%8D%E0%A4%B0%E0%A5%87!%20%E0%A4%AE%E0%A5%88%E0%A4%82%E0%A4%A8%E0%A5%87%20%E0%A4%85%E0%A4%AA%E0%A4%A8%E0%A4%BE%20%E0%A4%AA%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%AF%E0%A5%8B%E0%A4%82%20%E0%A4%AA%E0%A5%82%E0%A4%B0%E0%A4%BE%20%E0%A4%95%E0%A4%B0%20%E0%A4%B2%E0%A4%BF%E0%A4%AF%E0%A4%BE!*%20%F0%9F%8F%86%0A%0A%E0%A4%AE%E0%A5%88%E0%A4%82%E0%A4%A8%E0%A5%87%20%E0%A4%86%E0%A4%9C%20%E0%A4%95%E0%A5%87%20%E0%A4%AA%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%AF%E0%A5%8B%E0%A4%82%20%E0%A4%AA%E0%A4%B0%2050%25%20%E0%A4%B8%E0%A4%9F%E0%A5%80%E0%A4%95%E0%A4%A4%E0%A4%BE%20%E0%A4%95%E0%A5%87%20%E0%A4%B8%E0%A4%BE%E0%A4%A5%204%20%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%B6%E0%A5%8D%E0%A4%A8%E0%A5%8B%E0%A4%82%20%E0%A4%95%E0%A4%BE%20%E0%A4%89%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%B0%20%E0%A4%A6%E0%A4%BF%E0%A4%AF%E0%A4%BE%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A"
    );
  });

  it("triggers domtoimage when share button is clicked where supported", async () => {
    const toBlob = jest.spyOn(domtoimage, "toBlob");
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 4,
      },
    });

    // mock navigator.canShare
    global.navigator.canShare = jest.fn(() => true);
    global.navigator.share = jest.fn(() => new Promise((resolve) => resolve()));

    await wrapper.find('[data-test="share"]').trigger("click");
    expect(toBlob).toHaveBeenCalled();
  });

  it("calls navigator.share when domtoimage is done preparing the blob", async () => {
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 4,
      },
    });

    // mock navigator.canShare
    global.navigator.canShare = jest.fn(() => true);
    global.navigator.share = jest.fn(() => {
      return new Promise((resolve) => resolve());
    });

    await wrapper.find('[data-test="share"]').trigger("click");
    expect(global.navigator.share).toHaveBeenCalled();
    expect(wrapper.vm.isSpinnerShown).toBeFalsy();
  });

  it("triggers sharing whatsapp text if canShare in general but can't share the image", async () => {
    const wrapper = mount(Scorecard, {
      props: {
        numQuestionsAnswered: 4,
      },
    });

    // mock navigator.canShare
    global.navigator.canShare = jest.fn((arg) => {
      if (arg.files != undefined) return false;
      return true;
    });
    global.navigator.share = jest.fn(() => {
      return new Promise((resolve) => resolve());
    });

    await wrapper.find('[data-test="share"]').trigger("click");
    expect(global.navigator.share).not.toHaveBeenCalled();
    expect(mockWindowOpen).toHaveBeenCalled();
  });
});
