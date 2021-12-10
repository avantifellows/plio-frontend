import { mount } from "@vue/test-utils";
import SharePlioDialog from "@/components/App/SharePlioDialog";

// mock document.execCommand
document.execCommand = jest.fn(() => {
  return true;
});

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

  it("link formatted correctly", () => {
    const plioLink = "app.plio.in/play/ABC";
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: plioLink,
      },
    });
    expect(wrapper.vm.socialSharingFormattedLink).toBe("app.plio.in/play/ABC");
  });

  it("creates social sharing text correctly", () => {
    const plioLink = "app.plio.in/play/ABC";
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: plioLink,
      },
    });
    expect(wrapper.vm.socialSharingText).toBe(
      "Check out my new plio: app.plio.in/play/ABC"
    );
  });

  it("copies link correctly", () => {
    const plioLink = "app.plio.in/play/ABC";
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: plioLink,
      },
    });
    wrapper.find('[data-test="copy"]').trigger("click");
    expect(wrapper.vm.plioLinkCopied).toBe(true);
    expect(document.execCommand).toHaveBeenCalled();
  });

  it("copy button text changes if plio link copied", () => {
    const plioLink = "app.plio.in/play/ABC";
    const wrapper = mount(SharePlioDialog, {
      props: {
        plioLink: plioLink,
      },
      data() {
        return {
          plioLinkCopied: true,
        };
      },
    });
    expect(wrapper.vm.copyLinkTitleClass.value).toBe("Copied!");
  });
});
