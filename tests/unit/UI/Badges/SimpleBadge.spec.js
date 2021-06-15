import { mount } from "@vue/test-utils";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge";

describe("SimpleBadge.vue", () => {
  it("renders title correctly", () => {
    const badgeText = "Test Badge";
    const wrapper = mount(SimpleBadge, {
      props: {
        text: badgeText,
      },
    });
    expect(wrapper.text()).toMatch(badgeText);
  });

  it("renders css class correctly", () => {
    const badgeText = "Test Badge";
    const badgeClass = "text-white";
    const wrapper = mount(SimpleBadge, {
      props: {
        text: badgeText,
        badgeClass: badgeClass,
      },
    });
    expect(wrapper.find("span").classes()).toContain(badgeClass);
  });
});
