#!/bin/bash

release = curl --silent "https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest" | jq -r '.assets[] | select(.name | endswith("armv7l.deb")).browser_download_url'
dependencies="xserver-xorg --no-install-recommends ratpoison x11-xserver-utils xinit libsecret-common libgnome-keyring-common libgnome-keyring0 libnotify4 libindicator3-7 libappindicator3-1 libdbusmenu-gtk3-4 libdbusmenu-glib4 libsecret-1-0 indicator-application indicator-common gir1.2-gnomekeyring-1.0"

echo "Installing OctoPrint Plugins"
~/OctoPrint/venv/bin/pip install "https://github.com/UnchartedBull/OctoPrint-DisplayLayerProgress/archive/master.zip"
~/OctoPrint/venv/bin/pip install "https://github.com/eyal0/OctoPrint-PrintTimeGenius/archive/master.zip"

echo "Installing Dependencies"
apt update
apt install $dependencies -y

cd ~

echo "Installing OctoDash"
wget -O octodash.deb $release

sudo dpkg -i octodash.deb

rm octodash.deb

echo "Setting up Autostart"
cat <<EOF > ~/.xinitrc
#!/bin/sh

xset s off
xset s noblank
xset -dpms

ratpoison&
octodash
EOF

cat <<EOF >> ~/.bashrc
if [ -z "$SSH_CLIENT" ] || [ -z "$SSH_TTY" ]; then
    xinit -- -nocursor
fi
EOF

echo "Setting Permission"
chmod +x ~/.xinitrc
chmod ug+s /usr/lib/xorg/Xorg

echo "Done. OctoDash will start automatically on next reboot."