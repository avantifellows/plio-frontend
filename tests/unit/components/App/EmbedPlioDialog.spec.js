import { mount } from "@vue/test-utils";
import EmbedPlioDialog from "@/components/App/EmbedPlioDialog";
import store from "@/store";

// mock document.execCommand
document.execCommand = jest.fn(() => {
  return true;
});

describe("EmbedPlioDialog.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(EmbedPlioDialog);
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('[data-test="title"]').text()).toBe("Embed this Plio");
  });

  it("clicking on close button closes the embed dialog", async () => {
    const plioId = "123";
    const closeDialog = jest.spyOn(EmbedPlioDialog.methods, "closeDialog");
    const wrapper = mount(EmbedPlioDialog, {
      props: {
        plioId: plioId,
      },
    });

    // click on the close button of the embed dialog
    await wrapper.find('[data-test="closeDialog"]').trigger("click");

    expect(closeDialog).toHaveBeenCalled();
    expect(store.state.generic.isEmbedPlioDialogShown).toBe(false);
    expect(wrapper.vm.isPlioEmbedCodeWithoutSSOCopied).toBe(false);
    expect(wrapper.vm.isPlioEmbedCodeWithSSOCopied).toBe(false);
  });

  it("clicking on the copy button in the embed dialog copies the embed code", async () => {
    const plioId = "123";
    const wrapper = mount(EmbedPlioDialog, {
      props: {
        plioId: plioId,
      },
    });
    // embed code should not have the copied status
    expect(wrapper.vm.isPlioEmbedCodeWithoutSSOCopied).toBeFalsy();

    // click the copy button
    await wrapper
      .find('[data-test="copyCodeWithoutSSOButton"]')
      .trigger("click");

    expect(wrapper.vm.isPlioEmbedCodeWithoutSSOCopied).toBeTruthy();
    expect(document.execCommand).toHaveBeenCalled();
  });

  it("shows appropriate view for personal vs org workspace", async () => {
    // set the list of organizations for the user
    const orgDetails = {
      shortcode: "testorg",
      api_key: "testkey",
    };
    await store.dispatch("auth/setUser", {
      organizations: [orgDetails],
    });

    const plioId = "123";
    const wrapper = mount(EmbedPlioDialog, {
      props: {
        plioId: plioId,
      },
    });

    // there should only be the embed code without SSO
    expect(wrapper.find("[data-test=codeWithSSO]").exists()).toBeFalsy();
    // the heading for the embed code should not be shown
    expect(
      wrapper
        .find("[data-test=codeWithoutSSO]")
        .find("[data-test=heading]")
        .exists()
    ).toBeFalsy();

    /**
     * change active workspace now
     */
    await store.dispatch("auth/setActiveWorkspace", orgDetails.shortcode);

    // active workspace api key should now be updated
    expect(store.getters["auth/activeWorkspaceApiKey"]).toBe(
      orgDetails.api_key
    );

    // both the embed codes with and without SSO should be visible
    expect(wrapper.find("[data-test=codeWithSSO]").exists()).toBeTruthy();
    expect(wrapper.find("[data-test=codeWithoutSSO]").exists()).toBeTruthy();
    // the heading for the embed code without SSO should now be shown
    expect(
      wrapper
        .find("[data-test=codeWithoutSSO]")
        .find("[data-test=heading]")
        .exists()
    ).toBeTruthy();
  });

  it("copying the with/without SSO code sets the copy statuses correctly", async () => {
    // set the list of organizations for the user
    const orgDetails = {
      shortcode: "testorg",
      api_key: "testkey",
    };
    await store.dispatch("auth/setUser", {
      organizations: [orgDetails],
    });

    const plioId = "123";

    // change active workspace and set org in the props
    await store.dispatch("auth/setActiveWorkspace", orgDetails.shortcode);

    const wrapper = mount(EmbedPlioDialog, {
      props: {
        plioId: plioId,
      },
    });

    // copy embed code without SSO
    await wrapper
      .find('[data-test="copyCodeWithoutSSOButton"]')
      .trigger("click");

    // embed code without sso should be marked as copied and embed code with
    // sso as not copied
    expect(wrapper.vm.isPlioEmbedCodeWithoutSSOCopied).toBe(true);
    expect(wrapper.vm.isPlioEmbedCodeWithSSOCopied).toBe(false);

    // copy embed code with SSO
    await wrapper.find('[data-test="copyCodeWithSSOButton"]').trigger("click");
    // embed code with sso should be marked as copied and embed code without
    // sso as not copied
    expect(wrapper.vm.isPlioEmbedCodeWithSSOCopied).toBe(true);
    expect(wrapper.vm.isPlioEmbedCodeWithoutSSOCopied).toBe(false);
  });
});
