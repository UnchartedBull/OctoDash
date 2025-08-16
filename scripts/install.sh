#!/bin/bash

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



dependencies="xserver-xorg xinit chromium-browser bc"
IFS='/' read -ra version <<< "$releaseURL"

echo "Setting up a kiosk browser for use with OctoDash. This script will install required graphical"
echo "libraries and the Chromium browser,"
echo "then configure it to launch in kiosk mode with the OctoDash interface."

echo ""

if [ ! -f "/etc/debian_version" ]; then
   echo ""
   echo "This script is only compatible with Debian-based Linux installations."
   echo "Other distributions are not officially supported, but should work by launching a web browser pointed at http://localhost:5000/plugin/octodash/ (or similar)"
   echo ""
fi

echo "Installing Dependencies ..."
install-apt $dependencies

text_input "$octodash_url_prompt" octoprint_url $octodash_url_default

yes_no=( 'yes' 'no' )

list_input "Should I setup OctoDash to automatically start on boot?" yes_no auto_start

#TODO: Get the screen resolution automatically
echo $auto_start
if [ $auto_start == 'yes' ]; then
    echo "Setting up Autostart ..."
    cat <<EOF > ~/.xinitrc
#!/bin/sh

xset s off
xset s noblank
xset -dpms

EOF
    echo "$browser_launch_string $octoprint_url$octoprint_suffix" >> ~/.xinitrc

    cat <<EOF >> ~/.bashrc
if [ -z "\$SSH_CLIENT" ] || [ -z "\$SSH_TTY" ]; then
    xinit -- -nocursor
fi
EOF


    echo "Setting up Console Autologin ..."
    sudo systemctl set-default multi-user.target
    sudo ln -fs /lib/systemd/system/getty@.service /etc/systemd/system/getty.target.wants/getty@tty1.service
    sudo mkdir -p /etc/systemd/system/getty@tty1.service.d
    sudo bash -c 'cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf' << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $USER --noclear %I \$TERM
EOF

    echo "Setting Permissions ..."
    sudo chmod +x ~/.xinitrc
    sudo chmod ug+s /usr/lib/xorg/Xorg

    echo "OctoDash will start automatically on next reboot. Please ensure that auto-login is enabled!"
fi



list_input "Shall I reboot your Pi now?" yes_no reboot
echo "OctoDash has been successfully installed! :)"
if [ $reboot == 'yes' ]; then
    sudo reboot
fi
