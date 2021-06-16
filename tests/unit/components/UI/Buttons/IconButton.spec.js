import { mount } from "@vue/test-utils";
import IconButton from "@/components/UI/Buttons/IconButton";

describe("IconButton.vue", () => {
  it("renders title correctly", () => {
    const buttonText = "Test Button";
    const wrapper = mount(IconButton, {
      props: {
        titleConfig: {
          value: buttonText,
        },
      },
    });
    expect(wrapper.text()).toMatch(buttonText);
  });
});
