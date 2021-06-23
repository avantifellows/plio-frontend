import { mount } from "@vue/test-utils";
import Textarea from "@/components/UI/Text/Textarea";

describe("Textarea.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Textarea);
    expect(wrapper).toBeTruthy();
  });
});
