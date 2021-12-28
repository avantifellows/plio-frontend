import { Selector } from "testcafe";

fixture("Login - Hindi")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (t) => {
    const localeSelect = Selector("#locale > select");
    const localeOption = localeSelect.find('option[value="hi"]');
    await t.click(localeSelect).click(localeOption);
  });

test("sees the login page", async (t) => {
  const loginHeading = Selector('[data-test="loginHeading"]');
  await t
    .expect(loginHeading.innerText)
    .eql("वीडियों को इंटरैक्टिव पाठों में बदलें");

  const googleLoginButton = Selector('[data-test="googleLogin"] p');
  await t.expect(googleLoginButton.innerText).eql("गूगल से साइन इन करें");

  const phoneInput = Selector('[data-test="phone"] input');
  await t.expect(phoneInput.visible).ok();

  const languageSelect = Selector("#locale > select");
  await t.expect(languageSelect.visible).ok();

  // log into the system
  await t
    .click('[data-test="googleLogin"]')
    .typeText('[type="email"]', process.env.GOOGLE_ACCOUNT_EMAIL)
    .pressKey("enter")
    .typeText('[type="password"]', process.env.GOOGLE_ACCOUNT_PASSWORD)
    .pressKey("enter");
  const logoutOption = Selector('[data-test="logout"]');
  await t.expect(logoutOption.visible).ok();
  await t.expect(logoutOption.innerText).contains("लॉगआउट");
});
