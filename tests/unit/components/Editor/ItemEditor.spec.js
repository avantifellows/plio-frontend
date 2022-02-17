import { mount, flushPromises } from "@vue/test-utils";
import ItemEditor from "@/components/Editor/ItemEditor";
let clonedeep = require("lodash.clonedeep");

describe("ItemEditor.vue", () => {
  let wrapper;

  let itemList = [
    {
      type: "question",
      time: 13.3,
    },
    {
      type: "question",
      time: 20,
    },
  ];
  let itemDetailList = [
    {
      text: "test",
      type: "mcq",
      options: ["", ""],
    },
    {
      text: "test",
      type: "checkbox",
      options: ["", "", ""],
      correct_answer: [0, 1],
    },
    {
      text: "test",
      type: "mcq",
      options: ["", ""],
      survey: true,
    },
  ];

  const mountWrapper = (newItemList = null, newItemDetailList = null) => {
    wrapper = mount(ItemEditor, {
      props: {
        itemList: newItemList == null ? itemList : newItemList,
        itemDetailList:
          newItemDetailList == null ? itemDetailList : newItemDetailList,
      },
    });
  };

  beforeEach(() => mountWrapper());

  describe("time input", () => {
    it("should render time with milliseconds", () => {
      expect(
        wrapper
          .find('[data-test="time"]')
          .find('[data-test="millisecond"]')
          .find('[data-test="input"]').element.value
      ).toBe(String(parseInt((itemList[0].time % 1) * 1000)));
    });

    it("updates time value", async () => {
      await wrapper.setProps({
        videoDuration: 200,
      });

      const secondValue = 15;
      await wrapper
        .findAll('[data-test="time"]')[0]
        .find('[data-test="second"]')
        .find('[data-test="input"]')
        .setValue(secondValue);
      await wrapper
        .findAll('[data-test="time"]')[0]
        .find('[data-test="millisecond"]')
        .find('[data-test="input"]')
        .setValue(0);
      expect(wrapper.vm.localItemList[0].time).toBe(secondValue);
    });
  });

  describe("mcq questions", () => {
    it("should render with required values", () => {
      expect(wrapper.find('[data-test="options"]').exists()).toBeTruthy();
      expect(
        wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
      ).toBeFalsy();
      // no option should be marked as correct answer as no correct answer has been given
      wrapper.findAll('[data-test="option"]').forEach((option) => {
        expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
          "text-green-500"
        );
      });
    });

    it("should render with required values", () => {
      expect(wrapper.find('[data-test="options"]').exists()).toBeTruthy();
      expect(
        wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
      ).toBeFalsy();
      // no option should be marked as correct answer as no correct answer has been given
      wrapper.findAll('[data-test="option"]').forEach((option) => {
        expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
          "text-green-500"
        );
      });
    });

    it("should disable appropriate fields", async () => {
      await wrapper.setProps({
        isInteractionDisabled: true,
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
      expect(wrapper.find('[data-test="addOption"]').element.disabled).toBe(
        true
      );
      // button to delete question should be disabled
      expect(wrapper.find('[data-test="deleteItem"]').element.disabled).toBe(
        true
      );

      wrapper.findAll('[data-test="option"]').forEach((option) => {
        // option text area should not be disabled
        expect(option.find('[data-test="input"]').element.disabled).toBe(false);
        // setting correct answer should not be disabled
        expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
          "cursor-not-allowed"
        );
      });

      await wrapper.setProps({
        isInteractionDisabled: false,
      });
    });

    it("updates option value", async () => {
      const testValue = "test";
      await wrapper
        .findAll('[data-test="option"]')[0]
        .find('[data-test="input"]')
        .setValue(testValue);
      expect(wrapper.vm.localItemDetailList[0].options[0]).toBe(testValue);
    });

    it("sets correct answer correctly", async () => {
      let updatedItemDetailList = clonedeep(itemDetailList);
      updatedItemDetailList[0].correct_answer = 1;
      await wrapper.setProps({
        itemDetailList: updatedItemDetailList,
      });

      // the 2nd option should be marked as correct answer
      wrapper.findAll('[data-test="option"]').forEach((option, optionIndex) => {
        if (optionIndex != updatedItemDetailList[0].correct_answer)
          expect(
            option.find('[data-test="startIcon"]').classes()
          ).not.toContain("text-green-500");
        else
          expect(option.find('[data-test="startIcon"]').classes()).toContain(
            "text-green-500"
          );
      });
    });

    it("updates correct answer on selecting option", async () => {
      const correctOptionIndex = 1;
      await wrapper
        .findAll('[data-test="option"]')
        [correctOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");
      expect(wrapper.vm.localItemDetailList[0].correct_answer).toBe(
        correctOptionIndex
      );
    });

    it("clicking add option adds a new option", async () => {
      await wrapper.find('[data-test="addOption"]').trigger("click");
      expect(wrapper.vm.localItemDetailList[0].options.length).toBe(3);
    });

    it("clicking on delete option deletes option", async () => {
      await wrapper
        .findAll('[data-test="option"]')[0]
        .find('[data-test="endIcon"]')
        .trigger("click");
      expect(wrapper.emitted()).toHaveProperty("delete-option");
    });
  });

  describe("survey mcq question", () => {
    it("check for mcq type", async () => {
      await wrapper
        .find('[data-test="surveyquestioncheckbox"]')
        .setChecked("checked");
      await flushPromises();
      expect(wrapper.find('[data-test="surveyOptions"]').exists()).toBeTruthy();
      expect(wrapper.find('[data-test="options"]').exists()).toBeFalsy();
      expect(
        wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
      ).toBeFalsy();
      expect(wrapper.vm.isSurveyQuestion).toBe(true);
    });
  });

  describe("checkbox questions", () => {
    let itemList = [
      {
        type: "question",
        time: 13.3,
      },
    ];
    let itemDetailList = [
      {
        text: "test",
        type: "checkbox",
        options: ["", "", ""],
        correct_answer: [],
      },
    ];

    const mountWrapper = (newItemList = null, newItemDetailList = null) => {
      wrapper = mount(ItemEditor, {
        props: {
          itemList: newItemList == null ? clonedeep(itemList) : newItemList,
          itemDetailList:
            newItemDetailList == null
              ? clonedeep(itemDetailList)
              : newItemDetailList,
          questionTypeIndex: 2,
        },
      });
    };

    beforeEach(() => {
      mountWrapper();
    });

    it("should render with required values for mcq question", () => {
      expect(wrapper.find('[data-test="options"]').exists()).toBeTruthy();
      expect(
        wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
      ).toBeFalsy();
      // no option should be marked as correct answer as no correct answer has been given
      wrapper.findAll('[data-test="option"]').forEach((option) => {
        expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
          "text-green-500"
        );
      });
    });

    it("should disable appropriate fields for mcq question", async () => {
      await wrapper.setProps({
        isInteractionDisabled: true,
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
      expect(wrapper.find('[data-test="addOption"]').element.disabled).toBe(
        true
      );
      // button to delete question should be disabled
      expect(wrapper.find('[data-test="deleteItem"]').element.disabled).toBe(
        true
      );

      wrapper.findAll('[data-test="option"]').forEach((option) => {
        // option text area should not be disabled
        expect(option.find('[data-test="input"]').element.disabled).toBe(false);
        // setting correct answer should not be disabled
        expect(option.find('[data-test="startIcon"]').classes()).not.toContain(
          "cursor-not-allowed"
        );
      });

      await wrapper.setProps({
        isInteractionDisabled: false,
      });
    });

    it("updates option value", async () => {
      const testValue = "test";
      await wrapper
        .findAll('[data-test="option"]')[0]
        .find('[data-test="input"]')
        .setValue(testValue);
      expect(wrapper.vm.localItemDetailList[0].options[0]).toBe(testValue);
    });

    it("sets correct answer correctly", async () => {
      const correctAnswers = new Set([0, 1]);
      let updatedItemDetailList = clonedeep(itemDetailList);
      updatedItemDetailList[0].correct_answer = Array.from(correctAnswers);
      await wrapper.setProps({
        itemDetailList: updatedItemDetailList,
      });

      wrapper.findAll('[data-test="option"]').forEach((option, optionIndex) => {
        if (!correctAnswers.has(optionIndex))
          // the option is not a correct answer
          expect(
            option.find('[data-test="startIcon"]').classes()
          ).not.toContain("text-green-500");
        // the option is a correct answer
        else
          expect(option.find('[data-test="startIcon"]').classes()).toContain(
            "text-green-500"
          );
      });
    });

    it("adds new option to the correct answer", async () => {
      // select first option as an answer
      const correctOptionIndex = 0;
      await wrapper
        .findAll('[data-test="option"]')
        [correctOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");
      expect(wrapper.vm.localItemDetailList[0].correct_answer).toStrictEqual([
        correctOptionIndex,
      ]);

      // select second option as another answer
      const newCorrectOptionIndex = 1;
      await wrapper
        .findAll('[data-test="option"]')
        [newCorrectOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");
      expect(wrapper.vm.localItemDetailList[0].correct_answer).toStrictEqual([
        correctOptionIndex,
        newCorrectOptionIndex,
      ]);
    });

    it("deselects option as answer if multiple options are selected as answers", async () => {
      // select first option as an answer
      const correctOptionIndex = 0;
      await wrapper
        .findAll('[data-test="option"]')
        [correctOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");

      await wrapper
        .findAll('[data-test="option"]')[1]
        .find('[data-test="startIcon"]')
        .trigger("click");

      // re-selecting first option should reset it
      await wrapper
        .findAll('[data-test="option"]')
        [correctOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");

      expect(wrapper.vm.localItemDetailList[0].correct_answer).toStrictEqual([
        1,
      ]);
    });

    it("does not deselect option as answer if only one option is selected as the answer", async () => {
      // select first option as an answer
      const correctOptionIndex = 0;
      await wrapper
        .findAll('[data-test="option"]')
        [correctOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");

      // re-selecting first option should reset it
      await wrapper
        .findAll('[data-test="option"]')
        [correctOptionIndex].find('[data-test="startIcon"]')
        .trigger("click");

      expect(wrapper.vm.localItemDetailList[0].correct_answer).toStrictEqual([
        0,
      ]);
    });

    it("clicking add option adds a new option", async () => {
      await wrapper.find('[data-test="addOption"]').trigger("click");
      expect(wrapper.vm.localItemDetailList[0].options.length).toBe(4);
    });

    it("clicking delete option deletes the selected option", async () => {
      await wrapper
        .findAll('[data-test="option"]')[0]
        .find('[data-test="endIcon"]')
        .trigger("click");
      expect(wrapper.emitted()).toHaveProperty("delete-option");
    });
  });

  describe("subjective questions", () => {
    let itemList = [
      {
        type: "question",
        time: 13.3,
      },
    ];
    let itemDetailList = [
      {
        text: "test",
        type: "subjective",
        has_char_limit: true,
      },
    ];

    const mountWrapper = (newItemList = null, newItemDetailList = null) => {
      wrapper = mount(ItemEditor, {
        props: {
          itemList: newItemList == null ? itemList : newItemList,
          itemDetailList:
            newItemDetailList == null ? itemDetailList : newItemDetailList,
          questionTypeIndex: 1,
        },
      });
    };

    beforeEach(() => {
      mountWrapper();
    });

    it("should render with required values", () => {
      expect(wrapper.find('[data-test="options"]').exists()).toBeFalsy();
      expect(
        wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
      ).toBeTruthy();
    });

    it("check for survey mode", async () => {
      await wrapper
        .find('[data-test="surveyquestioncheckbox"]')
        .setChecked("checked");
      await flushPromises();
      expect(
        wrapper.find('[data-test="subjectiveQuestionContainer"]').exists()
      ).toBeTruthy();
      expect(wrapper.find('[data-test="surveyOptions"]').exists()).toBeFalsy();
      expect(wrapper.vm.isSurveyQuestion).toBe(true);
    });

    it("enables/disables max char limit", async () => {
      // checkbox should be checked by default
      expect(wrapper.vm.localItemDetailList[0].has_char_limit).toBe(true);

      // uncheck
      await wrapper
        .find('[data-test="maxCharLimitCheckbox"]')
        .setChecked(false);
      expect(wrapper.vm.localItemDetailList[0].has_char_limit).toBe(false);

      await wrapper.find('[data-test="maxCharLimitCheckbox"]').setChecked(true);
    });

    it("clearing max limit sets it to the minimum value", async () => {
      await wrapper
        .find('[data-test="maxCharLimit"]')
        .find('[data-test="input"]')
        .setValue("");
      expect(wrapper.vm.maxCharLimit).toBe(100);
    });

    it("triggers keyup on max char limit input box", async () => {
      const maxCharLimitInputKeypress = jest.spyOn(
        ItemEditor.methods,
        "maxCharLimitInputKeypress"
      );
      mountWrapper();
      await wrapper
        .find('[data-test="maxCharLimit"]')
        .find('[data-test="input"]')
        .trigger("keypress", {
          key: 1,
        });
      expect(maxCharLimitInputKeypress).toHaveBeenCalled();
    });

    it("triggers keydown on max char limit input box", () => {
      const maxCharLimitInputKeydown = jest.spyOn(
        ItemEditor.methods,
        "maxCharLimitInputKeydown"
      );
      mountWrapper();
      wrapper
        .find('[data-test="maxCharLimit"]')
        .find('[data-test="input"]')
        .trigger("keydown", {
          key: 1,
        });
      expect(maxCharLimitInputKeydown).toHaveBeenCalled();
    });
  });

  describe("buttons", () => {
    it("clicking add item hides item editor", async () => {
      const removeSelectedItemIndex = jest.spyOn(
        ItemEditor.methods,
        "removeSelectedItemIndex"
      );
      mountWrapper();
      await wrapper.find('[data-test="addItem"]').trigger("click");
      expect(removeSelectedItemIndex).toHaveBeenCalled();
    });

    it("emits on clicking delete item", async () => {
      await wrapper.find('[data-test="deleteItem"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("delete-selected-item");
    });

    describe("multiple items", () => {
      let updatedItemList = clonedeep(itemList);
      let updatedItemDetailList = clonedeep(itemDetailList);
      updatedItemList.push({
        type: "question",
        time: 20,
      });
      updatedItemDetailList.push({
        text: "test",
        type: "mcq",
        options: ["", ""],
      });

      it("clicking next item navigates to next item", async () => {
        const updateSelectedItemIndex = jest.spyOn(
          ItemEditor.methods,
          "updateSelectedItemIndex"
        );
        mountWrapper(updatedItemList, updatedItemDetailList);
        await wrapper.find('[data-test="nextItem"]').trigger("click");
        expect(updateSelectedItemIndex).toHaveBeenCalledWith(1);
      });

      it("clicking previous item navigates to previous item", async () => {
        const updateSelectedItemIndex = jest.spyOn(
          ItemEditor.methods,
          "updateSelectedItemIndex"
        );
        mountWrapper(updatedItemList, updatedItemDetailList);
        await wrapper.setProps({
          selectedItemIndex: 1,
        });
        await wrapper.find('[data-test="previousItem"]').trigger("click");
        expect(updateSelectedItemIndex).toHaveBeenCalledWith(0);
      });
    });
  });

  it("clicking on question type dropdown toggles the dropdown display", async () => {
    // dropdown is not shown
    // clicking on the button should show the dropdown
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="toggleButton"]')
      .trigger("click");
    expect(wrapper.vm.isQuestionDropdownShown).toBe(true);

    // dropdown is shown
    // clicking on the button should hide the dropdown
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="toggleButton"]')
      .trigger("click");
    expect(wrapper.vm.isQuestionDropdownShown).toBe(false);
  });

  it("changes question type from mcq to subjective", async () => {
    // open the dropdown
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="toggleButton"]')
      .trigger("click");

    // select mcq
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="option-1"]')
      .trigger("click");
    expect(wrapper.emitted()["question-type-changed"][0][0]).toBe("subjective");
  });

  it("changing question type to checkbox converts correct answer to array", async () => {
    await wrapper.setProps({
      questionTypeIndex: 0,
    });

    const oldCorrectAnswer = wrapper.vm.localItemDetailList[0].correct_answer;

    // open the dropdown
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="toggleButton"]')
      .trigger("click");

    // select mcq
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="option-2"]')
      .trigger("click");

    expect(wrapper.vm.localItemDetailList[0].correct_answer).toStrictEqual([
      oldCorrectAnswer,
    ]);
    expect(wrapper.emitted()["question-type-changed"][0][0]).toBe("checkbox");
  });

  it("updates question text", async () => {
    const testValue = "test2";
    await wrapper
      .find('[data-test="questionText"]')
      .find('[data-test="input"]')
      .setValue(testValue);
    expect(
      wrapper.vm.localItemDetailList[wrapper.vm.selectedItemIndex].text
    ).toBe(testValue);
  });

  it("image uploader shows up on clicking image button", async () => {
    await wrapper.find('[data-test="questionImage"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("show-image-uploader");
  });
});
