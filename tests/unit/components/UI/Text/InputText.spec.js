import { mount } from "@vue/test-utils";
import InputText from "@/components/UI/Text/InputText";
import Tooltip from "primevue/tooltip";

describe("InputText.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(InputText, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
