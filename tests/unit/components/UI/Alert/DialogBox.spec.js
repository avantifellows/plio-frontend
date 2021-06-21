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
    const wrapper = mount(DialogBox, {
      props: {
        iconConfig: {
          enabled: true,
          name: "check",
          class: "w-12 h-12",
        },
      },
      global: {
        stubs: {
          InlineSvg: InlineSvg,
        },
      },
    });
    expect(wrapper.get('[data-test="icon"]').html()).toContain("img");
    expect(wrapper.get('[data-test="icon"]').classes()).toEqual(
      expect.arrayContaining(["w-12", "h-12"])
    );
  });
});
