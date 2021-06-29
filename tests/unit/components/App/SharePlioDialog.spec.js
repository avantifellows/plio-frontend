import { mount } from "@vue/test-utils";
import SharePlioDialog from "@/components/App/SharePlioDialog";

describe("SharePlioDialog.vue", () => {
  it("should render with the required values", () => {
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: "testLink",
      },
    });
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('[data-test="title"]').text()).toBe("Share this Plio");
  });

  it("should close dialog on clicking close button", async () => {
    const plioLink = "testLink";
    const closeSharePlioDialog = jest.spyOn(
      SharePlioDialog.methods,
      "closeSharePlioDialog"
    );
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: plioLink,
      },
    });
    await wrapper.find('[data-test="close"]').trigger("click");
    expect(closeSharePlioDialog).toHaveBeenCalled();
  });

  it("should share on whatsapp on button click", async () => {
    const plioLink = "testLink";
    const shareOnWhatsApp = jest.spyOn(
      SharePlioDialog.methods,
      "shareOnWhatsApp"
    );
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: plioLink,
      },
    });
    expect(wrapper.find('[data-test="whatsapp"]').text()).toBe("");
    await wrapper.find('[data-test="close"]').trigger("click");
    expect(closeSharePlioDialog).toHaveBeenCalled();
  });
});
