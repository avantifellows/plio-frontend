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
});
