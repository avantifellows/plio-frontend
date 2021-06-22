import { mount } from "@vue/test-utils";
import Table from "@/components/Collections/Table/Table";

describe("Table.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Table);
    expect(wrapper).toBeTruthy();
  });
});
