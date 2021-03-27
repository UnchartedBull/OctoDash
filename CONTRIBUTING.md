If you can think of something nice to add or want to change / extend some of the functionality, feel free to create a Pull Request or an Issue. Please make sure to follow the code style (.prettierrc is included in the GitHub) and not break any of the existing functionality. Any help is greatly appreciated!

## Setting up the repository and build the package

To setup a local environment you need to do the following steps:
- Fork the repository to your GitHub account, so you can push your changes
- Clone the repository
- Install dependencies: `npm install`
- Run the build `npm run build` (only required once to copy assets)
- Start the Live Server: `npm run start` or `npm run start:big`
- If you want to package OctoDash, so you can install it on your Raspberry Pi: `npm run pack`

## Add a new language

To add a language to the list of supported languages, follow these steps:
- run `npm run extract:locale` to generate a new locale file in src/locale (or duplicate an existing one)
- add the translations for your language between `target` tags
- add your language reference in `angular.json` under `Projects.OctoDash.i18n.locales`
