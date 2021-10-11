import { mount } from "@vue/test-utils";
import ItemModal from "@/components/Player/ItemModal";

import {
  dummyItems,
  dummyItemDetails,
  dummyItemResponses,
} from "@/services/Testing/DummyData.js";

var cloneDeep = require("lodash.clonedeep");

describe("ItemModal.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ItemModal);
    expect(wrapper).toBeTruthy();
  });

  it("should prepare draft responses for each item", () => {
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
      },
    });
    expect(wrapper.vm.draftResponses.length).toBe(dummyItems.length);
  });

  it("extract current item details correctly", async () => {
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
      },
    });
    // test subjective
    expect(wrapper.vm.currentItem).toEqual(dummyItems[0]);
    expect(wrapper.vm.currentItemDetails).toEqual(dummyItemDetails[0]);
    expect(wrapper.vm.currentItemImage).toBe(dummyItemDetails[0].image);
    expect(wrapper.vm.hasCharLimit).toBe(dummyItemDetails[0].has_char_limit);
    expect(wrapper.vm.maxCharLimit).toBe(dummyItemDetails[0].max_char_limit);
    expect(wrapper.vm.itemType).toBe(dummyItems[0].type);
    expect(wrapper.vm.questionOptions).toStrictEqual(
      dummyItemDetails[0].options
    );
    expect(wrapper.vm.questionCorrectAnswer).toBe(0);
    expect(wrapper.vm.questionText).toBe(dummyItemDetails[0].text);
    expect(wrapper.vm.questionType).toBe(dummyItemDetails[0].type);
    expect(wrapper.vm.isQuestionTypeMCQ).toBe(true);
    expect(wrapper.vm.isQuestionTypeSubjective).toBe(false);

    // test mcq
    await wrapper.setProps({
      selectedItemIndex: 1,
    });

    expect(wrapper.vm.currentItem).toEqual(dummyItems[1]);
    expect(wrapper.vm.currentItemDetails).toEqual(dummyItemDetails[1]);
    expect(wrapper.vm.currentItemImage).toBe(dummyItemDetails[1].image);
    expect(wrapper.vm.hasCharLimit).toBe(dummyItemDetails[1].has_char_limit);
    expect(wrapper.vm.maxCharLimit).toBe(dummyItemDetails[1].max_char_limit);
    expect(wrapper.vm.itemType).toBe(dummyItems[1].type);
    expect(wrapper.vm.questionOptions).toEqual(dummyItemDetails[1].options);
    expect(wrapper.vm.questionCorrectAnswer).toBe(
      parseInt(dummyItemDetails[1].correct_answer)
    );
    expect(wrapper.vm.questionText).toBe(dummyItemDetails[1].text);
    expect(wrapper.vm.questionType).toBe(dummyItemDetails[1].type);
    expect(wrapper.vm.isQuestionTypeMCQ).toBe(true);
    expect(wrapper.vm.isQuestionTypeSubjective).toBe(false);
  });

  it("toggles minimize button", () => {
    const toggleMinimizeMock = jest.spyOn(ItemModal.methods, "toggleMinimize");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
        videoPlayerElementId: "videoPlayer",
      },
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
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
      },
    });
    wrapper
      .find('[data-test="header"]')
      .find('[data-test="skip"]')
      .trigger("click");

    expect(skipQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("skip-question");
  });

  it("revises question", () => {
    const reviseQuestionMock = jest.spyOn(ItemModal.methods, "emitRevise");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
      },
    });
    wrapper
      .find('[data-test="footer"]')
      .find('[data-test="reviseButton"]')
      .trigger("click");

    expect(reviseQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("revise-question");
  });

  it("submits subjective question", async () => {
    var responseList = [];
    dummyItems.forEach(() => {
      responseList.push({
        answer: null,
      });
    });
    var draftResponses = cloneDeep(dummyItemResponses);
    const submitQuestionMock = jest.spyOn(ItemModal.methods, "submitQuestion");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
        responseList: responseList,
        selectedItemIndex: 2,
      },
    });
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

    expect(wrapper.vm.localResponseList[2].answer).toEqual(
      draftResponses[2].answer
    );
    expect(submitQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("submit-question");
  });

  it("submits mcq question", async () => {
    var responseList = [];
    dummyItems.forEach(() => {
      responseList.push({
        answer: null,
      });
    });
    const submitQuestionMock = jest.spyOn(ItemModal.methods, "submitQuestion");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
        responseList: responseList,
        selectedItemIndex: 1,
      },
    });
    // enter some value in the input field
    const body = wrapper.find('[data-test="body"]');
    await body.find('[data-test="radio-0"]').trigger("click");

    // submit the answer
    wrapper
      .find('[data-test="footer"]')
      .find('[data-test="submitButton"]')
      .trigger("click");

    expect(wrapper.vm.localResponseList[1]).toEqual({
      answer: 0,
    });
    expect(submitQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("submit-question");
  });

  it("proceeds with subjective question on answering", () => {
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
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
        responseList: responseList,
      },
    });
    wrapper
      .find('[data-test="footer"]')
      .find('[data-test="proceedButton"]')
      .trigger("click");

    expect(proceedQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("proceed-question");
  });

  it("proceeds with mcq question on answering", () => {
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
    const wrapper = mount(ItemModal, {
      props: {
        itemList: cloneDeep(dummyItems),
        itemDetailList: cloneDeep(dummyItemDetails),
        responseList: responseList,
        selectedItemIndex: 1,
      },
    });
    wrapper
      .find('[data-test="footer"]')
      .find('[data-test="proceedButton"]')
      .trigger("click");

    expect(proceedQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("proceed-question");
  });
});
