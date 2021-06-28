import { mount } from "@vue/test-utils";
import InputNumber from "@/components/UI/Text/InputNumber";

const InlineSvg = {
  template: "<img />",
};

describe("InputNumber.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(InputNumber);
    expect(wrapper).toBeTruthy();
  });

  it("should render title correctly", () => {
    const title = "test title";
    const wrapper = mount(InputNumber, {
      props: {
        title: title,
      },
    });
    expect(wrapper.find('[data-test="title"]').text()).toBe(title);
  });

  it("should render placeholder correctly", () => {
    const placeholder = "test placeholder";
    const wrapper = mount(InputNumber, {
      props: {
        placeholder: placeholder,
      },
    });
    expect(wrapper.find('[data-test="input"]').attributes("placeholder")).toBe(
      placeholder
    );
  });

  it("input should get disabled", () => {
    const wrapper = mount(InputNumber, {
      props: {
        isDisabled: true,
      },
    });
    expect(wrapper.find('[data-test="input"]').element.disabled).toBe(true);
  });

  it("renders value sent through prop", () => {
    const value = 10;
    const wrapper = mount(InputNumber, {
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
    const wrapper = mount(InputNumber);

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
    const wrapper = mount(InputNumber, {
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
    const wrapper = mount(InputNumber, {
      props: {
        validation: validation,
      },
    });

    expect(wrapper.find('[data-test="validationMessage"]').text()).toBe(
      validation.invalidMessage
    );
  });

  it("input keypress detected correctly", async () => {
    const wrapper = mount(InputNumber);

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
    const wrapper = mount(InputNumber, {
      props: {
        startIcon: startIcon,
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
    const wrapper = mount(InputNumber, {
      props: {
        startIcon: startIcon,
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
    const wrapper = mount(InputNumber, {
      props: {
        startIcon: startIcon,
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
