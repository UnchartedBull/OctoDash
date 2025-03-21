# Contributing

If you can think of something nice to add or want to change / extend some of the functionality, feel free to create a Pull Request or an Issue. Please make sure to follow the code style (.prettierrc is included in the GitHub) and not break any of the existing functionality. Any help is greatly appreciated!

## Setting up the repository and build the package

## Prerequisites

- NodeJS v20
- npm 11
- Recommended: Unix-based OS (or WSL on Windows)

## Setup

To setup a local environment, perform the following steps:

- Fork the repository to your GitHub account, so you can push your changes
- Clone the repository
- Install dependencies: `npm install`
- Run the build `npm run build` (only required once to copy assets)

> [!NOTE]
> If you modify `/src/helper/config.schema.json`, run `npm run prepare` to regenerate the dependent files.

## Testing

To test locally in a dev environment, simply run `npm start`. The app will automatically reload when changes are made.

If you want to package OctoDash so you can install it on your target device, run `npm run pack`. This will generate `.deb` files in the `package/` folder, which you can upload to your target device for installation and testing in a production environment.

## Localization

To launch the app in development mode in a specific locale instead of the source English locale, use:

```
npm start --serve="--configuration=<lang>"
```

For a list of available locales have a look at the `angular.json` (`projects.OctoDash.i18n.locales`) file.

### Add a new language

To add a language to the list of supported languages, follow these steps or follow the official Angular Tutorial [here](https://angular.io/guide/i18n#translate-each-translation-file):

- Find your ISO639-2 language code [here](https://www.loc.gov/standards/iso639-2/php/code_list.php)
- Run `npm run locale:extract` to generate a new locale file
- Locate the newly created file in the `src/locale` folder
- Rename the file to include your language code in the format `messages.<languageCode>.xlf`
- In the `<file>` tag (second line of the xlf file), add `target-language="<languageCode>"`
- Duplicate the `<source>` tags for each element, replace `source` with `target` and put your translation in that tag
- You can also use any XLIFF translation tool (i.e. [Brightex XLIFF](http://xliff.brightec.co.uk/)) to speed up the process
- Add your language reference in `angular.json`

  - `Projects.OctoDash.i18n.locales`

    - Add:

      ```
      "<lang>": {
        "translation": "src/locale/messages.<lang>.xlf",
        "baseHref": ""
      }
      ```

  - `Projects.OctoDash.architect.build.configurations.production.localize`.

    - Add:

      ```
        "<lang>"
      ```

  - `Projects.OctoDash.architect.build.configurations`.

    - Add:

      ```
      "<lang>": {
        "localize": ["<lang>"]
      },
      ```

  - `Projects.OctoDash.architect.serve.configurations`.

    - Add:

      ```
        "<lang>": {
          "browserTarget": "OctoDash:build:<lang>"
        },
      ```

## Update translations IDs and sources

To update translations with the latest codebase and IDs, run `npm run locale:update`. Previous versions of the localization files will be stored locally in `src/locale/backups/`.
