import { mount } from "@vue/test-utils";
import store from "@/store";
import Settings from "@/components/App/Settings.vue";

let clonedeep = require("lodash.clonedeep");

describe("Settings.vue", () => {
  let wrapper;

  let mountWrapper = (settingsToRender = null) => {
    wrapper = mount(Settings, {
      props: {
        settings: (settingsToRender == null) ? null : clonedeep(settingsToRender),
      },
    });
  }

  it("should render with default values", () => {
    // wrapper = mount(Settings);
    mountWrapper()
    expect(wrapper).toBeTruthy();
  });

  it("should render provided settings correctly", () => {
    store.dispatch("generic/setWindowInnerWidth", 1024);
    mountWrapper(global.dummySettingsToRender)
    expect(wrapper.vm.localSettings).toEqual(global.dummySettingsToRender);
    expect(wrapper.vm.hasUnsavedChanges).toBeFalsy();
    expect(wrapper.vm.currentSelectedTabName).toBe("configuration");
    expect(wrapper.vm.currentSelectedTabDetails).toStrictEqual(
      global.dummySettingsToRender.get("player").get("configuration")
    );
    expect(wrapper.find('[data-test="header-player"]').exists()).toBeTruthy();
    expect(
      wrapper.find('[data-test="tab-configuration"]').exists()
    ).toBeTruthy();
    expect(wrapper.find('[data-test="info-message"]').exists()).toBeFalsy();
  });

  it("sets the clicked tab as selected", async () => {
    const selectTab = jest.spyOn(Settings.methods, "selectTab");
    mountWrapper(global.dummySettingsToRender)
    await wrapper.get('[data-test="tab-appearance"]').trigger("click");
    expect(selectTab).toHaveBeenCalledWith(
      "appearance",
      wrapper.vm.settings.get("app").get("appearance"),
      "app"
    );
    expect(wrapper.vm.currentSelectedTabDetails).toStrictEqual(
      wrapper.vm.settings.get("app").get("appearance")
    );
  });

  it("emits any changes made when save is clicked", async () => {
    mountWrapper(global.dummySettingsToRender)
    await wrapper.get('[data-test="input"]').trigger("click");
    await wrapper.get('[data-test="saveButton"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("update:settings");
    expect(wrapper.emitted()).toHaveProperty("window-closed");
  });

  it("emits close signal when cancel button is clicked", async () => {
    mountWrapper(global.dummySettingsToRender)
    await wrapper.get('[data-test="cancelButton"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("window-closed");
  });
});
