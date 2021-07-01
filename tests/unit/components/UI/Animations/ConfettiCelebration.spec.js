import { mount } from "@vue/test-utils";
import ConfettiCelebration from "@/components/UI/Animations/ConfettiCelebration";

describe("ConfettiCelebration.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ConfettiCelebration);
    expect(wrapper.findAll('[data-test="confetti"]').length).toBe(13);
  });
});
