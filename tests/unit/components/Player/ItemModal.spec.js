import { mount } from "@vue/test-utils";
import ItemModal from "@/components/Player/ItemModal";

const itemList = [
  {
    type: "question",
    details: {
      text: "test",
      type: "subjective",
      has_char_limit: true,
      max_char_limit: 50,
      image: null,
      options: null,
      correct_answer: null,
    },
    time: 13,
  },
  {
    type: "question",
    details: {
      text: "test2",
      type: "mcq",
      image: null,
      max_char_limit: null,
      has_char_limit: false,
      options: ["o1", "o2"],
      correct_answer: "0",
    },
    time: 50,
  },
];

describe("ItemModal.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ItemModal);
    expect(wrapper).toBeTruthy();
  });

  it("should prepare draft responses for each item", () => {
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
      },
    });
    expect(wrapper.vm.draftResponses.length).toBe(2);
  });

  it("extract current item details correctly", async () => {
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
      },
    });
    // test subjective
    expect(wrapper.vm.currentItem).toEqual(itemList[0]);
    expect(wrapper.vm.currentItemDetails).toEqual(itemList[0].details);
    expect(wrapper.vm.currentItemImage).toBe(itemList[0].details.image);
    expect(wrapper.vm.hasCharLimit).toBe(itemList[0].details.has_char_limit);
    expect(wrapper.vm.maxCharLimit).toBe(itemList[0].details.max_char_limit);
    expect(wrapper.vm.itemType).toBe(itemList[0].type);
    expect(wrapper.vm.questionOptions).toBe(itemList[0].details.options);
    expect(wrapper.vm.questionCorrectAnswer).toBe(NaN);
    expect(wrapper.vm.questionText).toBe(itemList[0].details.text);
    expect(wrapper.vm.questionType).toBe(itemList[0].details.type);
    expect(wrapper.vm.isQuestionTypeMCQ).toBe(false);
    expect(wrapper.vm.isQuestionTypeSubjective).toBe(true);

    // test mcq
    await wrapper.setProps({
      selectedItemIndex: 1,
    });

    expect(wrapper.vm.currentItem).toEqual(itemList[1]);
    expect(wrapper.vm.currentItemDetails).toEqual(itemList[1].details);
    expect(wrapper.vm.currentItemImage).toBe(itemList[1].details.image);
    expect(wrapper.vm.hasCharLimit).toBe(itemList[1].details.has_char_limit);
    expect(wrapper.vm.maxCharLimit).toBe(itemList[1].details.max_char_limit);
    expect(wrapper.vm.itemType).toBe(itemList[1].type);
    expect(wrapper.vm.questionOptions).toEqual(itemList[1].details.options);
    expect(wrapper.vm.questionCorrectAnswer).toBe(
      parseInt(itemList[1].details.correct_answer)
    );
    expect(wrapper.vm.questionText).toBe(itemList[1].details.text);
    expect(wrapper.vm.questionType).toBe(itemList[1].details.type);
    expect(wrapper.vm.isQuestionTypeMCQ).toBe(true);
    expect(wrapper.vm.isQuestionTypeSubjective).toBe(false);
  });

  it("toggles minimize button", () => {
    const toggleMinimizeMock = jest.spyOn(ItemModal.methods, "toggleMinimize");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
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
        itemList: itemList,
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
        itemList: itemList,
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
    itemList.forEach(() => {
      responseList.push({
        answer: null,
      });
    });
    var draftResponses = ["a", null];
    const submitQuestionMock = jest.spyOn(ItemModal.methods, "submitQuestion");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
        responseList: responseList,
      },
    });
    // enter some value in the input field
    const body = wrapper.find('[data-test="body"]');
    await body
      .find('[data-test="subjectiveAnswer"]')
      .find('[data-test="input"]')
      .setValue(draftResponses[0]);

    // submit the answer
    wrapper
      .find('[data-test="footer"]')
      .find('[data-test="submitButton"]')
      .trigger("click");

    expect(wrapper.vm.localResponseList[0]).toEqual({
      answer: draftResponses[0],
    });
    expect(submitQuestionMock).toHaveBeenCalled();
    expect(wrapper.emitted()).toHaveProperty("submit-question");
  });

  it("submits mcq question", async () => {
    var responseList = [];
    itemList.forEach(() => {
      responseList.push({
        answer: null,
      });
    });
    const submitQuestionMock = jest.spyOn(ItemModal.methods, "submitQuestion");
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
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
    const responseList = [{ answer: "a" }, { answer: null }];
    const proceedQuestionMock = jest.spyOn(
      ItemModal.methods,
      "proceedQuestion"
    );
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
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
    const responseList = [{ answer: null }, { answer: 0 }];
    const proceedQuestionMock = jest.spyOn(
      ItemModal.methods,
      "proceedQuestion"
    );
    const wrapper = mount(ItemModal, {
      props: {
        itemList: itemList,
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
