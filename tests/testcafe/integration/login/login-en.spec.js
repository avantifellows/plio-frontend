import { Selector } from "testcafe";
import { loginByGoogle } from "../../helpers/loginByGoogle";

fixture("Login - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (t) => {
    const localeSelect = Selector("#locale > select");
    const localeOption = localeSelect.find('option[value="en"]');
    await t.click(localeSelect).click(localeOption);
  });

test("sees the login page", async (t) => {
  const loginHeading = Selector('[data-test="loginHeading"]');
  await t
    .expect(loginHeading.innerText)
    .eql("Convert videos into interactive lessons");

  const googleLoginButton = Selector('[data-test="googleLogin"] p');
  await t.expect(googleLoginButton.innerText).eql("Sign in with Google");

  const phoneInput = Selector('[data-test="phone"] input');
  await t.expect(phoneInput.visible).ok();

  const languageSelect = Selector("#locale > select");
  await t.expect(languageSelect.visible).ok();

  await loginByGoogle();

  const logoutOption = Selector('[data-test="logout"]');
  await t.expect(logoutOption.visible).ok();
  await t.expect(logoutOption.innerText).contains("Logout");
});
