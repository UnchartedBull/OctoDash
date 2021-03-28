const angularConf = require('../angular.json')

module.exports = {
  getLocale() {
    const i18n = angularConf.projects.OctoDash.i18n;
    let lang;
    try {
      // Detect if environment LANG is set
      // if it is defined, convert LANG from ie 'en_US.UTF-8' to 'en-US'
      // if not defined, set it to the source locale
      lang = process.env['LANG']
        ? process.env['LANG'].split('.')[0].replace('_', '-')
        : i18n.sourceLocale;
    } catch(e) {
      // LANG was populated with something else than a standard locale code
      lang = i18n.souceLocale;
    }
    // Check if exact LANG exists in our locales
    const exactLocale = Object.keys(i18n.locales).includes(lang) && lang;
    // Make the short version, convert ie 'en-US' to 'en'
    const shortLang = lang.split('-')[0];
    // Check if short LANG exists in our locales
    // This matches 'fr-CA' to 'fr' if 'fr-CA' is not defined but 'fr' is
    const approximateLocale = Object.keys(i18n.locales).includes(shortLang) && shortLang;
    // Define locale by either the exact, approximate, or source locale in this order
    const locale = exactLocale || approximateLocale || i18n.sourceLocale;
    console.info('selected language: ' + locale);
    return locale;
  }
};
