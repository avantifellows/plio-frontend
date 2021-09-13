import { mount, flushPromises } from "@vue/test-utils";
import Scorecard from "@/components/Items/Scorecard/Scorecard";

beforeEach(() => {
  jest.useFakeTimers();
});

describe("Scorecard.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Scorecard);
    expect(wrapper).toBeTruthy();
  });

  it("should show/hide the scorecard popup using showScorecard prop", async () => {
    const progressPercentage = 50;
    const throwConfetti = jest.spyOn(Scorecard.methods, "throwConfetti");
    const wrapper = mount(Scorecard, {
      props: {
        progressPercentage: progressPercentage,
      },
    });

    await wrapper.setProps({
      showScorecard: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressPercentage).toBe(progressPercentage);
    expect(wrapper.vm.showConfetti).toBeTruthy();
    expect(throwConfetti).toHaveBeenCalled();

    await wrapper.setProps({
      showScorecard: false,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressPercentage).toBe(0);
    expect(wrapper.vm.showConfetti).not.toBeTruthy();
  });

  it("should adjust the radius/stroke of the progress bar according to screen size and orientation", async () => {
    const wrapper = mount(Scorecard, {
      props: {
        isPortrait: true,
      },
    });

    expect(wrapper.vm.circularProgressRadius).toBe(100);
    expect(wrapper.vm.circularProgressStroke).toBe(15);

    await wrapper.setProps({
      isPortrait: false,
    });
    await wrapper.setData({
      innerWidth: 1100,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(120);
    expect(wrapper.vm.circularProgressStroke).toBe(18);

    await wrapper.setProps({
      isPortrait: false,
    });
    await wrapper.setData({
      innerWidth: 800,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(100);
    expect(wrapper.vm.circularProgressStroke).toBe(15);

    await wrapper.setProps({
      isPortrait: false,
    });
    await wrapper.setData({
      innerWidth: 700,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(80);
    expect(wrapper.vm.circularProgressStroke).toBe(12);

    await wrapper.setProps({
      isPortrait: false,
    });
    await wrapper.setData({
      innerWidth: 1200,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(150);
    expect(wrapper.vm.circularProgressStroke).toBe(20);

    await wrapper.setProps({
      isPortrait: false,
    });
    await wrapper.setData({
      innerWidth: 500,
    });
    expect(wrapper.vm.circularProgressRadius).toBe(50);
    expect(wrapper.vm.circularProgressStroke).toBe(8);
  });

  it("should emit a signal when watch again is clicked", async () => {
    const watchAgain = jest.spyOn(Scorecard.methods, "watchAgain");
    const wrapper = mount(Scorecard);

    await wrapper.find('[data-test="watchAgainButton"]').trigger("click");
    expect(watchAgain).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("watch-again");
  });
});
