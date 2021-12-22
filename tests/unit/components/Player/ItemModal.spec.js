import { mount } from "@vue/test-utils";
import ItemModal from "@/components/Player/ItemModal";

let clonedeep = require("lodash.clonedeep");

describe("ItemModal.vue", () => {
  let wrapper;

  it("should render with default values", () => {
    wrapper = mount(ItemModal);
    expect(wrapper).toBeTruthy();
  });

  describe("basic checks", () => {
    const mountWrapper = () => {
      wrapper = mount(ItemModal, {
        props: {
          itemList: clonedeep(global.dummyItems),
          itemDetailList: clonedeep(global.dummyItemDetails),
        },
      });
    };

    beforeEach(() => mountWrapper());

    it("should prepare draft responses for each item", () => {
      expect(wrapper.vm.draftResponses.length).toBe(global.dummyItems.length);
    });

    it("toggles minimize button", async () => {
      const toggleMinimizeMock = jest.spyOn(
        ItemModal.methods,
        "toggleMinimize"
      );
      mountWrapper();
      await wrapper.setProps({
        videoPlayerElementId: "videoPlayer",
      });
      wrapper
        .find('[data-test="header"]')
        .find('[data-test="minimize"]')
        .trigger("click");

      expect(toggleMinimizeMock).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("toggle-minimize");
    });

    it("skips question", () => {
      const skipQuestionMock = jest.spyOn(ItemModal.methods, "skipQuestion");
      mountWrapper();
      wrapper
        .find('[data-test="header"]')
        .find('[data-test="skip"]')
        .trigger("click");

      expect(skipQuestionMock).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("skip-question");
    });

    it("revises question", () => {
      const reviseQuestionMock = jest.spyOn(ItemModal.methods, "emitRevise");
      mountWrapper();
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="reviseButton"]')
        .trigger("click");

      expect(reviseQuestionMock).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("revise-question");
    });
  });

  describe("subjective questions", () => {
    const itemIndex = 2;
    const mountWrapper = (responseList = null) => {
      if (responseList == null) {
        responseList = [];
        global.dummyItems.forEach(() => {
          responseList.push({
            answer: null,
          });
        });
      }

      wrapper = mount(ItemModal, {
        props: {
          itemList: clonedeep(global.dummyItems),
          itemDetailList: clonedeep(global.dummyItemDetails),
          responseList: responseList,
          selectedItemIndex: itemIndex,
        },
      });
    };

    it("submits question", async () => {
      let draftResponses = clonedeep(global.dummyItemResponses);
      const submitQuestion = jest.spyOn(ItemModal.methods, "submitQuestion");

      mountWrapper();
      // enter some value in the input field
      const body = wrapper.find('[data-test="body"]');
      await body
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue(draftResponses[2].answer);

      // submit the answer
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="submitButton"]')
        .trigger("click");

      expect(wrapper.vm.localResponseList[itemIndex].answer).toEqual(
        draftResponses[itemIndex].answer
      );
      expect(submitQuestion).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("submit-question");
    });

    it("proceeds with question on answering", () => {
      const responseList = [
        { answer: 0 },
        { answer: 1 },
        { answer: "xyz" },
        { answer: "abc" },
      ];
      const proceedQuestionMock = jest.spyOn(
        ItemModal.methods,
        "proceedQuestion"
      );
      mountWrapper(responseList);
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="proceedButton"]')
        .trigger("click");

      expect(proceedQuestionMock).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("proceed-question");
    });

    it("extracts item details correctly", async () => {
      mountWrapper();

      expect(wrapper.vm.currentItem).toEqual(global.dummyItems[itemIndex]);
      expect(wrapper.vm.currentItemDetails).toEqual(
        global.dummyItemDetails[itemIndex]
      );
      expect(wrapper.vm.currentItemImage).toBe(
        global.dummyItemDetails[itemIndex].image
      );
      expect(wrapper.vm.hasCharLimit).toBe(
        global.dummyItemDetails[itemIndex].has_char_limit
      );
      expect(wrapper.vm.maxCharLimit).toBe(
        global.dummyItemDetails[itemIndex].max_char_limit
      );
      expect(wrapper.vm.itemType).toBe(global.dummyItems[itemIndex].type);
      expect(wrapper.vm.questionType).toBe(
        global.dummyItemDetails[itemIndex].type
      );
      expect(wrapper.vm.isQuestionTypeSubjective).toBe(true);
      expect(wrapper.vm.isQuestionTypeMCQ).toBe(false);
      expect(wrapper.vm.isQuestionTypeCheckbox).toBe(false);
    });
  });

  describe("mcq questions", () => {
    const itemIndex = 0;

    const mountWrapper = (responseList = null) => {
      if (responseList == null) {
        responseList = [];
        global.dummyItems.forEach(() => {
          responseList.push({
            answer: null,
          });
        });
      }

      wrapper = mount(ItemModal, {
        props: {
          itemList: clonedeep(global.dummyItems),
          itemDetailList: clonedeep(global.dummyItemDetails),
          responseList: responseList,
          selectedItemIndex: itemIndex,
        },
      });
    };

    it("selecting option makes answer valid", async () => {
      mountWrapper();
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="option-0"]').trigger("click");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    it("submits question", async () => {
      const submitQuestion = jest.spyOn(ItemModal.methods, "submitQuestion");
      mountWrapper();
      // select an option
      const body = wrapper.find('[data-test="body"]');
      await body.find('[data-test="optionSelector-0"]').trigger("click");

      // submit the answer
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="submitButton"]')
        .trigger("click");

      expect(wrapper.vm.localResponseList[itemIndex]).toEqual({
        answer: 0,
      });
      expect(submitQuestion).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("submit-question");
    });

    it("proceeds with question on answering", () => {
      const responseList = [
        { answer: 0 },
        { answer: 1 },
        { answer: "xyz" },
        { answer: "abc" },
      ];
      const proceedQuestionMock = jest.spyOn(
        ItemModal.methods,
        "proceedQuestion"
      );
      mountWrapper(responseList);
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="proceedButton"]')
        .trigger("click");

      expect(proceedQuestionMock).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("proceed-question");
    });

    it("extracts item details correctly", async () => {
      mountWrapper();

      expect(wrapper.vm.currentItem).toEqual(global.dummyItems[itemIndex]);
      expect(wrapper.vm.currentItemDetails).toEqual(
        global.dummyItemDetails[itemIndex]
      );
      expect(wrapper.vm.currentItemImage).toBe(
        global.dummyItemDetails[itemIndex].image
      );
      expect(wrapper.vm.itemType).toBe(global.dummyItems[itemIndex].type);
      expect(wrapper.vm.questionOptions).toEqual(
        global.dummyItemDetails[itemIndex].options
      );
      expect(wrapper.vm.questionCorrectAnswer).toBe(
        parseInt(global.dummyItemDetails[itemIndex].correct_answer)
      );
      expect(wrapper.vm.questionText).toBe(
        global.dummyItemDetails[itemIndex].text
      );
      expect(wrapper.vm.questionType).toBe(
        global.dummyItemDetails[itemIndex].type
      );
      expect(wrapper.vm.isQuestionTypeMCQ).toBe(true);
      expect(wrapper.vm.isQuestionTypeSubjective).toBe(false);
      expect(wrapper.vm.isQuestionTypeCheckbox).toBe(false);
    });
  });

  describe("checkbox questions", () => {
    const itemIndex = 1;

    let checkboxItemDetails = clonedeep(global.dummyItemDetails);
    checkboxItemDetails[itemIndex]["type"] = "checkbox";
    checkboxItemDetails[itemIndex]["correct_answer"] = [1];

    const mountWrapper = (responseList = null) => {
      if (responseList == null) {
        responseList = [];
        global.dummyItems.forEach(() => {
          responseList.push({
            answer: null,
          });
        });
      }

      wrapper = mount(ItemModal, {
        props: {
          itemList: clonedeep(global.dummyItems),
          itemDetailList: checkboxItemDetails,
          responseList: responseList,
          selectedItemIndex: itemIndex,
        },
      });
    };

    beforeEach(() => {
      mountWrapper();
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it("extracts item details correctly", async () => {
      expect(wrapper.vm.isQuestionTypeSubjective).toBe(false);
      expect(wrapper.vm.isQuestionTypeMCQ).toBe(false);
      expect(wrapper.vm.isQuestionTypeCheckbox).toBe(true);
    });

    it("selecting option makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="option-0"]').trigger("click");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    it("unselecting all options makes the answer invalid", async () => {
      // select an option
      await wrapper.find('[data-test="option-0"]').trigger("click");
      // select another option
      await wrapper.find('[data-test="option-1"]').trigger("click");

      // unselect an option
      await wrapper.find('[data-test="option-0"]').trigger("click");
      // the answer should still be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();

      // unselect the other option
      await wrapper.find('[data-test="option-1"]').trigger("click");
      // the answer should now be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();
    });

    it("submits question", async () => {
      const submitQuestion = jest.spyOn(ItemModal.methods, "submitQuestion");
      mountWrapper();

      const body = wrapper.find('[data-test="body"]');
      // select an option
      await body.find('[data-test="optionSelector-0"]').trigger("click");
      // select another option
      await body.find('[data-test="optionSelector-1"]').trigger("click");

      // submit the answer
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="submitButton"]')
        .trigger("click");

      expect(wrapper.vm.localResponseList[itemIndex]).toEqual({
        answer: [0, 1],
      });
      expect(submitQuestion).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("submit-question");
    });

    it("proceeds with question on answering", () => {
      const responseList = [
        { answer: 0 },
        { answer: [0, 1] },
        { answer: "xyz" },
        { answer: "abc" },
      ];
      const proceedQuestionMock = jest.spyOn(
        ItemModal.methods,
        "proceedQuestion"
      );
      mountWrapper(responseList);
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="proceedButton"]')
        .trigger("click");

      expect(proceedQuestionMock).toHaveBeenCalled();
      expect(wrapper.emitted()).toHaveProperty("proceed-question");
    });
  });
});
