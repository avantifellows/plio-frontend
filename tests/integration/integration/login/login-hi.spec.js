import { Selector } from "testcafe";
import { loginGoogleUserAndSetLocale } from "../../helpers/loginByGoogle";
import { selectLocale } from "../../helpers/selectLocale";

fixture("Login - Hindi")
  .page(`${process.env.BROWSERSTACK_BASE_URL}/login`)
  .beforeEach(async (testcafe) => {
    await selectLocale("hi");
  });

test("sees the login page", async (testcafe) => {
  const loginHeading = Selector('[data-test="loginHeading"]');
  await testcafe
    .expect(loginHeading.innerText)
    .eql("वीडियों को इंटरैक्टिव पाठों में बदलें");

  const googleLoginButton = Selector('[data-test="googleLogin"] p');
  await testcafe
    .expect(googleLoginButton.innerText)
    .eql("गूगल से साइन इन करें");

  const phoneInput = Selector('[data-test="phone"] input');
  await testcafe.expect(phoneInput.visible).ok();

  const languageSelect = Selector("#locale > select");
  await testcafe.expect(languageSelect.visible).ok();

  await loginGoogleUserAndSetLocale("hi");

  const logoutOption = Selector('[data-test="logout"]');
  await testcafe.expect(logoutOption.visible).ok();
  await testcafe.expect(logoutOption.innerText).contains("लॉगआउट");
});
