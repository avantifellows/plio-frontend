import { mount } from "@vue/test-utils";
import ItemEditor from "@/components/Editor/ItemEditor";
import Tooltip from "primevue/tooltip";
import VueClickAway from "vue3-click-away";

describe("ItemEditor.vue", () => {
  it("should render with required values", () => {
    const wrapper = mount(ItemEditor, {
      global: {
        directives: {
          tooltip: Tooltip,
          clickAway: VueClickAway,
        },
      },
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
