#!/bin/bash

octodash_url_prompt="What is the URL of your OctoDash installation? Be sure to include a trailing slash. If you don't know, push enter to accept the default."
octodash_url_default="http://localhost:5000/"

browser_launch_string="chromium-browser --kiosk --noerrdialogs --disable-infobars --no-first-run --enable-features=OverlayScrollbar --start-maximized" 
octoprint_suffix="plugin/octodash/"