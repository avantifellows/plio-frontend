import { Selector } from "testcafe";
import { googleAuthUser } from "../../helpers/loginByGoogle";
import {
  selectLocale,
  selectLocaleFromDialog,
} from "../../helpers/selectLocale";

fixture("Login - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (t) => {
    await selectLocale("en");
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

  await t
    .useRole(googleAuthUser)
    .navigateTo(`${process.env.BROWSERSTACK_BASE_URL}/home`);

  // have to set the locale again as the login page is loaded in a different language
  await selectLocaleFromDialog("en");

  const logoutOption = Selector('[data-test="logout"]');
  await t.expect(logoutOption.visible).ok();
  await t.expect(logoutOption.innerText).contains("Logout");
});
