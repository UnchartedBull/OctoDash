<p align="center">
    <img width="200" height="200" src="https://github.com/UnchartedBull/OctoDash/raw/master/build/icon.png">
    <br>
    <img src="https://travis-ci.org/UnchartedBull/OctoDash.svg?branch=master">
    <img src="https://img.shields.io/github/issues/UnchartedBull/OctoDash.svg">
    <img src="https://img.shields.io/github/package-json/v/UnchartedBull/OctoDash.svg">
    <img src="https://img.shields.io/github/downloads/UnchartedBull/OctoDash/total.svg?color=brightgreen">
    <br>
    <b>OctoDash is a simple, but beautiful dashboard for OctoPrint. Please read the instructions carefully!</b><br />
    OctoDash is a User Interface for OctoPrint, it utilizes the OctoPrint API but tries to use modern design principles in order to fully enable the power of your Raspberry Pi attached to your 3D Printer. OctoDash works best with a Touchscreen and will support almost all functions that OctoPrint offers just in a nicer format. Give it a try!
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Update](#update)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Bugs and more](#bugs-and-more)
- [Contributing](#contributing)
- [License](#license)
- [Special Thanks](#special-thanks)

## Installation

***Note: This script will install additional OctoPrint Plugins by default. If you want to know which visit the Wiki!***

```
wget -qO- https://github.com/UnchartedBull/OctoDash/raw/master/scripts/install.sh | bash -s -- --ptg
```

For more options and information hava a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Installation)

## Update
```
wget -qO- https://github.com/UnchartedBull/OctoDash/raw/master/scripts/update.sh | bash
```

For more info have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Update)


## Screenshots
<p float="left">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/main-screen.png" width="49.5%" alt-text="Main Screen"/>
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/job.png" width="49.5%" alt-text="Job Running">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/control.png" width="49.5%" alt-text="Printer Controls">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/print_controls.png" width="49.5%" alt-text="In Print">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/files_view.png" width="49.5%" alt-text="List Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/master/screenshots/file_details.png" width="49.5%" alt-text="Details about Files">
</p>

More Screenshots can be found [here](https://github.com/UnchartedBull/OctoDash/tree/master/screenshots).

## Troubleshooting

If you encounter an issue, while using OctoDash please have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Troubleshooting) first! If your issue is not covered please open an issue!

## Bugs and more

If you find a bug, please open an issue, so I can have a look at it. Please also add the steps to reproduce and the .gcode file. Thank you!

One more thing: If you're Octoprint is running on a Raspberry Pi 1 you may want to opt out of this because it just does not have enough power.

## Contributing

See [CONTRIBUTING.md](https://github.com/UnchartedBull/OctoDash/blob/master/CONTRIBUTING.md).

## License

The project is licensed under the Apache 2.0 License. [More Information](https://github.com/UnchartedBull/OctoDash/blob/master/LICENSE.md).

The Credits for the icons can be (temporarily) found at icons.txt. They'll get moved into the product soon.


## Special Thanks

Special Thanks to [/u/Slateclean](https://www.reddit.com/user/Slateclean) for supplying me with touchscreens so I can further develop the project. Without you, this wouldn't be happening!
