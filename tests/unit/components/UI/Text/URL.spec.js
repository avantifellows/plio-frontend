import { mount } from "@vue/test-utils";
import URL from "@/components/UI/Text/URL";
import Tooltip from "primevue/tooltip";

describe("URL.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
