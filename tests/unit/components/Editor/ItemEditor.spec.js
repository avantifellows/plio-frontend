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
