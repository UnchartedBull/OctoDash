# coding=utf-8
"""
OctoDash Plugin for OctoPrint

Some bits (noted below) are taken from the OctoDash Companion plugin which is available under the MIT license
See https://github.com/jneilliii/OctoPrint-OctoDashCompanion/blob/142652a3c2eccfa1bd2f459447caec31f29deb4c/octoprint_octodashcompanion/__init__.py
"""
from __future__ import absolute_import
import re

from flask import make_response, send_file, redirect, request
import os.path

import json

import octoprint.plugin




class OctodashPlugin(
    octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.UiPlugin,
    octoprint.plugin.TemplatePlugin,
    octoprint.plugin.StartupPlugin,
    octoprint.plugin.BlueprintPlugin,
    octoprint.plugin.WizardPlugin,
):

    def __init__(self):
        # These two lines from OctoDash Companion
        self.use_received_fan_speeds = False
        self.fan_regex = re.compile("M106 (?:P([0-9]) )?S([0-9]+)")

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            "printer": {
                "name": "",
                "xySpeed": 150,
                "zSpeed": 5,
                "disableExtruderGCode": "M18 E",
                "zBabystepGCode": "M290 Z",
                "defaultTemperatureFanSpeed": {
                    "hotend": 220,
                    "heatbed": 70,
                    "fan": 100,
                },
            },
            "filament": {
                "density": 1.25,
                "thickness": 1.75,
                "feedLength": 0,
                "feedSpeed": 20,
                "feedSpeedSlow": 3,
                "purgeDistance": 30,
                "useM600": False,
            },
            "plugins": {
                "companion": {"enabled": True},
                "displayLayerProgress": {"enabled": True},
                "enclosure": {
                    "enabled": True,
                    "ambientSensorID": None,
                    "filament1SensorID": None,
                    "filament2SensorID": None,
                },
                "filamentManager": {"enabled": False},
                "spoolManager": {"enabled": False},
                "preheatButton": {"enabled": True},
                "printTimeGenius": {"enabled": True},
                "psuControl": {"enabled": False},
                "ophom": {"enabled": False},
                "tpLinkSmartPlug": {"enabled": False, "smartPlugIP": "127.0.0.1"},
                "tasmota": {"enabled": False, "ip": "127.0.0.1", "index": None},
                "tasmotaMqtt": {
                    "enabled": False,
                    "topic": "topic",
                    "relayNumber": None,
                },
                "tuya": {"enabled": False, "label": "label"},
                "wemo": {"enabled": False, "ip": "127.0.0.1", "port": 49152},
            },
            "octodash": {
                "customActions": [
                    {
                        "icon": "house",
                        "command": "G28",
                        "color": "#dcdde1",
                        "confirm": False,
                        "exit": True,
                    },
                    {
                        "icon": "ruler-vertical",
                        "command": "G29",
                        "color": "#4bae50",
                        "confirm": False,
                        "exit": True,
                    },
                    {
                        "icon": "fire-flame-curved",
                        "command": "M140 S50; M104 S185",
                        "color": "#e1b12c",
                        "confirm": False,
                        "exit": True,
                    },
                    {
                        "icon": "snowflake",
                        "command": "M140 S0; M104 S0",
                        "color": "#0097e6",
                        "confirm": False,
                        "exit": True,
                    },
                    {
                        "icon": "rotate-right",
                        "command": "[!RELOAD]",
                        "color": "#7f8fa6",
                        "confirm": True,
                        "exit": False,
                    },
                    {
                        "icon": "power-off",
                        "command": "[!SHUTDOWN]",
                        "color": "#e84118",
                        "confirm": True,
                        "exit": False,
                    },
                ],
                "fileSorting": {"attribute": "name", "order": "asc"},
                "invertAxisControl": {"x": False, "y": False, "z": False},
                "pollingInterval": 2000,
                "touchscreen": True,
                "turnScreenOffWhileSleeping": False,
                "turnOnPrinterWhenExitingSleep": False,
                "preferPreviewWhilePrinting": False,
                "previewProgressCircle": False,
                "screenSleepCommand": "xset dpms force standby",
                "screenWakeupCommand": "xset s off && xset -dpms && xset s noblank",
                "showExtruderControl": True,
                "showNotificationCenterIcon": True,
                "defaultDirectory": "/",
            },
        }

    # ~~ GCode Received hook

    # From OctoDash Companion
    def process_received_gcode(self, comm, line, *args, **kwargs):
        if "M106" not in line:
            return line
    
        self.send_fan_speed(line, "received")
        return line

    # ~~ GCode Sent hook

    # From OctoDash Companion
    def process_sent_gcode(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
        if gcode and gcode == "M106" and self.use_received_fan_speeds is False:
            self.send_fan_speed(cmd, "sent")

    # From OctoDash Companion
    def send_fan_speed(self, gcode, direction):
        fan_match = self.fan_regex.match(gcode)
        if fan_match:
            if direction == "received":
                self.use_received_fan_speeds = True
            fan, fan_set_speed = fan_match.groups()
            if fan is None:
                fan = 1
            self._plugin_manager.send_plugin_message("octodash", {
                "fanspeed": {"{}".format(fan): (int("{}".format(fan_set_speed)) / 255 * 100)}})


    ##~~ AssetPlugin mixin

    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        # core UI here.
        return {
            "js": ['js/octodash.js'],
            "css": [],
            "less": ['less/wizard.less'],
        }

    def will_handle_ui(self, request):
        if request.args.get("octodash") == "1":
            return True

    def on_ui_render(self, now, request, render_kwargs):
        return redirect("/plugin/octodash/", code=307)
    

    #TODO: Auth and CSRF stuff
    @octoprint.plugin.BlueprintPlugin.route("/api/migrate", methods=["POST"])
    def migrate_legacy_config(self):
        #TODO: Don't blindly use the path from the request
        data = request.json
        if not data or "path" not in data:
            return make_response(json.dumps({"error": "Path not provided"}), 400)

        path = data["path"]
        if not os.path.exists(path):
            return make_response(json.dumps({"error": "File does not exist"}), 404)

        try:
            legacy_config = self._migrate_legacy_config(path)
            return make_response(json.dumps({"success": True, "config": legacy_config}), 200)
        except Exception as e:
            return make_response(json.dumps({"error": str(e)}), 500)

    @octoprint.plugin.BlueprintPlugin.route("/", defaults={"path": ""}, methods=["GET"])
    @octoprint.plugin.BlueprintPlugin.route("/<path>", methods=["GET"])
    def get_ui_root(self, path):
        return send_file(self._get_index_path())

    def is_blueprint_csrf_protected(self):
        return False

    def is_blueprint_protected(self):
        return False

    def get_blueprint_api_prefixes(self):
        return ['api']

    def _get_index_path(self):
        """Return the path on the filesystem to the index.html file to be used for
        index.html. This needs to take into account the configured language and 
        whether the UI build was dev or production.
        """

        # Check if the UI is in dev mode
        devpath = os.path.join(self._basefolder, "static", "ui", "index.html")
        if os.path.exists(devpath):
            # Dev mode
            return devpath
        
        #TODO: Read the language from config
        return os.path.join(self._basefolder, "static", "ui", "en", "index.html")

    def get_ui_permissions(self):
        return []

    def is_wizard_required(self):
        return True

    def get_wizard_details(self):
        details = {
            "legacyConfigs": self._find_legacy_config(),
            "legacyInstalled": self._is_legacy_installed(),
        }
        self._logger.info(f"Returning wizard details: {details}")
        return details

    ##~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
        # for details.
        return {
            "octodash": {
                "displayName": "Octodash Plugin",
                "displayVersion": self._plugin_version,
                # version check: github repository
                "type": "github_release",
                "user": "hillshum",
                "repo": "OctoPrint-Octodash",
                "current": self._plugin_version,
                # update method: pip
                "pip": "https://github.com/hillshum/OctoPrint-Octodash/archive/{target_version}.zip",
            }
        }

    def _is_legacy_installed(self):
        # with open(os.path.join("~", ".xinitrc")) as f:
        #     for line in f:
        #         if "octodash" in line:
        #             return True
        return False

    def _find_legacy_config(self):
        paths = [
            '~/.config/octodash/config.json',
            '/home/pi/.config/octodash/config.json',
            '~/Library/Application Support/octodash/config.json'
        ]
        expanded = [os.path.expanduser(p) for p in paths]

        return [{"path": p, "exists":  os.path.exists(p)} for p in expanded]



    def _migrate_legacy_config(self, path):
        with open(path, 'r') as f:
            conf = json.load(f)["config"]
            # merge with the existing settings
            settings = self._settings
            for key in ['printer', 'filament', 'plugins', 'octodash']:
                settings.set([key], conf[key])
            settings.save()






# If you want your plugin to be registered within OctoPrint under a different name than what you defined in setup.py
# ("OctoPrint-PluginSkeleton"), you may define that here. Same goes for the other metadata derived from setup.py that
# can be overwritten via __plugin_xyz__ control properties. See the documentation for that.
__plugin_name__ = "Octodash Plugin"


# Set the Python version your plugin is compatible with below. Recommended is Python 3 only for all new plugins.
# OctoPrint 1.4.0 - 1.7.x run under both Python 3 and the end-of-life Python 2.
# OctoPrint 1.8.0 onwards only supports Python 3.
__plugin_pythoncompat__ = ">=3,<4"  # Only Python 3


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = OctodashPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.comm.protocol.gcode.received": __plugin_implementation__.process_received_gcode,
        "octoprint.comm.protocol.gcode.sent": __plugin_implementation__.process_sent_gcode,
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
