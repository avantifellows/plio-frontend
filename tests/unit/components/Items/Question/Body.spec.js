import { mount } from "@vue/test-utils";
import Body from "@/components/Items/Question/Body";

afterEach(() => {
  jest.useRealTimers();
});

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

  it("renders options", () => {
    const options = ["a", ""];
    const wrapper = mount(Body, {
      props: {
        options: options,
      },
    });
    expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="option-2"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="option-0"]').text()).toBe(options[0]);
  });

  it("option text selected correctly", () => {
    const options = ["a", ""];
    const wrapper = mount(Body, {
      props: {
        options: options,
      },
    });
    wrapper.find('[data-test="option-0"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("option-selected");
  });

  it("option radio selected correctly", () => {
    const options = ["a", ""];
    const wrapper = mount(Body, {
      props: {
        options: options,
      },
    });
    wrapper.find('[data-test="radio-0"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("option-selected");
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
    // default
    expect(wrapper.find('[data-test="charLimitContainer"]').exists()).toBe(
      false
    );

    // set char limit
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

    // add input such that chars left = > 0.2 * maxCharLimit
    const value = "thetest";
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue(value);
    expect(wrapper.vm.charactersLeft).toBe(
      charLimitProps.maxCharLimit - value.length
    );
    expect(wrapper.vm.maxCharLimitClass).toBe("text-gray-400");

    // add input such that chars left = < 0.2 * maxCharLimit, > 0.1 * charLimit
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue("thetestthetestthetestthetestthetestthetest");
    expect(wrapper.vm.maxCharLimitClass).toBe("text-yellow-500");

    // add input such that chars left = < 0.1 * maxCharLimit
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue("thetestthetestthetestthetestthetestthetestthetest");
    expect(wrapper.vm.maxCharLimitClass).toBe("text-red-400");
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

  it("renders subjective answer when default answer given", async () => {
    const props = {
      questionType: "subjective",
      draftAnswer: "abc",
    };
    const wrapper = mount(Body, {
      props: props,
    });

    expect(
      wrapper.find('[data-test="subjectiveAnswer"]').find('[data-test="input"]')
        .element.value
    ).toBe(props.draftAnswer);
  });

  it("renders subjective answer when submitted answer given", async () => {
    const props = {
      questionType: "subjective",
      submittedAnswer: "abc",
    };
    const wrapper = mount(Body, {
      props: props,
    });

    expect(
      wrapper.find('[data-test="subjectiveAnswer"]').find('[data-test="input"]')
        .element.value
    ).toBe(props.submittedAnswer);
  });

  it("updates subjective answer through input field", async () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "subjective",
      },
    });

    const value = "test";
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue(value);
    expect(wrapper.vm.subjectiveAnswer).toBe(value);
  });

  it("corrects subjective answer when exceeds max limit", async () => {
    const props = {
      questionType: "subjective",
      hasCharLimit: true,
      maxCharLimit: 10,
    };
    const wrapper = mount(Body, {
      props: props,
    });

    const value = "thetestthetest";
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue(value);
    expect(wrapper.vm.subjectiveAnswer).toBe(
      value.slice(0, props.maxCharLimit)
    );
  });

  it("char limit checker triggered on keypress", async () => {
    const checkCharLimitMock = jest.spyOn(Body.methods, "checkCharLimit");
    const props = {
      questionType: "subjective",
    };
    const wrapper = mount(Body, {
      props: props,
    });

    // test first if condition inside checkCharLimit
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .trigger("keypress", {
        key: "a",
      });
    expect(checkCharLimitMock).toHaveBeenCalled();

    // test second if condition inside checkCharLimit
    await wrapper.setProps({
      hasCharLimit: true,
      maxCharLimit: 5,
    });
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue("atest");
    await wrapper
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .trigger("keypress", {
        key: "a",
      });
    expect(checkCharLimitMock).toHaveBeenCalled();
  });

  it("starts loading image if imageData is passed", () => {
    const startImageLoading = jest.spyOn(Body.methods, "startImageLoading");
    const wrapper = mount(Body, {
      props: {
        questionType: "mcq",
        imageData: {
          url: "mock",
          alt_text: "mock",
        },
      },
    });

    expect(startImageLoading).toHaveBeenCalled();
  });
});
