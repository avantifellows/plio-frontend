import { mount } from "@vue/test-utils";
import QuestionTypeDropdown from "@/components/Editor/QuestionTypeDropdown";
import VueClickAway from "vue3-click-away";

describe("QuestionTypeDropdown.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(QuestionTypeDropdown, {
      global: {
        directives: {
          clickAway: VueClickAway,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
