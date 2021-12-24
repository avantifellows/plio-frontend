import { mount } from "@vue/test-utils";
import Settings from "@/components/Collections/Settings/Settings.vue";

let clonedeep = require('lodash.clonedeep')

describe("PlioListItem.vue", () => {
  let wrapper;
  
  it("should render with default values", () => {
    wrapper = mount(Settings);
    expect(wrapper).toBeTruthy();
  });

  it("should render provided settings correctly", () => {
    const setCurrentSelectedTab = jest.spyOn(Settings.methods, 'setCurrentSelectedTab')
    wrapper = mount(Settings, {
      props: {
        settings: clonedeep(global.dummySettingsToRender)
      }
    })
    expect(setCurrentSelectedTab).toHaveBeenCalled()
    expect(wrapper.vm.localSettings).toEqual(global.dummySettingsToRender)
    expect(wrapper.vm.currentSelectedTab).toEqual({
      configuration: global.dummySettingsToRender.player.configuration
    })
    expect(wrapper.vm.hasUnsavedChanges).toBeFalsy()
    expect(wrapper.vm.currentSelectedTabName).toBe('configuration')
    expect(wrapper.vm.currentSelectedTabDetails).toStrictEqual(global.dummySettingsToRender.player.configuration)
    expect(wrapper.find('[data-test="header-player"]').exists()).toBeTruthy()
    expect(wrapper.find('[data-test="tab-configuration"]').exists()).toBeTruthy()
    expect(wrapper.find('[data-test="info-message"]').exists()).toBeFalsy()
  })

  it("sets the clicked tab as selected", async () => {
    const selectTab = jest.spyOn(Settings.methods, 'selectTab')
    wrapper = mount(Settings, {
      props: {
        settings: {
          ...clonedeep(global.dummySettingsToRender),
          app: {
            appearance: {
              darkMode: {
                title: "",
                subTitle: null,
                type: "checkbox",
              }
            }
          }
        }
      }
    })

    await wrapper.get('[data-test="tab-appearance"]').trigger("click")
    expect(selectTab).toHaveBeenCalledWith("appearance", wrapper.vm.settings.app.appearance)
    expect(wrapper.vm.currentSelectedTab).toStrictEqual({
      appearance: wrapper.vm.settings.app.appearance
    })
  })

  it("emits any changes made when save is clicked", async () => {
    const saveChanges = jest.spyOn(Settings.methods, 'saveChanges')
    wrapper = mount(Settings, {
      props: {
        settings: clonedeep(global.dummySettingsToRender)
      }
    })

    await wrapper.get('[data-test="setting-input"]').trigger("click")
    await wrapper.get('[data-test="saveButton"]').trigger("click")
    expect(saveChanges).toHaveBeenCalled()
    expect(wrapper.emitted()).toHaveProperty("update:settings")
    expect(wrapper.emitted()).toHaveProperty("window-closed")
  })

  it("emits close signal when cancel button is clicked", async () => {
    const closeMenu = jest.spyOn(Settings.methods, 'closeMenu')
    wrapper = mount(Settings, {
      props: {
        settings: clonedeep(global.dummySettingsToRender)
      }
    })

    await wrapper.get('[data-test="cancelButton"]').trigger("click")
    expect(closeMenu).toHaveBeenCalled()
    expect(wrapper.emitted()).toHaveProperty("window-closed")
  })
})