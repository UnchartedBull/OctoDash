#!/bin/bash

arch=$(uname -m)
if [[ $arch == x86_64 ]]; then
    releaseURL=$(curl -s "https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest" | grep "browser_download_url.*amd64.deb" | cut -d '"' -f 4)
elif [[ $arch == aarch64 ]]; then
    releaseURL=$(curl -s "https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest" | grep "browser_download_url.*arm64.deb" | cut -d '"' -f 4)
elif  [[ $arch == arm* ]]; then
    releaseURL=$(curl -s "https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest" | grep "browser_download_url.*armv7l.deb" | cut -d '"' -f 4)
fi

echo "Updating OctoDash"

cd ~

wget -O octodash.deb $releaseURL -q --show-progress

sudo dpkg -i octodash.deb

rm octodash.deb

echo "Done. Restart your Raspberry Pi to start the newest version!"
