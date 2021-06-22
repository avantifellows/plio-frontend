import { mount } from "@vue/test-utils";
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers";

describe("SliderWithMarkers.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(SliderWithMarkers);
    expect(wrapper).toBeTruthy();
  });
});
