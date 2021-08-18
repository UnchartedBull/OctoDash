# Contributing

If you can think of something nice to add or want to change / extend some of the functionality, feel free to create a Pull Request or an Issue. Please make sure to follow the code style (.prettierrc is included in the GitHub) and not break any of the existing functionality. Any help is greatly appreciated!

## Setting up the repository and build the package

## Prerequisites

- NodeJS v14
- npm 7

## Setup

To setup a local environment you need to do the following steps:

- Fork the repository to your GitHub account, so you can push your changes
- Clone the repository
- Install dependencies: `npm install`
- Run the build `npm run build` (only required once to copy assets)
- Start the Live Server: `npm run start` or `npm run start:big`
- If you want to package OctoDash, so you can install it on your Raspberry Pi: `npm run pack`

## Languages

To launch the app in development mode in a specific locale instead of the source english locale, use

```
npm run start --serve="--configuration=<lang>"
```

For a list of available locales have a look at the `angular.json` (`projects.OctoDash.i18n.locales`) file.

### Add a new language

To add a language to the list of supported languages, follow these steps or follow the official Angular Tutorial [here](https://angular.io/guide/i18n#translate-each-translation-file):

- find your ISO639-2 language code [here](https://www.loc.gov/standards/iso639-2/php/code_list.php)
- run `npm run locale:extract` to generate a new locale file
- locate the newly created file in the `src/locale` folder
- rename the file to include your language code in the format `messages.<languageCode>.xlf`
- in the `<file>` tag (second line of the xlf file) add `target-language="<languageCode>"`
- duplicate the `<source>` tags for each element, replace `source` with `target` and put your translation in that tag
- you can also use any XLIFF translation tool (i.e. [Brightex XLIFF](http://xliff.brightec.co.uk/)) to speed up the process
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

To update translations with the latest codebase and IDs, run `npm run locale:update`. Only commit the files that do not have a date, these are only backups of the locale versions before the update.
