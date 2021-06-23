import { mount } from "@vue/test-utils";
import Footer from "@/components/Items/Question/Footer";

describe("Footer.vue", () => {
  let wrapper = mount(Footer);
  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
  });

  it("render answer not submitted with submit disabled correctly", () => {
    expect(wrapper.get('[data-test="reviseButton"]')).toBeTruthy();
    expect(wrapper.get('[data-test="submitButton"]')).toBeTruthy();
    expect(wrapper.find('[data-test="answerFeedback"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="proceedButton"]').exists()).toBeFalsy();
    expect(wrapper.get('[data-test="submitButton"]').element.disabled).toBe(
      true
    );
  });

  it("render answer not submitted with submit enabled correctly", async () => {
    await wrapper.setProps({
      isSubmitEnabled: true,
    });
    expect(wrapper.get('[data-test="submitButton"]').element.disabled).toBe(
      false
    );
  });

  it("render answer submitted with submit enabled correctly", async () => {
    await wrapper.setProps({
      isAnswerSubmitted: true,
    });
    expect(wrapper.find('[data-test="reviseButton"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="submitButton"]').exists()).toBeFalsy();
    expect(wrapper.get('[data-test="answerFeedback"]')).toBeTruthy();
    expect(wrapper.get('[data-test="proceedButton"]')).toBeTruthy();
  });
});
