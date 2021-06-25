import { mount } from "@vue/test-utils";
import Paginator from "@/components/UI/Navigation/Paginator";

describe("Paginator.vue", () => {
  it("should render with required values only", () => {
    const wrapper = mount(Paginator, {
      props: {
        totalItems: 10,
      },
    });
    expect(wrapper.get('[data-test="totalItems"]').text()).toBe("10");
  });

  it("should trigger correctly on click", async () => {
    const wrapper = mount(Paginator, {
      props: {
        totalItems: 15,
      },
    });
    await wrapper.get('[data-test="smallNext"]').trigger("click");
    expect(wrapper.emitted("page-selected")[0][0].pageNumber).toBe(2);

    await wrapper.get('[data-test="smallPrevious"]').trigger("click");
    expect(wrapper.emitted("page-selected")[1][0].pageNumber).toBe(1);
  });

  it("should update on updating total items", async () => {
    const wrapper = mount(Paginator, {
      props: {
        totalItems: 15,
      },
    });
    await wrapper.setProps({
      totalItems: 30,
    });

    expect(wrapper.vm.paginatorDetails.totalPages).toBe(3);
  });

  it("works when page numbers exceed max pages", async () => {
    const wrapper = mount(Paginator, {
      props: {
        totalItems: 15,
        pageSize: 2,
      },
    });

    expect(wrapper.vm.paginatorDetails.pageNumbers).toEqual([1, 2, 3, 4, 5]);

    await wrapper.get('[data-test="pageButton-3"]').trigger("click");
    expect(wrapper.vm.paginatorDetails.pageNumbers).toEqual([2, 3, 4, 5, 6]);

    await wrapper.get('[data-test="pageButton-4"]').trigger("click");
    expect(wrapper.vm.paginatorDetails.pageNumbers).toEqual([4, 5, 6, 7, 8]);
  });
});
