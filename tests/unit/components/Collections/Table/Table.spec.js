import { mount } from "@vue/test-utils";
import Table from "@/components/Collections/Table/Table";
import Tooltip from "primevue/tooltip";

describe("Table.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Table, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
