import { mount } from "@vue/test-utils";
import Textarea from "@/components/UI/Text/Textarea";

const InlineSvg = {
  template: "<img />",
};

describe("Textarea.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Textarea);
    expect(wrapper).toBeTruthy();
  });

  it("should render title correctly", () => {
    const title = "test title";
    const wrapper = mount(Textarea, {
      props: {
        title: title,
      },
    });
    expect(wrapper.find('[data-test="title"]').text()).toBe(title);
  });

  it("should render placeholder correctly", () => {
    const placeholder = "test placeholder";
    const wrapper = mount(Textarea, {
      props: {
        placeholder: placeholder,
      },
    });
    expect(wrapper.find('[data-test="input"]').attributes("placeholder")).toBe(
      placeholder
    );
  });

  it("input should get disabled", () => {
    const wrapper = mount(Textarea, {
      props: {
        isDisabled: true,
      },
    });
    expect(wrapper.find('[data-test="input"]').element.disabled).toBe(true);
  });

  it("renders value sent through prop", () => {
    const value = 10;
    const wrapper = mount(Textarea, {
      props: {
        value: value,
      },
    });

    expect(wrapper.find('[data-test="input"]').element.value).toBe(
      String(value)
    );
  });

  it("renders value set through input field", async () => {
    const value = 10;
    const wrapper = mount(Textarea);

    const input = wrapper.find('[data-test="input"]');
    await input.setValue(value);

    expect(input.element.value).toBe(String(value));
  });

  it("renders valid messages correctly", () => {
    const validation = {
      enabled: true,
      isValid: true,
      validMessage: "valid",
    };
    const wrapper = mount(Textarea, {
      props: {
        validation: validation,
      },
    });

    expect(wrapper.find('[data-test="validationMessage"]').text()).toBe(
      validation.validMessage
    );
  });

  it("renders invalid messages correctly", () => {
    const validation = {
      enabled: true,
      isValid: false,
      invalidMessage: "invalid",
    };
    const wrapper = mount(Textarea, {
      props: {
        validation: validation,
      },
    });

    expect(wrapper.find('[data-test="validationMessage"]').text()).toBe(
      validation.invalidMessage
    );
  });

  it("input keypress detected correctly", async () => {
    const wrapper = mount(Textarea);

    await wrapper.find('[data-test="input"]').trigger("keypress", {
      key: "a",
    });

    expect(wrapper.emitted()).toHaveProperty("keypress");
  });

  it("renders start icon correctly", () => {
    const startIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
    };
    const wrapper = mount(Textarea, {
      props: {
        startIcon: startIcon,
      },
      global: {
        stubs: {
          InlineSvg: InlineSvg,
        },
      },
    });

    expect(wrapper.get('[data-test="startIcon"]').html()).toContain("img");
    expect(wrapper.get('[data-test="startIcon"]').classes()).toEqual(
      expect.arrayContaining(startIcon.class.split(" "))
    );
    expect(wrapper.vm.startIconName).toBe(startIcon.name);
  });

  it("start icon click works correctly", () => {
    const startIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
    };
    const wrapper = mount(Textarea, {
      props: {
        startIcon: startIcon,
      },
      global: {
        stubs: {
          InlineSvg: InlineSvg,
        },
      },
    });

    wrapper.get('[data-test="startIcon"]').trigger("click");

    expect(wrapper.emitted()).toHaveProperty("start-icon-selected");
  });

  it("renders start icon disabled correctly", () => {
    const startIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
      isDisabled: true,
    };
    const wrapper = mount(Textarea, {
      props: {
        startIcon: startIcon,
      },
      global: {
        stubs: {
          InlineSvg: InlineSvg,
        },
      },
    });

    expect(wrapper.get('[data-test="startIcon"]').classes()).toEqual(
      expect.arrayContaining([
        "cursor-not-allowed",
        "pointer-events-none",
        "opacity-50",
      ])
    );
  });
});
