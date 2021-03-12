import { createI18n } from 'vue-i18n'
import translationsEn from './locales/en'
import translationsHi from './locales/hi'

/**
 * Load locale messages
 * 
 * The loaded `JSON` locale messages is pre-compiled by `@intlify/vue-i18n-loader`,
 * which is integrated into `vue-cli-plugin-i18n`.
 * See: https://github.com/intlify/vue-i18n-loader#rocket-i18n-resource-pre-compilation
 */
function loadLocaleMessages() {
    const messages = {
        en: translationsEn,
        hi: translationsHi
    }
    return messages
}

export default createI18n({
    locale: process.env.VUE_APP_I18N_LOCALE || 'en',
    fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
    messages: loadLocaleMessages()
})