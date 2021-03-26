#!/bin/bash

if [ "$EUID" -ne 0 ]
    echo "This script requires root privileges. Please enter your sudo password when prompted."
    sudo $0 $@
    exit
fi

VERSION=$(dpkg -s octodash 2>/dev/null| grep '^Version' | awk ' { print $2 } ')

if [ -z "${VERSION}" ]
then
    echo "Not installed"
    exit 1
fi

VER_MAJOR=$(echo "${VERSION} | awk -F'.' ' { print $1 } '")
VER_MINOR=$(echo "${VERSION} | awk -F'.' ' { print $2 } '")
VER_PATCH=$(echo "${VERSION} | awk -F'.' ' { print $3 } '")

if ![[ $VER_MAJOR -le 2 && $VER_MINOR -le 1 && $VER_PATCH -le 2 ]]
then
    echo "This script is intended for OctoDash 2.1.2 and earlier. To remove execute the following commands:"
    echo -e "\t systemctl stop octodash"
    echo -e "\t apt remove octodash"
    exit 1
fi

echo "Removing OctoDash ..."

killall octodash

dpkg -P octodash

rm -rf /home/pi/.config/octodash/

sed -i '/xset s off/d' /home/pi/.xinitrc
sed -i '/xset s noblank/d' /home/pi/.xinitrc
sed -i '/xset -dpms/d' /home/pi/.xinitrc
sed -i '/ratpoison&/d' /home/pi/.xinitrc
sed -i '/octodash/d' /home/pi/.xinitrc

echo "OctoDash has been removed :(. Please review your /home/pi/.xinitrc and /home/pi/.bashrc files to make sure everything got removed properly!"
