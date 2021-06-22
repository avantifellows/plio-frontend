import { mount } from "@vue/test-utils";
import VueImageUploader from "@/components/Vue2PortedPackages/VueImageUploader";

describe("VueImageUploader.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(VueImageUploader);
    expect(wrapper).toBeTruthy();
  });
});
