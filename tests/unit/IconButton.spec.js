import { shallowMount } from "@vue/test-utils";
import IconButton from "@/components/UI/Buttons/IconButton";

describe("IconButton.vue", () => {
  it("renders title config correctly", () => {
    const buttonText = "Test Button";
    const wrapper = shallowMount(IconButton, {
      props: {
        titleConfig: {
          value: buttonText,
        },
      },
    });
    expect(wrapper.text()).toMatch(buttonText);
  });
});
