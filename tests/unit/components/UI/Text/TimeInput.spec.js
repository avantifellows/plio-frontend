import { mount } from "@vue/test-utils";
import TimeInput from "@/components/UI/Text/TimeInput";
import Tooltip from "primevue/tooltip";

describe("TimeInput.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(TimeInput, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
