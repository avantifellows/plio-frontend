import { Selector } from "testcafe";
import { loginGoogleUserAndSetLocale } from "../../helpers/loginByGoogle";
import { selectLocale } from "../../helpers/selectLocale";

fixture("Login - English")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (testcafe) => {
    await selectLocale("en");
  });

test("sees the login page", async (testcafe) => {
  const loginHeading = Selector('[data-test="loginHeading"]');
  await testcafe
    .expect(loginHeading.innerText)
    .eql("Convert videos into interactive lessons");

  const googleLoginButton = Selector('[data-test="googleLogin"] p');
  await testcafe.expect(googleLoginButton.innerText).eql("Sign in with Google");

  const phoneInput = Selector('[data-test="phone"] input');
  await testcafe.expect(phoneInput.visible).ok();

  const languageSelect = Selector("#locale > select");
  await testcafe.expect(languageSelect.visible).ok();
});

test("logs in to the application using Google OAuth", async (testcafe) => {
  await loginGoogleUserAndSetLocale();

  const logoutOption = Selector('[data-test="logout"]');
  await testcafe.expect(logoutOption.visible).ok();
  await testcafe.expect(logoutOption.innerText).contains("Logout");
});
