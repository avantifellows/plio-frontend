import { t, Selector } from "testcafe";

export const selectLocale = async (locale) => {
  const localeSelect = Selector("#locale > select");
  const localeOption = localeSelect.find(`option[value="${locale}"]`);
  await t.click(localeSelect).click(localeOption);
};

export const selectLocaleFromDialog = async (locale) => {
  await t.click(`[data-test="setLocaleDialog-${locale}"]`);
};
