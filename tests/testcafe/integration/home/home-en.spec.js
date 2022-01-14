import { Selector } from "testcafe";
import { googleAuthUser } from "../../helpers/loginByGoogle";

fixture("Home - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (t) => {
    const localeSelect = Selector("#locale > select");
    const localeOption = localeSelect.find('option[value="en"]');
    await t.click(localeSelect).click(localeOption);
    t.useRole(googleAuthUser);
    await t.navigateTo(`${process.env.BROWSERSTACK_BASE_URL}/home`);
  });

test("sees the home page", async (t) => {
  const noPlioSection = Selector('[data-test="noPlio"]');
  await t.expect(noPlioSection.visible).ok();

  // plio table should not exists as there are no plios
  const plioTable = Selector('[data-test="table"]');
  await t.expect(plioTable.exists).notOk();
});
