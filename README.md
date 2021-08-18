<p align="center">
    <img width="300" height="300" src="./src/assets/icon/icon-main-dark-title.svg">
    <br><br>
    <img src="https://img.shields.io/github/workflow/status/UnchartedBull/OctoDash/build/main?style=for-the-badge">
    <img src="https://img.shields.io/codefactor/grade/github/UnchartedBull/OctoDash/main?style=for-the-badge">
    <img src="https://img.shields.io/github/package-json/v/UnchartedBull/OctoDash/main?style=for-the-badge">
    <img src="https://img.shields.io/github/downloads/UnchartedBull/OctoDash/latest/total?color=lightgrey&style=for-the-badge">
    <br>
    <b>OctoDash is a simple, but beautiful dashboard for OctoPrint. Please read the instructions carefully!</b><br />
    OctoDash is a User Interface for OctoPrint, it utilizes the OctoPrint API but tries to use modern design principles in order to fully enable the power of your Raspberry Pi attached to your 3D Printer. OctoDash works best with a Touchscreen and will support almost all functions that OctoPrint offers just in a nicer format. Give it a try!
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Nightly Builds](#nightly-builds)
- [Update](#update)
- [Tips and Tricks](#tips-and-tricks)
- [Demo](#demo)
- [Screenshots](#screenshots)
- [Get in contact](#get-in-contact)
- [Troubleshooting](#troubleshooting)
- [Bugs and more](#bugs-and-more)
- [Contributing](#contributing)
- [License](#license)

## Installation

```
bash <(wget -qO- https://github.com/UnchartedBull/OctoDash/raw/main/scripts/install.sh)
```

_Execute this command as the user that logs in on the display (usually `pi`) and not as `root` or with `sudo`._ For more options and information have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Installation).

No Keyboard? [No Problem](https://github.com/UnchartedBull/OctoDash/wiki/Setup-&-Settings#setup-without-keyboard).

Having issues during the installation? Please have a look at the [Troubleshooting Guide](https://github.com/UnchartedBull/OctoDash/wiki/Troubleshooting) first.

### Nightly Builds

Thanks to M1dn1ghtN1nj4 nightly builds are available here: https://sites.google.com/view/m1dn1ght-3d/downloads/unofficial-octodash-builds?authuser=0. They should be stable, still not recommended for production.

## Tips and Tricks

- OctoDash supports printing from your Raspberry and from the printers SD card, if configured in OctoPrint (v1.5.0 and up)
- You can let OctoDash push out and pull in the filament during a filament change, if you setup your feed length correctly (v1.5.0 and up)
  - You can also use your printers filament change progress, just enable this in the settings (the printer needs to support M600)
- If you're using FilamentManager add the color (in HEX format) to the end of the name, like "Vendor black (#000000)", this color will then be shown in the filament selection menu
- You can adjust the look of OctoDash by adjusting the `~/.config/octodash/custom-styles.css` file and adding your own CSS rules (v2.0.0 and up)
- OctoDash supports .ufp package and PrusaSlicer preview images (v1.5.0 and up)
  - To get the best results, you should use a square aspect ration, like `256x256`
- You can also show the thumbnails during print, if you press on the percentage inside the progress ring (v1.5.0 and up)
- You can press multiple arrows directly after another in the control view. All actions will be executed in series, even if the prior didn't finish
- The six actions on the right in the control view can be customized. They can either send GCode commands to your printer, restart OctoPrint or your Pi and even open iFrames so you can view your camera
- You can adjust the temperatures and fan speed in the home screen by pressing on their icons, if you want to set them to zero, just tap the value once (v1.4.1 and up)
- OctoDash will start in your host's language if it is supported. You can start OctoDash in a different supported language by starting it with `LANG=fr_FR.UTF-8 octodash`. Currently supported languages are: `fr_FR.UTF-8`, english will be used if your requested language isn't available

## Demo

If you want to see OctoDash in action, here is an awesome video from Nick on [YouTube](https://youtu.be/YI_c-DY6zU4) there is also a video available from Chris Riley, which also shows the installation process on [YouTube](https://youtu.be/kwo3HMBnqC4)

## Screenshots

<p float="left">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/main-screen.png" width="49.5%" alt-text="Main Screen"/>
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/job.png" width="49.5%" alt-text="Job Running">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/control.png" width="49.5%" alt-text="Printer Controls">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/print_controls.png" width="49.5%" alt-text="In Print">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/files_view.png" width="49.5%" alt-text="List Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/file_details.png" width="49.5%" alt-text="Details about Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/file_loaded.png" width="49.5%" alt-text="Loaded Files">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/filament_selection.png" width="49.5%" alt-text="Settings">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/filament_heating.png" width="49.5%" alt-text="Settings">
    <img src="https://raw.githubusercontent.com/TimonGaebelein/OctoprintDash/main/screenshots/settings.png" width="49.5%" alt-text="Settings">
</p>

More Screenshots can be found [here](https://github.com/UnchartedBull/OctoDash/tree/main/screenshots).

## Get in contact

We now have a Discord server as well. Feel free to join and ask your support & development questions over there: https://discord.gg/gTasZTz.

## Troubleshooting

If you encounter an issue, while using OctoDash please have a look at the [wiki](https://github.com/UnchartedBull/OctoDash/wiki/Troubleshooting) first! If your issue is not covered please open an issue!

## Bugs and more

If you find a bug, please open an issue, so I can have a look at it. Please also add the steps to reproduce and the .gcode file (if applicable). Thank you!

## Contributing

See [CONTRIBUTING.md](https://github.com/UnchartedBull/OctoDash/blob/main/CONTRIBUTING.md).

## License

The project is licensed under the Apache 2.0 License. [More Information](https://github.com/UnchartedBull/OctoDash/blob/main/LICENSE.md).
