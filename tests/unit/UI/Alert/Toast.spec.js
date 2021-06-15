import { mount } from "@vue/test-utils";
import Toast from "@/components/UI/Alert/Toast";
import { config } from "@vue/test-utils";
import InlineSvg from "vue-inline-svg";

config.global.components = {
  InlineSvg,
};

describe("Toast.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Toast);
    expect(wrapper).toBeTruthy();
  });
});
