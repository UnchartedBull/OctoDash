#!/bin/bash

release=$(curl -s "https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest" | grep "browser_download_url.*armv7l.deb" | cut -d '"' -f 4)

echo "Updating OctoDash"

cd ~

wget -O octodash.deb $release -q --show-progress

sudo dpkg -i octodash.deb

rm octodash.deb

echo "Done. Restart your Raspberry Pi to start the newest version!"
