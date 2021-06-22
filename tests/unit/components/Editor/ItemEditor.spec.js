import { mount } from "@vue/test-utils";
import ItemEditor from "@/components/Editor/ItemEditor";

describe("ItemEditor.vue", () => {
  it("should render with required values", () => {
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
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
