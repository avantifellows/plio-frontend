import { mount } from "@vue/test-utils";
import Body from "@/components/Items/Question/Body";

describe("Body.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Body);
    expect(wrapper.find('[data-test="optionContainer"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-test="subjectiveAnswerContainer"]').exists()
    ).toBe(false);
  });

  it("renders question text", () => {
    const testQuestionText = "ABC";
    const wrapper = mount(Body, {
      props: {
        questionText: testQuestionText,
      },
    });
    expect(wrapper.find('[data-test="questionText"]').text()).toBe(
      testQuestionText
    );
  });

  it("should render subjective question with default values", () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "subjective",
      },
    });

    expect(wrapper.find('[data-test="optionContainer"]').exists()).toBe(false);
    expect(
      wrapper.find('[data-test="subjectiveAnswerContainer"]').exists()
    ).toBe(true);
  });

  it("renders char limit correctly", async () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "subjective",
      },
    });
    expect(wrapper.find('[data-test="charLimitContainer"]').exists()).toBe(
      false
    );

    const charLimitProps = {
      hasCharLimit: true,
      maxCharLimit: 50,
    };
    await wrapper.setProps(charLimitProps);

    expect(wrapper.find('[data-test="charLimitContainer"]').exists()).toBe(
      true
    );
    expect(wrapper.find('[data-test="charLimit"]').text()).toBe(
      String(charLimitProps.maxCharLimit)
    );

    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue("a");
    expect(wrapper.vm.charactersLeft).toBe(charLimitProps.maxCharLimit - 1);
  });

  it("renders disabled subjective answer in preview mode", async () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "subjective",
        previewMode: true,
      },
    });

    expect(
      wrapper.find('[data-test="subjectiveAnswer"]').find('[data-test="input"]')
        .element.disabled
    ).toBe(true);
  });

  it("renders subjective answer when answer submitted", async () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "subjective",
        isAnswerSubmitted: true,
      },
    });

    expect(
      wrapper.find('[data-test="subjectiveAnswer"]').find('[data-test="input"]')
        .element.disabled
    ).toBe(true);
  });
});
