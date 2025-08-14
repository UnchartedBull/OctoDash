# This script is to migrate from a legacy (<v3) OctoDash installation to a newer version.

# Version 3 moves away from a .deb package to delivering everything as an OctoPrint plugin,
# which means we just need to point a web broswer to the appropriate place.


echo "Installing Dependencies..."
{
    sudo apt -qq update
    sudo apt -qq install chromium-browser -y
} || {
  echo ""
  echo "Couldn't install dependenices!"
  echo "Seems like there is something wrong with the package manager 'apt'"
  echo ""
  echo "If the error is similar to: 'E: Repository 'http://raspbian.raspberrypi.org/raspbian buster InRelease' changed its 'Suite' value from 'stable' to 'oldstable''"
  echo "you can run 'sudo apt update --allow-releaseinfo-change' and then execute the OctoDash installation command again"
  exit -1
}


echo "Updating .xinitrc to launch Chromium..."

XINITRC="$HOME/.xinitrc"
if grep -q "octodash" "$XINITRC"; then
    sed -i 's/^octodash.*$/chromium-browser --kiosk http:\/\/localhost:5000/' "$XINITRC"
    echo ".xinitrc updated: replaced 'octodash' with Chromium launch command."
fi