import { render } from "@testing-library/vue";
import IconButton from "@/components/UI/Buttons/IconButton";

describe("IconButton.vue", () => {
  it("renders title config correctly", () => {
    const { getByText } = render(IconButton, {
      props: {
        titleConfig: {
          value: "Button for testing",
        },
      },
    });
    expect(getByText("Button for testing")).toBeTruthy();
  });
});
