import { mount } from "@vue/test-utils";
import ItemEditor from "@/components/Editor/ItemEditor";

describe("ItemEditor.vue", () => {
  it("should render with required values for mcq question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            details: {
              text: "test",
              type: "mcq",
              options: ["", ""],
            },
            time: 13,
          },
        ],
      },
    });
    expect(wrapper.find('[data-test="options"]').exists()).toBeTruthy();
    expect(
      wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
    ).toBeFalsy();
    // no option should be marked as correct answer as no correct answer has been given
    var options = wrapper.findAll('[data-test="option"]');
    options.forEach((option) => {
      expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
        "text-green-500"
      );
    });
  });

  it("set correct answer correctly for mcq question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            details: {
              text: "test",
              type: "mcq",
              options: ["", ""],
              correct_answer: 1,
            },
            time: 13,
          },
        ],
      },
    });
    expect(wrapper.find('[data-test="options"]').exists()).toBeTruthy();
    expect(
      wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
    ).toBeFalsy();
    // the 2nd option should be marked as correct answer
    var options = wrapper.findAll('[data-test="option"]');
    options.forEach((option, optionIndex) => {
      if (!optionIndex)
        expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
          "text-green-500"
        );
      else
        expect(option.find('[data-test="startIcon"]').classes()).toContain(
          "text-green-500"
        );
    });
  });

  it("should render with required values for subjective question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            details: {
              text: "test",
              type: "subjective",
            },
            time: 13,
          },
        ],
        questionTypeIndex: 1,
      },
    });
    expect(wrapper.find('[data-test="options"]').exists()).toBeFalsy();
    expect(
      wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
    ).toBeTruthy();
  });

  it("should disable appropriate fields for mcq question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            details: {
              text: "test",
              type: "mcq",
              options: ["", ""],
              correct_answer: 1,
            },
            time: 13,
          },
        ],
        isInteractionDisabled: true,
      },
    });
    // question type dropdown should be disabled
    expect(
      wrapper
        .find('[data-test="questionTypeDropdown"]')
        .find('[data-test="toggleButton"]').element.disabled
    ).toBe(true);
    // question text area should not be disabled
    expect(
      wrapper.find('[data-test="questionText"]').find('[data-test="input"]')
        .element.disabled
    ).toBe(false);
    // question image button should be disabled
    expect(wrapper.find('[data-test="questionImage"]').element.disabled).toBe(
      true
    );
    // button to add option should be disabled
    expect(wrapper.find('[data-test="addOption"]').element.disabled).toBe(true);
    // button to delete question should be disabled
    expect(wrapper.find('[data-test="deleteQuestion"]').element.disabled).toBe(
      true
    );

    var options = wrapper.findAll('[data-test="option"]');
    options.forEach((option) => {
      // option text area should not be disabled
      expect(option.find('[data-test="input"]').element.disabled).toBe(false);
      // setting correct answer should not be disabled
      expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
        "cursor-not-allowed"
      );
      // button to delete option should be disabled
      expect(option.find('[data-test="endIcon"]').classes()).toContain(
        "cursor-not-allowed"
      );
    });
  });

  it("clearing max limit sets it to the minimum value", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            details: {
              text: "test",
              type: "subjective",
              has_char_limit: true,
            },
            time: 13,
          },
        ],
        questionTypeIndex: 1,
      },
    });
    await wrapper
      .find('[data-test="maxCharLimit"]')
      .find('[data-test="input"]')
      .setValue("");
    expect(wrapper.vm.maxCharLimit).toBe(100);
  });
});
