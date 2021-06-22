import { mount } from "@vue/test-utils";
import Body from "@/components/Items/Question/Body";

describe("Body.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Body);
    expect(wrapper).toBeTruthy();
  });
});
