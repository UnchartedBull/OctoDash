# This script is to migrate from a legacy (<v3) OctoDash installation to a newer version.

# Version 3 moves away from a .deb package to delivering everything as an OctoPrint plugin,
# which means we just need to point a web broswer to the appropriate place.

# find the directory that this script is in
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

source $DIR/functions.sh
source $DIR/constants.sh

text_input "$octodash_url_prompt" octoprint_url $octodash_url_default

echo "Installing chromium-browser ..."
install-apt "chromium-browser"

echo "Updating .xinitrc to launch Chromium instead of legacy OctoDash..."

XINITRC="$HOME/.xinitrc"
if grep -q "octodash" "$XINITRC"; then
    sed -i "s!^octodash.*\$!$browser_launch_string $octoprint_url$octoprint_suffix!" "$XINITRC"
    echo ".xinitrc updated: replaced 'octodash' with Chromium launch command."
fi