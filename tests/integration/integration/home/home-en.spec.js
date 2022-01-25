import { Selector } from "testcafe";
import { loginGoogleUserAndSetLocale } from "../../helpers/loginByGoogle";

fixture("Home - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (testcafe) => {
    await loginGoogleUserAndSetLocale();
  });

test("sees the home page", async (testcafe) => {
  const noPlioSection = Selector('[data-test="noPlio"]');
  await testcafe.expect(noPlioSection.visible).ok();

  // plio table should not exists as there are no plios
  const plioTable = Selector('[data-test="table"]');
  await testcafe.expect(plioTable.exists).notOk();
});
