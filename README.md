<p align="center">
    <img width="300" height="300" src="./src/assets/icon/icon-main-dark-title.svg">
    <br><br>
    <img src="https://travis-ci.org/UnchartedBull/OctoDash.svg?branch=master">
    <img src="https://www.codefactor.io/repository/github/unchartedbull/octodash/badge">
    <img src="https://img.shields.io/github/issues/UnchartedBull/OctoDash.svg">
    <img src="https://img.shields.io/github/package-json/v/UnchartedBull/OctoDash.svg">
    <img src="https://img.shields.io/github/downloads/UnchartedBull/OctoDash/total.svg?color=brightgreen">
    <br>
    <b>OctoDash is a simple, but beautiful dashboard for OctoPrint. Please read the instructions carefully!</b><br />
    OctoDash is a User Interface for OctoPrint, it utilizes the OctoPrint API but tries to use modern design principles in order to fully enable the power of your Raspberry Pi attached to your 3D Printer. OctoDash works best with a Touchscreen and will support almost all functions that OctoPrint offers just in a nicer format. Give it a try!
</p>

## Table of Contents

-   [Table of Contents](#table-of-contents)
-   [Installation](#installation)
-   [Update](#update)
-   [Tips and Tricks](#tips-and-tricks)
-   [Screenshots](#screenshots)
-   [Troubleshooting](#troubleshooting)
-   [Bugs and more](#bugs-and-more)
-   [Contributing](#contributing)
-   [License](#license)

## Installation

**_Note: This script will install additional OctoPrint Plugins by default. If you want to know which visit the Wiki!_**

```
wget -qO- https://github.com/UnchartedBull/OctoDash/raw/master/scripts/install.sh | bash -s -- --ptg
```

For more options and information have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Installation).

No Keyboard? [No Problem](https://github.com/UnchartedBull/OctoDash/wiki/Installation#setup-without-keyboard).

Having issues during the installation? Please have a look at the [Troubleshooting Guide](https://github.com/UnchartedBull/OctoDash/wiki/Troubleshooting) first.

## Update

```
wget -qO- https://github.com/UnchartedBull/OctoDash/raw/master/scripts/update.sh | bash
```

For more info have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Update)

## Tips and Tricks

-   OctoDash supports printing from your Raspberry and from the printers SD card, if configured in OctoPrint (v1.5.0 and up)
-   OctoDash supports .ufp package and PrusaSlicer preview images (v1.5.0 and up)
-   You can let OctoDash push out and pull in the filament during a filament change, if you setup your feed length correctly. (v1.5.0 and up)
-   You can also view the previews during print, if you press on the percentage inside the progress ring (v1.5.0 and up)
-   You can press multiple arrows directly after another in the control view. All actions will be executed one after another, even if the prior didn't finish before pressing the button
-   The six actions on the right in the control view can be customized. They can either send GCode commands to your printer, restart OctoPrint or your Pi and even open iFrames so you can view your camera
-   You can adjust the temperatures in the home screen, by pressing on their icons (v1.4.1 and up)

## Screenshots

<p float="left">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/main-screen.png" width="49.5%" alt-text="Main Screen"/>
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/job.png" width="49.5%" alt-text="Job Running">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/control.png" width="49.5%" alt-text="Printer Controls">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/print_controls.png" width="49.5%" alt-text="In Print">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/files_view.png" width="49.5%" alt-text="List Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/file_details.png" width="49.5%" alt-text="Details about Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/file_loaded.png" width="49.5%" alt-text="Loaded Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/settings.png" width="49.5%" alt-text="Settings">
</p>

More Screenshots can be found [here](https://github.com/UnchartedBull/OctoDash/tree/master/screenshots).

## Troubleshooting

If you encounter an issue, while using OctoDash please have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Troubleshooting) first! If your issue is not covered please open an issue!

## Bugs and more

If you find a bug, please open an issue, so I can have a look at it. Please also add the steps to reproduce and the .gcode file. Thank you!

## Contributing

See [CONTRIBUTING.md](https://github.com/UnchartedBull/OctoDash/blob/master/CONTRIBUTING.md).

## License

The project is licensed under the Apache 2.0 License. [More Information](https://github.com/UnchartedBull/OctoDash/blob/master/LICENSE.md).
