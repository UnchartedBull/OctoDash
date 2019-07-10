# OctoprintDash

OctoprintDash is a small, but beautiful monitoring UI for Octoprint. It doesn't support touchscreen input (yet).

## Screenshots

tbd.

## Installation

### Building the App

- Clone the repository - `git clone https://github.com/TimonGaebelein/OctoprintDash && cd OctoprintDash`
- Install all the dependencies - `npm install`
- Adjust `src/assets/config.json` accordingly to your installation
- Build the app - `ng build --prod`

### Using the App

After the step before, you will have a simple http website located at `dist`. You can serve the website via any webserver, or, if you don't have a server installed, use the supplied node server, located at `server`. If you'd like to use the node server the steps are the following.

- Move the website - `mv dist/OctoprintDash/* server/web/`
- Copy the server folder over to the raspberry
- Install npm dependencies for server on the raspberry - `cd server && npm install`
- Open chromium in kiosk mode - `chromium-browser --kiosk --app=http://localhost:8080`

## Bugs and more

If you find a bug, please open an issue, so I can have a look at it. Please also add the steps to reproduce and the .gcode file. Thank you!

One more thing: If you're Octoprint is running on a Raspberry Pi 1 you may want to opt out of this, because it just does not have enough power.
