# OctoDash

OctoDash is a simple, but beautiful dashboard for Octoprint.

## Installation

You need to install the DisplayLayerProgress Plugin by OllisGit to enable the full functionality of OctoDash. The API is currently not in the final plugin, so please install the plugin with the following link: https://github.com/UnchartedBull/OctoPrint-DisplayLayerProgress/archive/master.zip.

### Electron (recommended)

- Download the latest release for your architecture (for Raspberry Pi use armv7l)
`insert download command here`
- Install the app
`sudo dpkg -i name`
- If you get an error while installing install all missing dependencies and reinstall OctoDash.
`sudo apt install -f && sudo dpkg -i name`

#### Start on boot
This is a superminimal install to just display OctoDash on Raspbian LITE. Good thing is, that it keeps the load and the Pi quite low and improves start-up time. If you use another window manager adjust your  files according to the Documentation.

- Enable pi Console Autologin via
`sudo raspi-config`
- Install xorg + ratpoison
`sudo apt install xserver-xorg --no-install-recommends ratpoison x11-xserver-utils xinit`
- Create the .xinitrc file
`nano ~/.xinitrc`
- Add the following contents:
```
    #!/bin/sh

    xset s off
    xset s noblank
    xset -dpms

    ratpoison&
    octodash
```
- make the file executable
`sudo chmod +x .xinitrc`
- make xinit autostart on boot `nano ~/.bashrc`
- add the following at the very bottom:
```
if [ -z "$SSH_CLIENT" ] || [ -z "$SSH_TTY" ]; then
    xinit -- -nocursor
fi
```
- reboot


If you get the `Cannot open virtual console 2 (Permission denied)` error run `sudo chmod ug+s /usr/lib/xorg/Xorg` and reboot.

#### Creating config manually
If you don't want to use the Config Wizard you can also create the config manually. Just copy `sample.config.json` and adjust it according to your setup. Copy the file to `~/.config/octodash/config.json` (for Raspbian). For other OS please refer to the [Electron Docs](https://electronjs.org/docs/api/app#appgetpathname).


### Website

This option does not allow you to change your config via the UI and the styling may be a little off for you, due to your browser engine. It may improve performance slightly if you use a very lightweight browser.

- Clone the repository - `git clone https://github.com/TimonGaebelein/OctoprintDash && cd OctoprintDash`
- Install all the dependencies - `npm install`
- Adjust `src/assets/config.json` accordingly to your installation
- Build the app - `ng build --prod`
- The final website is located at `/dist`, which can be served by any web server and viewed by any web browser, that does support angular. A chromium-based web browser is recommended

## Supported Devices

It is recommended to use a 5" or 7" display with a resolution of 800x480 px. You shouldn't choose a screen smaller than 3.5" and with a lower resolution than 480x320 px.

The prebuilt electron app supports Raspberry Pi 2 and higher. The Raspberry Pi 1 is not supported and never will be supported. If you use a Pi 1 please use the Website Version or build the app yourself.

All other SoCs that are using an armv7, or arm64 compatible, processer are supported as well.

## Screenshots
<p float="left">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/job.png" width="49.5%" alt-         text="Job Running"/>
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/no_job.png" width="49.5%"           alt-text="No Job Running">
</p>

## Troubleshooting

If you encounter an issue, while using OctoDash please have a look at the wiki Troubleshooting Guide first (not done yet)! If your issue is not covered please open an issue!

## Bugs and more

If you find a bug, please open an issue, so I can have a look at it. Please also add the steps to reproduce and the .gcode file. Thank you!

One more thing: If you're Octoprint is running on a Raspberry Pi 1 you may want to opt out of this because it just does not have enough power.

## Contributing

If you can think of something nice to add or want to change some of the messy code feel free to create a Pull Request. I'll have a look at it and will merge it into master if everything checks out!
Any help is greatly appreciated!

If you can think of a great feature, but don't feel yet ready to code something open an issue. I'll have a look at it and maybe implement it if I have the time. It is preferred if you directly create a Pull Request for your new feature. If you need some help, I can point you in the correct direction.

## License

The project is licensed under the Apache 2.0 License.

The Credits for the icons can be (temporarily) found at icons.txt. They'll get moved into the product soon.


## Special Thanks

Special Thanks to [/u/Slateclean](https://www.reddit.com/user/Slateclean) for supplying me with touchscreens so I can further develop the project. Without you, this wouldn't be happening!
