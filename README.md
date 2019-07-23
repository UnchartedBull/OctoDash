# OctoDash

![build status](https://travis-ci.org/UnchartedBull/OctoDash.svg?branch=master)
![issues](https://img.shields.io/github/issues/UnchartedBull/OctoDash.svg)
![version](https://img.shields.io/github/package-json/v/UnchartedBull/OctoDash.svg)
![downloads](https://img.shields.io/github/downloads/UnchartedBull/OctoDash/total.svg?color=brightgreen)  
OctoDash is a simple, but beautiful dashboard for OctoPrint. Please read the instructions carefully!

## Table of Contents

- [OctoDash](#octodash)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Electron App (recommended)](#electron-app-recommended)
      - [Creating Config manually](#creating-config-manually)
      - [Start on boot](#start-on-boot)
    - [Website (deprecated)](#website-deprecated)
  - [Update](#update)
  - [Supported Devices](#supported-devices)
  - [Screenshots](#screenshots)
  - [Troubleshooting](#troubleshooting)
  - [Bugs and more](#bugs-and-more)
  - [Contributing](#contributing)
  - [License](#license)
  - [Special Thanks](#special-thanks)

## Installation

You need to install the DisplayLayerProgress Plugin by OllisGit to enable the full functionality of OctoDash. The API is currently not in the final plugin, so please install the plugin with the following link: https://github.com/UnchartedBull/OctoPrint-DisplayLayerProgress/archive/master.zip.

### Electron App (recommended)

*Note: This tutorial is for the Raspberry Pi only (2 and higher). If you have running OctoPrint on something different please adjust the links*

- Download the latest release *Check for newer version (Releases)*  
`wget -O https://github.com/UnchartedBull/OctoDash/releases/download/v1.0.1/octodash_1.0.1_armv7l.deb octodash.deb   `
- Install the app  
`sudo dpkg -i octodash.deb`
- If you get an error while installing you may need to install the missing dependencies.  
`sudo apt install -f && sudo dpkg -i octodash.deb`

#### Creating Config manually
If you don't want to use the Config Wizard you can also create the config manually. Just copy `sample.config.json` and adjust it according to your setup. Copy the file to `~/.config/octodash/config.json` (for Raspbian). For other OS please refer to the [Electron Docs](https://electronjs.org/docs/api/app#appgetpathname).

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
- make xinit autostart on boot  
- `nano ~/.bashrc`
- add the following at the very bottom:
```
if [ -z "$SSH_CLIENT" ] || [ -z "$SSH_TTY" ]; then
    xinit -- -nocursor
fi
```
- reboot


If you get the `Cannot open virtual console 2 (Permission denied)` error run `sudo chmod ug+s /usr/lib/xorg/Xorg` and reboot.

### Website (deprecated)

The OctoDash Website Support was dropped in v1.1.0. It is still possible, you need to figure out some things yourself, though. The app will automatically detect a normal Browser Environment and will try to load `assets/config.json`.  
The Project can be build using the Angular CLI and can be served via any WebServer.

## Update
To update OctoDash to the latest version just follow the Installation instruction. The package manager will update the app, if there is an older version installed.  
Your config will not be touched during this process!

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
