import { Selector } from "testcafe";
import { googleAuthUser } from "../../helpers/loginByGoogle";
import { selectLocaleFromDialog } from "../../helpers/selectLocale";

fixture("Home - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (testcafe) => {
    await testcafe
      .useRole(googleAuthUser)
      .navigateTo(`${process.env.BROWSERSTACK_BASE_URL}/home`);

    // have to set the locale again as the login page is loaded in a different language
    await selectLocaleFromDialog("en");
  });

test("sees the home page", async (testcafe) => {
  const noPlioSection = Selector('[data-test="noPlio"]');
  await testcafe.expect(noPlioSection.visible).ok();

  // plio table should not exists as there are no plios
  const plioTable = Selector('[data-test="table"]');
  await testcafe.expect(plioTable.exists).notOk();
});
