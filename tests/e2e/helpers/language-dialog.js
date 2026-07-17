const LANGUAGE_PICKER = '[data-test="languagePicker-en"]';

/**
 * Dismiss the "Select your language" dialog if it shows.
 *
 * The dialog appears for a user with no language set in config and animates
 * in a few hundred ms after the page settles. A bare `isVisible()` check
 * races that animation — if it runs before the dialog mounts it returns
 * false, the dialog then appears, and it intercepts pointer events on the
 * page (e.g. the Create button) for the rest of the test. Wait briefly for
 * the dialog instead of sampling once; absence is the common case, so a
 * short timeout keeps already-dismissed runs fast.
 */
async function dismissLanguageDialog(page, { timeout = 5000 } = {}) {
  const picker = page.locator(LANGUAGE_PICKER);
  try {
    await picker.waitFor({ state: "visible", timeout });
  } catch {
    return; // no dialog this run — language already chosen
  }
  await picker.click();
  await picker.waitFor({ state: "hidden" });
}

module.exports = { dismissLanguageDialog };
