import { mount } from "@vue/test-utils";
import QuestionTypeDropdown from "@/components/Editor/QuestionTypeDropdown";

describe("QuestionTypeDropdown.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(QuestionTypeDropdown);
    expect(wrapper).toBeTruthy();
  });
});
