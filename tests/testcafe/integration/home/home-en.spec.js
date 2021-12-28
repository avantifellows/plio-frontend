import { Selector } from "testcafe";

fixture("Home - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (t) => {
    const localeSelect = Selector("#locale > select");
    const localeOption = localeSelect.find('option[value="en"]');
    await t.click(localeSelect).click(localeOption);
    // log into the system
    await t
      .click('[data-test="googleLogin"]')
      .typeText('[type="email"]', process.env.GOOGLE_ACCOUNT_EMAIL)
      .pressKey("enter")
      .typeText('[type="password"]', process.env.GOOGLE_ACCOUNT_PASSWORD)
      .pressKey("enter");
  });

test("sees the home page", async (t) => {
  await t.wait(5000); // let page render
  const plioTable = Selector('[data-test="table"]');
  await t.expect(plioTable.visible).ok();
});
