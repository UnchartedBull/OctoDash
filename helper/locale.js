/* eslint-disable @typescript-eslint/no-var-requires */

function getLocale() {
  const i18n = require('../angular.json').projects.OctoDash.i18n;
  let lang;
  try {
    // Detect if environment LANG is set
    // if it is defined, convert LANG from ie 'en_US.UTF-8' to 'en-US'
    // if not defined, set it to the source locale
    lang = process.env['LANG'] ? process.env['LANG'].split('.')[0].replace('_', '-') : i18n.sourceLocale.code;
  } catch (e) {
    // LANG was populated with something else than a standard locale code
    lang = i18n.sourceLocale.code;
  }
  // Check if exact LANG exists in our locales
  const exactLocale = Object.keys(i18n.locales).includes(lang) && lang;
  // Make the short version, convert ie 'en-US' to 'en'
  const shortLang = lang.split('-')[0];
  // This matches 'fr-CA' to 'fr' if 'fr-CA' is not defined but 'fr' is
  const approximateLocale = Object.keys(i18n.locales).includes(shortLang) && shortLang;
  // Define locale by either the exact, approximate, or source locale in this order
  const locale = exactLocale || approximateLocale || i18n.sourceLocale.code;
  console.info('selected language: ' + locale);
  return locale;
}

// updates all supported locales consuming an updated messages.xlf
function updateLocales() {
  const fs = require('fs');
  const xliff = require('xliff');

  // list all existing locales
  let translatedXLFs = [];
  const filenames = fs.readdirSync('./src/locale');
  for (let filename of filenames) {
    const match = filename.match(/messages.(..|..-..).xlf/);
    if (match) {
      const lang = match[1];
      translatedXLFs.push({ filename, lang });
    }
  }

  // get extracted messages
  const extractedXLF = fs.readFileSync('./src/locale/messages.xlf').toString();
  xliff.xliff12ToJs(extractedXLF, (err, extracted) => {
    if (err) throw new Error(err.message);

    // for each supported locale
    for (let translatedXLFRef of translatedXLFs) {
      const translatedXLF = fs.readFileSync(`./src/locale/${translatedXLFRef.filename}`).toString();

      // load this locale
      xliff.xliff12ToJs(translatedXLF, (err, translated) => {
        if (err) throw new Error(err.message);

        // hard copy of messages.xlf
        const newTranslation = JSON.parse(JSON.stringify(extracted));
        newTranslation.targetLanguage = translated.targetLanguage;
        // transfer the locale's translations to the copy of the extracted locale
        for (let id in newTranslation.resources['ng2.template']) {
          const source = translated.resources['ng2.template'];
          const target = newTranslation.resources['ng2.template'];
          // only copy if the translation has a target
          if (source[id]) {
            target[id].target = source[id]?.target || '';
          }
        }
        // backup the previous version of the locale and write the new locale
        xliff.jsToXliff12(newTranslation, (err, result) => {
          if (err) throw new Error(err.message);
          const now = new Date();
          fs.renameSync(
            `./src/locale/${translatedXLFRef.filename}`,
            `./src/locale/messages.${translatedXLFRef.lang}-${now.toISOString()}.xlf`,
          );
          console.info(`updating ${translatedXLFRef.filename}...`);
          fs.writeFileSync(`./src/locale/${translatedXLFRef.filename}`, result);
        });
      });
    }
  });
}

module.exports = { getLocale, updateLocales };
