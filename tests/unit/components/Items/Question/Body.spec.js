import { mount } from "@vue/test-utils";
import Body from "@/components/Items/Question/Body";

describe("Body.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Body);
  });

  describe("generic", () => {
    it("should render with default values", () => {
      expect(wrapper.find('[data-test="optionContainer"]').exists()).toBe(true);
      expect(
        wrapper.find('[data-test="subjectiveAnswerContainer"]').exists()
      ).toBe(false);
    });

    it("renders question text", async () => {
      const testQuestionText = "ABC";
      await wrapper.setProps({
        questionText: testQuestionText,
      });
      expect(wrapper.find('[data-test="questionText"]').text()).toBe(
        testQuestionText
      );
    });

    it("renders mcq options", async () => {
      const options = ["a", ""];
      await wrapper.setProps({
        options: options,
      });
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(options[0]);
      expect(wrapper.vm.optionInputType).toBe("radio");
    });
  });

  describe("subjective questions", () => {
    const mountWrapper = () => {
      wrapper = mount(Body, {
        props: {
          questionType: "subjective",
        },
      });
    };
    beforeEach(() => {
      mountWrapper();
    });
    it("should render question with default values", () => {
      expect(wrapper.find('[data-test="optionContainer"]').exists()).toBe(
        false
      );
      expect(
        wrapper.find('[data-test="subjectiveAnswerContainer"]').exists()
      ).toBe(true);
    });

    it("renders char limit correctly", async () => {
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

    it("renders disabled answer input field in preview mode", async () => {
      await wrapper.setProps({
        previewMode: true,
      });

      expect(
        wrapper
          .find('[data-test="subjectiveAnswer"]')
          .find('[data-test="input"]').element.disabled
      ).toBe(true);
    });

    it("renders disabled answer input field when answer submitted", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
      });

      expect(
        wrapper
          .find('[data-test="subjectiveAnswer"]')
          .find('[data-test="input"]').element.disabled
      ).toBe(true);
    });

    it("displays the answer when default answer given", async () => {
      const draftAnswer = "abc";
      await wrapper.setProps({
        draftAnswer: draftAnswer,
      });

      expect(
        wrapper
          .find('[data-test="subjectiveAnswer"]')
          .find('[data-test="input"]').element.value
      ).toBe(draftAnswer);
    });

    it("displays the answer when submitted answer given", async () => {
      const submittedAnswer = "abc";
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
      });

      expect(
        wrapper
          .find('[data-test="subjectiveAnswer"]')
          .find('[data-test="input"]').element.value
      ).toBe(submittedAnswer);
    });

    it("updates the answer through the input field", async () => {
      const value = "test";
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);
      expect(wrapper.vm.subjectiveAnswer).toBe(value);
    });

    it("corrects the answer when it exceeds the max char limit", async () => {
      const maxCharLimit = 10;
      await wrapper.setProps({
        hasCharLimit: true,
        maxCharLimit: maxCharLimit,
      });

      const value = "thetestthetest";
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);
      expect(wrapper.vm.subjectiveAnswer).toBe(value.slice(0, maxCharLimit));
    });

    it("char limit checker triggered on keypress", async () => {
      const checkCharLimitMock = jest.spyOn(Body.methods, "checkCharLimit");
      mountWrapper();

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
  });

  describe("mcq questions", () => {
    const options = ["a", ""];

    beforeEach(() => {
      wrapper = mount(Body, {
        props: {
          options: options,
        },
      });
    });

    it("renders options", () => {
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(options[0]);
      expect(wrapper.vm.optionInputType).toBe("radio");
    });

    it("set options selected based on draft answer", async () => {
      const draftAnswer = 0;
      await wrapper.setProps({
        draftAnswer: draftAnswer,
      });

      expect(wrapper.vm.isOptionChecked(draftAnswer)).toBeTruthy();
      expect(wrapper.vm.isOptionChecked(1)).toBeFalsy();
    });

    it("option text selected correctly", () => {
      wrapper.find('[data-test="option-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("option radio selected correctly", () => {
      wrapper.find('[data-test="optionSelector-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("highlights options based on correct/wrong answers", async () => {
      const submittedAnswer = 0;
      const correctAnswer = 1;
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
        correctAnswer: correctAnswer,
        isAnswerSubmitted: true,
      });

      expect(
        wrapper.find(`[data-test="optionContainer-${correctAnswer}"]`).classes()
      ).toContain("bg-green-500");
      expect(
        wrapper
          .find(`[data-test="optionContainer-${submittedAnswer}"]`)
          .classes()
      ).toContain("bg-red-500");
    });
  });

  describe("checkbox", () => {
    const options = ["a", "b", "c"];
    beforeEach(() => {
      wrapper = mount(Body, {
        props: {
          options: options,
          questionType: "checkbox",
        },
      });
    });

    it("renders options", () => {
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-3"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(options[0]);
      expect(wrapper.vm.optionInputType).toBe("checkbox");
    });

    it("set options selected based on draft answer", async () => {
      const draftAnswer = new Set([1, 2]);
      await wrapper.setProps({
        draftAnswer: draftAnswer,
      });

      expect(wrapper.vm.isOptionChecked(0)).toBeFalsy();
      expect(wrapper.vm.isOptionChecked(1)).toBeTruthy();
      expect(wrapper.vm.isOptionChecked(2)).toBeTruthy();
    });

    it("option text selected correctly", () => {
      wrapper.find('[data-test="option-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("option checkbox selected correctly", () => {
      wrapper.find('[data-test="optionSelector-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("highlights options based on correct/wrong answers", async () => {
      const submittedAnswer = new Set([1, 2]);
      const correctAnswer = new Set([0, 1]);
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
        correctAnswer: correctAnswer,
        isAnswerSubmitted: true,
      });

      expect(
        wrapper.find('[data-test="optionContainer-0"]').classes()
      ).toContain("bg-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).toContain("bg-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).toContain("bg-red-500");
    });
  });

  it("starts loading image if imageData is passed", () => {
    const startImageLoading = jest.spyOn(Body.methods, "startImageLoading");
    mount(Body, {
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
