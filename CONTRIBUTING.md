# General

If you can think of something nice to add or want to change / extend some of the functionality, feel free to create a Pull Request or an Issue. Please make sure to follow the code style (.prettierrc is included in the GitHub) and not break any of the existing functionality. Any help is greatly appreciated!
## Setting up the repository and build the package

To setup a local environment you need to do the following steps:
- Fork the repository to your GitHub account, so you can push your changes
- Clone the repository
- Install dependencies: `npm install`
- Run the build `npm run build` (only required once to copy assets)
- Start the Live Server: `npm run start` or `npm run start:big`
- If you want to package OctoDash, so you can install it on your Raspberry Pi: `npm run pack`

# Languages

To launch the app in development mode in a specific locale instead of the source english locale, use 
```
npm run start --serve="--configuration=<lang>"
```

## Add a new language

To add a language to the list of supported languages, follow these steps:
- find your language code in [this list](https://github.com/angular/angular/tree/master/packages/common/locales) (angular country codes are not all standard)
- in src/locale, duplicate an existing locale (or run `npm run locale:extract` to generate a new locale file)
- rename the file to include your language code in the format `messages.<languageCode>.xlf`
- in the `<file>` tag (second line of the xlf file) adapt `source-language="<languageCode>"` to your language code
- add the translations for your language between `target` tags
- add your language reference in `angular.json` 
  - `Projects.OctoDash.i18n.locales`
    - add:
      ```
      "<lang>": {
        "translation": "src/locale/messages.<lang>.xlf",
        "baseHref": ""
      } 
      ```
  - `Projects.OctoDash.architect.build.configurations.production.localize`.
    - add:
      ```
        "<lang>"
      ```
  - `Projects.OctoDash.architect.build.configurations`.
    - add:
      ```
      "<lang>": {
        "localize": ["<lang>"]
      },
      ```
  - `Projects.OctoDash.architect.serve.configurations`.
    - add:
      ```
        "<lang>": {
          "browserTarget": "OctoDash:build:<lang>"
        },
      ```

## Update translations IDs and sources

To update translations with the latest codebase and IDs, run `npm run update:locales`. Only commit the files that do not have a date, these are only backups of the locale versions before the update.
