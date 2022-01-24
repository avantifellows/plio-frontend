import { t as testcafe, Selector } from "testcafe";

export const selectLocale = async (locale) => {
  const localeSelect = Selector("#locale > select");
  const localeOption = localeSelect.find(`option[value="${locale}"]`);
  await testcafe.click(localeSelect).click(localeOption);
};

export const selectLocaleFromDialog = async (locale) => {
  await testcafe.click(`[data-test="setLocaleDialog-${locale}"]`);
};
