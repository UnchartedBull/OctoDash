release = curl --silent "https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest" | jq -r '.assets[] | select(.name | endswith("armv7l.deb")).browser_download_url'

echo "Updating OctoDash"

cd ~

wget -O octodash.deb $release

sudo dpkg -i octodash.deb

rm octodash.deb

echo "Done. Restart your Raspberry Pi to start the newest version!"