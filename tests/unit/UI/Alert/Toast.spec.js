import { mount } from "@vue/test-utils";
import Toast from "@/components/UI/Alert/Toast";

describe("Toast.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Toast);
    expect(wrapper).toBeTruthy();
  });
});
