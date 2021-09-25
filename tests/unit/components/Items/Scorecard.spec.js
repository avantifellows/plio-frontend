import { mount, flushPromises } from "@vue/test-utils";
import Scorecard from "@/components/Items/Scorecard";

jest.mock("@/services/Functional/Utilities.js", () => ({
  __esModule: true,
  throwConfetti: jest.fn(),
  resetConfetti: jest.fn(),
}));

beforeEach(() => {
  jest.useFakeTimers();
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
});
