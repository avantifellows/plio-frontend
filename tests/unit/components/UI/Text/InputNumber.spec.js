import { mount } from "@vue/test-utils";
import InputNumber from "@/components/UI/Text/InputNumber";

describe("InputNumber.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(InputNumber);
    expect(wrapper).toBeTruthy();
  });
});
