import { flushPromises, mount } from "@vue/test-utils";
import InputText from "@/components/UI/Text/InputText";

describe("InputText.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(InputText);
    expect(wrapper).toBeTruthy();
  });

  it("should render title correctly", () => {
    const title = "test title";
    const wrapper = mount(InputText, {
      props: {
        title: title,
      },
    });
    expect(wrapper.find('[data-test="title"]').text()).toBe(title);
  });

  it("should render placeholder correctly", () => {
    const placeholder = "test placeholder";
    const wrapper = mount(InputText, {
      props: {
        placeholder: placeholder,
      },
    });
    expect(wrapper.find('[data-test="input"]').attributes("placeholder")).toBe(
      placeholder
    );
  });

  it("input should get disabled", () => {
    const wrapper = mount(InputText, {
      props: {
        isDisabled: true,
      },
    });
    expect(wrapper.find('[data-test="input"]').element.disabled).toBe(true);
  });

  it("renders value sent through prop", () => {
    const value = "test value";
    const wrapper = mount(InputText, {
      props: {
        value: value,
      },
    });

    expect(wrapper.find('[data-test="input"]').element.value).toBe(value);
  });

  it("renders value set through input field", async () => {
    const value = "test value";
    const wrapper = mount(InputText);

    const input = wrapper.find('[data-test="input"]');
    await input.setValue(value);

    expect(input.element.value).toBe(value);
  });

  it("renders valid messages correctly", () => {
    const validation = {
      enabled: true,
      isValid: true,
      validMessage: "valid",
    };
    const wrapper = mount(InputText, {
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
    const wrapper = mount(InputText, {
      props: {
        validation: validation,
      },
    });

    expect(wrapper.find('[data-test="validationMessage"]').text()).toBe(
      validation.invalidMessage
    );
  });

  it("input keypress detected correctly", async () => {
    const wrapper = mount(InputText);

    await wrapper.find('[data-test="input"]').trigger("keypress", {
      key: "a",
    });

    expect(wrapper.emitted()).toHaveProperty("keypress");
  });

  it("prevents non-number input for inputType = number", async () => {
    const wrapper = mount(InputText, {
      props: {
        inputType: "number",
      },
    });

    let inputElement = wrapper.find('[data-test="input"]');

    // trigger non-numeric input
    await inputElement.trigger("keypress", {
      key: "a",
      keyCode: 97,
    });
    await flushPromises();
    // the trigger should not be created
    expect(wrapper.emitted()).not.toHaveProperty("keypress");

    // trigger numeric input
    await inputElement.trigger("keypress", {
      key: "1",
      keyCode: 49,
    });
    await flushPromises();
    // the trigger should be created
    expect(wrapper.emitted()).toHaveProperty("keypress");
  });

  it("renders start icon correctly", () => {
    const startIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
    };
    const wrapper = mount(InputText, {
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
    const wrapper = mount(InputText, {
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
    const wrapper = mount(InputText, {
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

  it("renders end icon correctly", () => {
    const endIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
    };
    const wrapper = mount(InputText, {
      props: {
        endIcon: endIcon,
      },
    });

    expect(wrapper.get('[data-test="endIcon"]').html()).toContain("img");
    expect(wrapper.get('[data-test="endIcon"]').classes()).toEqual(
      expect.arrayContaining(endIcon.class.split(" "))
    );
    expect(wrapper.vm.endIconName).toBe(endIcon.name);
  });

  it("renders end icon disabled correctly", () => {
    const endIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
      isDisabled: true,
    };
    const wrapper = mount(InputText, {
      props: {
        endIcon: endIcon,
      },
    });

    expect(wrapper.get('[data-test="endIcon"]').classes()).toEqual(
      expect.arrayContaining([
        "cursor-not-allowed",
        "pointer-events-none",
        "opacity-50",
      ])
    );
  });

  it("end icon click works correctly", () => {
    const endIcon = {
      enabled: true,
      name: "check",
      class: "w-10 h-10",
      tooltip: "",
    };
    const wrapper = mount(InputText, {
      props: {
        endIcon: endIcon,
      },
    });

    wrapper.get('[data-test="endIcon"]').trigger("click");

    expect(wrapper.emitted()).toHaveProperty("end-icon-selected");
  });
});
