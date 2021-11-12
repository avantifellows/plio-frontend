import { mount } from "@vue/test-utils";
import ItemEditor from "@/components/Editor/ItemEditor";

describe("ItemEditor.vue", () => {
  it("should render with required values for mcq question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
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

  it("should render time with milliseconds", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13.3,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
      },
    });
    expect(
      wrapper
        .find('[data-test="time"]')
        .find('[data-test="millisecond"]')
        .find('[data-test="input"]').element.value
    ).toBe("300");
  });

  it("triggers keyup", async () => {
    const maxCharLimitInputKeypress = jest.spyOn(
      ItemEditor.methods,
      "maxCharLimitInputKeypress"
    );
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
            has_char_limit: true,
          },
        ],
        questionTypeIndex: 1,
      },
    });
    await wrapper
      .find('[data-test="maxCharLimit"]')
      .find('[data-test="input"]')
      .trigger("keypress", {
        key: 1,
      });
    expect(maxCharLimitInputKeypress).toHaveBeenCalled();
  });

  it("triggers keydown", () => {
    const maxCharLimitInputKeydown = jest.spyOn(
      ItemEditor.methods,
      "maxCharLimitInputKeydown"
    );
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
            has_char_limit: true,
          },
        ],
        questionTypeIndex: 1,
      },
    });
    wrapper
      .find('[data-test="maxCharLimit"]')
      .find('[data-test="input"]')
      .trigger("keydown", {
        key: 1,
      });
    expect(maxCharLimitInputKeydown).toHaveBeenCalled();
  });

  it("changes question type", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
            has_char_limit: true,
          },
        ],
        questionTypeIndex: 1,
      },
    });
    // open the dropdown
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="toggleButton"]')
      .trigger("click");

    // select mcq
    await wrapper
      .find('[data-test="questionTypeDropdown"]')
      .find('[data-test="option-0"]')
      .trigger("click");
    expect(wrapper.emitted()["question-type-changed"][0][0]).toBe("mcq");
  });

  it("updates question text", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
          },
        ],
      },
    });
    const testValue = "test2";
    await wrapper
      .find('[data-test="questionText"]')
      .find('[data-test="input"]')
      .setValue(testValue);
    expect(wrapper.vm.localItemDetailList[0].text).toBe(testValue);
  });

  it("enables/disables max char limit", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
            has_char_limit: true,
          },
        ],
        questionTypeIndex: 1,
      },
    });
    // checkbox should be checked by default
    expect(wrapper.vm.localItemDetailList[0].has_char_limit).toBe(true);

    // uncheck
    await wrapper.find('[data-test="maxCharLimitCheckbox"]').setChecked(false);
    expect(wrapper.vm.localItemDetailList[0].has_char_limit).toBe(false);
  });

  it("updates option value", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
      },
    });

    const testValue = "test";
    await wrapper
      .findAll('[data-test="option"]')[0]
      .find('[data-test="input"]')
      .setValue(testValue);
    expect(wrapper.vm.localItemDetailList[0].options[0]).toBe(testValue);
  });

  it("updates time value", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
          },
        ],
        videoDuration: 200,
      },
    });

    const secondValue = 20;
    await wrapper
      .findAll('[data-test="time"]')[0]
      .find('[data-test="second"]')
      .find('[data-test="input"]')
      .setValue(secondValue);
    expect(wrapper.vm.localItemList[0].time).toBe(secondValue);
  });

  it("set correct answer correctly for mcq question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
            correct_answer: 1,
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
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
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

  it("clicking on question type dropdown toggles the dropdown display", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
          },
        ],
        questionTypeIndex: 1,
      },
    });
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

  it("should disable appropriate fields for mcq question", () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
            correct_answer: 1,
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
    expect(wrapper.find('[data-test="deleteItem"]').element.disabled).toBe(
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

  it("updates correct answer on selecting option", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
      },
    });
    await wrapper
      .findAll('[data-test="option"]')[1]
      .find('[data-test="startIcon"]')
      .trigger("click");
    expect(wrapper.vm.localItemDetailList[0].correct_answer).toBe(1);
  });

  it("image uploader shows up on clicking image button", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
          },
        ],
      },
    });
    await wrapper.find('[data-test="questionImage"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("show-image-uploader");
  });

  it("clicking add item hides item editor", async () => {
    const removeSelectedItemIndex = jest.spyOn(
      ItemEditor.methods,
      "removeSelectedItemIndex"
    );
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
          },
        ],
      },
    });
    await wrapper.find('[data-test="addItem"]').trigger("click");
    expect(removeSelectedItemIndex).toHaveBeenCalled();
  });

  it("clicking add option adds a new option", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
      },
    });
    await wrapper.find('[data-test="addOption"]').trigger("click");
    expect(wrapper.vm.localItemDetailList[0].options.length).toBe(3);
  });

  it("emits on clicking delete item", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
      },
    });
    await wrapper.find('[data-test="deleteItem"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("delete-selected-item");
  });

  it("clicking next item navigates to next item", async () => {
    const updateSelectedItemIndex = jest.spyOn(
      ItemEditor.methods,
      "updateSelectedItemIndex"
    );
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
          {
            type: "question",
            time: 20,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
      },
    });
    await wrapper.find('[data-test="nextItem"]').trigger("click");
    expect(updateSelectedItemIndex).toHaveBeenCalledWith(1);
  });

  it("clicking previous item navigates to previous item", async () => {
    const updateSelectedItemIndex = jest.spyOn(
      ItemEditor.methods,
      "updateSelectedItemIndex"
    );
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
          {
            type: "question",
            time: 20,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
          {
            text: "test",
            type: "mcq",
            options: ["", ""],
          },
        ],
        selectedItemIndex: 1,
      },
    });
    await wrapper.find('[data-test="previousItem"]').trigger("click");
    expect(updateSelectedItemIndex).toHaveBeenCalledWith(0);
  });

  it("clicking on delete option deletes option", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "mcq",
            options: ["", "", ""],
          },
        ],
      },
    });
    await wrapper
      .findAll('[data-test="option"]')[0]
      .find('[data-test="endIcon"]')
      .trigger("click");
    expect(wrapper.emitted()).toHaveProperty("delete-option");
  });

  it("clearing max limit sets it to the minimum value", async () => {
    const wrapper = mount(ItemEditor, {
      props: {
        itemList: [
          {
            type: "question",
            time: 13,
          },
        ],
        itemDetailList: [
          {
            text: "test",
            type: "subjective",
            has_char_limit: true,
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
