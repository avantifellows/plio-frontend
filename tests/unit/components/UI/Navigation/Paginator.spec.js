import { mount } from "@vue/test-utils";
import Paginator from "@/components/UI/Navigation/Paginator";

describe("Paginator.vue", () => {
  it("should render with required values only", () => {
    const wrapper = mount(Paginator, {
      props: {
        totalItems: 10,
      },
    });
    expect(wrapper.get('[data-test="totalItems"]').text()).toBe("10");
  });
});
