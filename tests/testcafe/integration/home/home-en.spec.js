import { Selector } from "testcafe";
import { loginByGoogle } from "../../helpers/loginByGoogle";

fixture("Home - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (t) => {
    const localeSelect = Selector("#locale > select");
    const localeOption = localeSelect.find('option[value="en"]');
    await t.click(localeSelect).click(localeOption);
    await loginByGoogle();
  });

test("sees the home page", async (t) => {
  const plioTable = Selector('[data-test="table"]');
  await t.expect(plioTable.visible).ok();
});
