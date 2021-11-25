import { mount } from "@vue/test-utils";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog";

describe("ImageUploaderDialog.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ImageUploaderDialog);
    expect(wrapper).toBeTruthy();
  });

  it("starts loading image when it is being loaded", () => {
    const startImageLoading = jest.spyOn(
      ImageUploaderDialog.methods,
      "startImageLoading"
    );
    const wrapper = mount(ImageUploaderDialog);

    // trigger emit from the VueImageUploader component
    wrapper.vm.$refs.imageUploader.$emit("uploading");

    expect(startImageLoading).toHaveBeenCalled();
  });

  it("stops loading image when it has been loaded", () => {
    const stopImageLoading = jest.spyOn(
      ImageUploaderDialog.methods,
      "stopImageLoading"
    );
    const wrapper = mount(ImageUploaderDialog);

    // trigger emit from the VueImageUploader component with mock values
    wrapper.vm.$refs.imageUploader.$emit("input", {
      dataUrl: "mock",
      file: {
        size: 0,
      },
    });

    expect(stopImageLoading).toHaveBeenCalled();
  });
});
