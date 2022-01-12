import { mount } from "@vue/test-utils";
import ListSingleSelector from "@/components/UI/Selectors/ListSingleSelector";

describe("ListSingleSelector.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ListSingleSelector, {
      props: {
        options: [],
      },
    });
  });
  it("should render with required values", () => {
    expect(wrapper).toBeTruthy();
  });

  it("clicking on close button emits close", async () => {
    await wrapper.find('[data-test="close"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("close");
  });

  describe("all props passed", () => {
    let title, info, options;
    beforeEach(async () => {
      title = "testTitle";
      info = "testInfo";
      options = [
        {
          value: "testValue1",
          label: "testLabel1",
        },
        {
          value: "testValue2",
          label: "testLabel2",
        },
      ];

      await wrapper.setProps({
        title: title,
        info: info,
        options: options,
      });
    });
    it("renders title, info and options", () => {
      expect(wrapper.find('[data-test="title"]').text()).toBe(title);
      expect(wrapper.find('[data-test="info"]').exists()).toBeTruthy();
      expect(wrapper.find('[data-test="infoText"]').text()).toBe(info);

      for (let [index, option] of options.entries()) {
        expect(
          wrapper
            .find(`[data-test="option-${index}"]`)
            .find('[data-test="label"]')
            .text()
        ).toBe(option.label);
      }
    });
    it("clicking on option emits that the options was clicked", async () => {
      const optionIndexClicked = 0;
      await wrapper
        .find(`[data-test="option-${optionIndexClicked}"]`)
        .trigger("click");
      expect(wrapper.emitted()).toHaveProperty("select");
      expect(wrapper.emitted()["select"]).toEqual([
        [options[optionIndexClicked].value],
      ]);
    });
  });
});
