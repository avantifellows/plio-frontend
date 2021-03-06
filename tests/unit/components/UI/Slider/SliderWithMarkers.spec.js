import { mount } from "@vue/test-utils";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers";

describe("SliderWithMarkers.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(SliderWithMarkers);
    expect(wrapper).toBeTruthy();
  });

  it("sets properties for main slider", () => {
    const sliderProps = {
      end: 50,
      step: 0.01,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
    });

    const slider = wrapper.find('[data-test="mainSlider"]');
    expect(slider.attributes("max")).toBe(String(sliderProps.end));
    expect(slider.attributes("step")).toBe(String(sliderProps.step));
  });

  it("sets current value for the main slider through props", () => {
    const sliderProps = {
      value: 5,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
    });

    const slider = wrapper.find('[data-test="mainSlider"]');
    expect(slider.element.value).toBe(String(sliderProps.value));
  });

  it("sets current value for the main slider through input field", async () => {
    const wrapper = mount(SliderWithMarkers);
    const value = 10;

    await wrapper.find('[data-test="mainSlider"]').setValue(value);

    expect(wrapper.emitted()).toHaveProperty("update");
    expect(wrapper.emitted()).toHaveProperty("update:value");
    expect(wrapper.emitted("update:value")[0][0]).toBe(value);
  });

  it("sets markers correctly", () => {
    const sliderProps = {
      markerPositions: [10, 20, 30],
      end: 100,
    };
    const data = {
      sliderWidth: 100,
      markerWidth: 10,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
      data() {
        return data;
      },
    });

    const multiplier = Number(
      (
        ((data.sliderWidth - data.markerWidth) * 100) /
        (sliderProps.end * data.sliderWidth)
      ).toFixed(2)
    );

    const expectedMarkerRelativePositions = [];
    sliderProps.markerPositions.forEach((markerPosition) => {
      expectedMarkerRelativePositions.push(markerPosition * multiplier);
    });
    expect(wrapper.vm.markerRelativePositions).toEqual(
      expectedMarkerRelativePositions
    );
    expect(wrapper.find('[data-test="marker-0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="marker-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="marker-2"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="marker-3"]').exists()).toBe(false);
  });

  it("sets active marker on hover/touch", async () => {
    const sliderProps = {
      markerPositions: [10, 20, 30],
    };
    const data = {
      sliderWidth: 100,
      markerWidth: 10,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
      data() {
        return data;
      },
    });

    // mouse event
    let marker = wrapper.find('[data-test="marker-0"]');
    await marker.trigger("mouseover");

    expect(wrapper.vm.activeMarkerIndex).toBe(0);

    await marker.trigger("mouseout");
    expect(wrapper.vm.activeMarkerIndex).toBe(null);

    // touch event
    await marker.trigger("touchstart");

    expect(wrapper.vm.activeMarkerIndex).toBe(0);

    await marker.trigger("touchend");
    expect(wrapper.vm.activeMarkerIndex).toBe(null);
  });

  it("clicks marker correctly", async () => {
    const sliderProps = {
      markerPositions: [10, 20, 30],
    };
    const data = {
      sliderWidth: 100,
      markerWidth: 10,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
      data() {
        return data;
      },
    });

    // mouse event
    let marker = wrapper.find('[data-test="marker-0"]');
    await marker.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("marker-selected");
  });

  it("sets value for marker through input field", async () => {
    const sliderProps = {
      markerPositions: [10, 20, 30],
    };
    const data = {
      sliderWidth: 100,
      markerWidth: 10,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
      data() {
        return data;
      },
    });
    const value = 15;

    let marker = wrapper.find('[data-test="marker-0"]');
    await marker.setValue(value);

    expect(wrapper.emitted()).toHaveProperty("marker-drag");
    expect(marker.element.value).toBe(String(value));
  });

  it("marker change detected correctly", async () => {
    const sliderProps = {
      markerPositions: [10, 20, 30],
    };
    const data = {
      sliderWidth: 100,
      markerWidth: 10,
    };
    const wrapper = mount(SliderWithMarkers, {
      props: sliderProps,
      data() {
        return data;
      },
    });

    await wrapper.find('[data-test="marker-0"]').trigger("change");

    expect(wrapper.emitted()).toHaveProperty("marker-drag-end");
  });
});
