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
    let heading, info, options;
    beforeEach(async () => {
      heading = "testHeading";
      info = "testInfo";
      options = [
        {
          value: "testValue1",
          title: "testLabel1",
        },
        {
          value: "testValue2",
          title: "testLabel2",
        },
      ];

      await wrapper.setProps({
        heading: heading,
        info: info,
        options: options,
      });
    });
    it("renders heading, info and options", () => {
      expect(wrapper.find('[data-test="heading"]').text()).toBe(heading);
      expect(wrapper.find('[data-test="info"]').exists()).toBeTruthy();
      expect(wrapper.find('[data-test="infoText"]').text()).toBe(info);

      for (let [index, option] of options.entries()) {
        expect(
          wrapper
            .find(`[data-test="option-${index}"]`)
            .find('[data-test="title"]')
            .text()
        ).toBe(option.title);
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
