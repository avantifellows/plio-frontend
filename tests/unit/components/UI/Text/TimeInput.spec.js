import { mount } from "@vue/test-utils";
import TimeInput from "@/components/UI/Text/TimeInput";

describe("TimeInput.vue", () => {
  let wrapper = mount(TimeInput);
  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('[data-test="hour"]').exists()).toBe(
      wrapper.vm.localConfig.showHour
    );
    expect(
      wrapper.find('[data-test="minute"]').find('[data-test="input"]').element
        .value
    ).toBe("0");
    expect(
      wrapper.find('[data-test="second"]').find('[data-test="input"]').element
        .value
    ).toBe("0");
    expect(
      wrapper.find('[data-test="millisecond"]').find('[data-test="input"]')
        .element.value
    ).toBe("0");
  });

  it("test setting input values through props correctly", async () => {
    const timeObjectValue = {
      hour: 12,
      minute: 32,
      second: 14,
      millisecond: 131,
    };
    await wrapper.setProps({
      timeObject: timeObjectValue,
    });
    expect(
      wrapper.find('[data-test="hour"]').find('[data-test="input"]').element
        .value
    ).toBe(String(timeObjectValue.hour));
    expect(
      wrapper.find('[data-test="minute"]').find('[data-test="input"]').element
        .value
    ).toBe(String(timeObjectValue.minute));
    expect(
      wrapper.find('[data-test="second"]').find('[data-test="input"]').element
        .value
    ).toBe(String(timeObjectValue.second));
    expect(
      wrapper.find('[data-test="millisecond"]').find('[data-test="input"]')
        .element.value
    ).toBe(String(timeObjectValue.millisecond));
  });

  it("test setting input values through input fields", async () => {
    const timeObjectValue = {
      hour: 12,
      minute: 32,
      second: 14,
      millisecond: 131,
    };
    const hourInput = wrapper
      .find('[data-test="hour"]')
      .find('[data-test="input"]');
    await hourInput.setValue(timeObjectValue.hour);

    const minuteInput = wrapper
      .find('[data-test="minute"]')
      .find('[data-test="input"]');
    await minuteInput.setValue(timeObjectValue.minute);

    const secondInput = wrapper
      .find('[data-test="second"]')
      .find('[data-test="input"]');
    await secondInput.setValue(timeObjectValue.second);

    const millisecondInput = wrapper
      .find('[data-test="millisecond"]')
      .find('[data-test="input"]');
    await millisecondInput.setValue(timeObjectValue.millisecond);

    expect(hourInput.element.value).toBe(String(timeObjectValue.hour));
    expect(minuteInput.element.value).toBe(String(timeObjectValue.minute));
    expect(secondInput.element.value).toBe(String(timeObjectValue.second));
    expect(millisecondInput.element.value).toBe(
      String(timeObjectValue.millisecond)
    );
  });

  it("test error handling", async () => {
    const hourInput = wrapper
      .find('[data-test="hour"]')
      .find('[data-test="input"]');
    const minuteInput = wrapper
      .find('[data-test="minute"]')
      .find('[data-test="input"]');
    const secondInput = wrapper
      .find('[data-test="second"]')
      .find('[data-test="input"]');
    const millisecondInput = wrapper
      .find('[data-test="millisecond"]')
      .find('[data-test="input"]');

    // set wrong hour input
    await hourInput.setValue("a");

    expect(wrapper.emitted()).toHaveProperty("error-occurred");

    // set valid hour input
    await hourInput.setValue(12);

    expect(wrapper.emitted()).toHaveProperty("error-resolved");

    // set wrong minute input
    await minuteInput.setValue("a");

    expect(wrapper.emitted()).toHaveProperty("error-occurred");

    // set valid minute input
    await minuteInput.setValue(12);

    expect(wrapper.emitted()).toHaveProperty("error-resolved");

    // set wrong second input
    await secondInput.setValue("a");

    expect(wrapper.emitted()).toHaveProperty("error-occurred");

    // set valid second input
    await secondInput.setValue(12);

    expect(wrapper.emitted()).toHaveProperty("error-resolved");

    // set wrong millisecond input
    await millisecondInput.setValue("a");

    expect(wrapper.emitted()).toHaveProperty("error-occurred");

    // set valid millisecond input
    await millisecondInput.setValue(12);

    expect(wrapper.emitted()).toHaveProperty("error-resolved");
  });
});
