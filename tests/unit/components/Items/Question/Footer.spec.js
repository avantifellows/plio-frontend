import { mount } from "@vue/test-utils";
import Footer from "@/components/Items/Question/Footer";

describe("Footer.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Footer);
    expect(wrapper).toBeTruthy();
  });
});
