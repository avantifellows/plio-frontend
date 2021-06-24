import { mount } from "@vue/test-utils";
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
});
