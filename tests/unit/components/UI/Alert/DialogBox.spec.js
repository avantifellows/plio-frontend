import { mount } from "@vue/test-utils";
import DialogBox from "@/components/UI/Alert/DialogBox";

const InlineSvg = {
  template: "<img />",
};

describe("DialogBox.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(DialogBox);
    expect(wrapper).toBeTruthy();
  });

  it("renders title correctly", () => {
    const title = "Dialog Title";
    const wrapper = mount(DialogBox, {
      props: {
        title: title,
      },
    });

    expect(wrapper.get('[data-test="title"]').text()).toBe(title);
  });

  it("renders description correctly", () => {
    const description = "Dialog Title";
    const wrapper = mount(DialogBox, {
      props: {
        description: description,
      },
    });

    expect(wrapper.get('[data-test="description"]').text()).toBe(description);
  });

  it("renders image correctly", () => {
    const iconClass = "w-12 h-12";
    const wrapper = mount(DialogBox, {
      props: {
        iconConfig: {
          enabled: true,
          name: "check",
          class: iconClass,
        },
      },
    });
    expect(wrapper.get('[data-test="icon"]').html()).toContain("img");
    expect(wrapper.get('[data-test="icon"]').classes()).toEqual(
      expect.arrayContaining(iconClass.split(" "))
    );
  });

  it("confirm button present", () => {
    const wrapper = mount(DialogBox);
    expect(wrapper.get('[data-test="confirmButton"]')).toBeTruthy();
  });

  it("cancel button present", () => {
    const wrapper = mount(DialogBox);
    expect(wrapper.get('[data-test="cancelButton"]')).toBeTruthy();
  });

  it("confirm click works", () => {
    const wrapper = mount(DialogBox);
    wrapper.get('[data-test="confirmButton"]').trigger("click");

    expect(wrapper.emitted()).toHaveProperty("confirm");
  });

  it("cancel click works", () => {
    const wrapper = mount(DialogBox);
    wrapper.get('[data-test="cancelButton"]').trigger("click");

    expect(wrapper.emitted()).toHaveProperty("cancel");
  });
});
