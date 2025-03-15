#!/bin/bash

if [ ! -f "/etc/debian_version" ]; then
   echo ""
   echo "OctoDash is only compatible with Debian-based Linux installations!"
   echo ""
fi

arch=$(dpkg --print-architecture)
if  [[ $arch == armhf ]]; then
  releaseURL=$(curl -s "https://api.github.com/repos/queengooborg/OctoDash/releases/latest" | grep "browser_download_url.*armv7l.deb" | cut -d '"' -f 4)
elif [[ $arch == arm64 ]]; then
  releaseURL=$(curl -s "https://api.github.com/repos/queengooborg/OctoDash/releases/latest" | grep "browser_download_url.*arm64.deb" | cut -d '"' -f 4)
elif [[ $arch == amd64 ]]; then
  releaseURL=$(curl -s "https://api.github.com/repos/queengooborg/OctoDash/releases/latest" | grep "browser_download_url.*amd64.deb" | cut -d '"' -f 4)
fi

echo "Updating OctoDash"

cd ~

wget -O octodash.deb $releaseURL -q --show-progress

sudo dpkg -i octodash.deb

rm octodash.deb

echo "Done. Restart your Raspberry Pi to start the newest version!"
