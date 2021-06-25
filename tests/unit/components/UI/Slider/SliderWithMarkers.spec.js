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

    const slider = wrapper.find('[data-test="mainSlider"]');
    await slider.setValue(value);

    expect(wrapper.emitted()).toHaveProperty("update");
    expect(slider.element.value).toBe(String(value));
  });
});
