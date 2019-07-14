# OctoDash

OctoDash is a simple, but beautiful dashboard for Octoprint.

## Installation

### Electron (recommended)

- Download the latest release, start the app and OctoDash will help you setup a config.

If you want to start Electron automatically have a look at the wiki (not done yet)


### Website

This option does not allow you to change your config via the UI and the styling may be a little off for you, due to your browser engine. It may improve performance slightly if you use a very lightweight browser.

- Clone the repository - `git clone https://github.com/TimonGaebelein/OctoprintDash && cd OctoprintDash`
- Install all the dependencies - `npm install`
- Adjust `src/assets/config.json` accordingly to your installation
- Build the app - `ng build --prod`
- The final website is located at `/dist`, which can be served by any webserver and viewed by any webbrowser, that does support angular. A chromium based webbrowser is recommended



## Screenshots
<p float="left">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/job.png" width="49.5%" alt-         text="Job Running"/>
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/no_job.png" width="49.5%"           alt-text="No Job Running">
</p>

## Troubleshooting

If you encounter an issue, while using OctoDash please have a look at the wiki Troubleshooting Guide first (not done yet)! If your issue is not covered please open an issue!

## Bugs and more

If you find a bug, please open an issue, so I can have a look at it. Please also add the steps to reproduce and the .gcode file. Thank you!

One more thing: If you're Octoprint is running on a Raspberry Pi 1 you may want to opt out of this, because it just does not have enough power.

## Contributing

If you can think of something nice to add or want to change some of the messy code feel free to create a Pull Request. I'll haev a look at it and will merge it into master if everything checks out!
Any help is greatly appreciated!

If you can think of a great feature, but don't feel yet ready to code something open an issue. I'll have a look at it and maybe implement it, if I have the time. It is preferred if you directly create a Pull Request for your new feature. If you need some help, I can point you in the correct direction.

## License

The project is licensed under the Apache 2.0 License.

The Credits for the icons can be (temporarily) found at icons.txt. They'll get moved into the product soon.


## Special Thanks

Special Thanks to [/u/Slateclean](https://www.reddit.com/user/Slateclean) for supplying me with touchscreens so I can further develop the project. Without you this wouldn't be happening!
