import { mount } from "@vue/test-utils";
import TimeInput from "@/components/UI/Text/TimeInput";

describe("TimeInput.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(TimeInput);
    expect(wrapper).toBeTruthy();
  });
});
