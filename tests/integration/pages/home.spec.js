import { Selector } from "testcafe";
import { loginGoogleUserAndSetLocale } from "../helpers/loginByGoogle";

fixture("Home - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (testcafe) => {
    await loginGoogleUserAndSetLocale();
  });

test("sees the home page", async (testcafe) => {
  const noPlioSection = Selector('[data-test="noPlio"]');
  const plioTable = Selector('[data-test="table"]');
  const noPliosExist = await noPlioSection.exists;

  if (noPliosExist)
    // plio table should not exist as there are no plios
    await testcafe.expect(plioTable.exists).notOk();
  // plio table should exist as there are plios
  else await testcafe.expect(plioTable.exists).ok();
});
