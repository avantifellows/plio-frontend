import { mount, flushPromises } from "@vue/test-utils";
import Scorecard from "@/components/Items/Scorecard";

jest.mock("@/services/Functional/Utilities.js", () => ({
  __esModule: true,
  throwConfetti: jest.fn(),
  resetConfetti: jest.fn(),
}));

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
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Plio!*%20%F0%9F%8F%86%0A%0AI%20answered%201%20question%20with%2050%25%20accuracy%20on%20Plio%20today%20%F0%9F%98%87%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });

  it("share text on whatsapp when one question answered", async () => {
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
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Plio!*%20%F0%9F%8F%86%0A%0AI%20answered%204%20questions%20with%2050%25%20accuracy%20on%20Plio%20today%20%F0%9F%98%87%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });
});
