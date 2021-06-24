import { mount } from "@vue/test-utils";
import TimeInput from "@/components/UI/Text/TimeInput";

describe("TimeInput.vue", () => {
  let wrapper = mount(TimeInput);
  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
  });

  // it("test setting input values through props correctly", async () => {
  //   const timeObjectValue = {
  //     hour: 12,
  //     minute: 32,
  //     second: 14,
  //     millisecond: 131
  //   }
  //   await wrapper.setProps({
  //     // timeObject: timeObjectValue
  //   });
  //   expect(wrapper.find('[data-test="hour"]').text()).toBe(0);
  // });
});
