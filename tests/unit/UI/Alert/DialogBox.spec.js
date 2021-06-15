import { mount } from "@vue/test-utils";
import DialogBox from "@/components/UI/Alert/DialogBox";

describe("DialogBox.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(DialogBox);
    expect(wrapper).toBeTruthy();
  });

  it("renders title correctly", () => {
    const title = "Dialog Title";
    const wrapper = mount(DialogBox, {
      props: {
        title,
      },
    });
    expect(wrapper.find("p").text()).toBe(title);
  });

  it("renders description correctly", () => {
    const description = "Dialog Title";
    const wrapper = mount(DialogBox, {
      props: {
        description,
      },
    });
    expect(wrapper.find("p").text()).toBe(description);
  });
});
