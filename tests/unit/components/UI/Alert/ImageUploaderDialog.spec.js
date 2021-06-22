import { mount } from "@vue/test-utils";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog";

describe("ImageUploaderDialog.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ImageUploaderDialog);
    expect(wrapper).toBeTruthy();
  });
});
