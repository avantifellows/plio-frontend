import { mount } from "@vue/test-utils";
import InputText from "@/components/UI/Text/InputText";

describe("InputText.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(InputText);
    expect(wrapper).toBeTruthy();
  });
});
