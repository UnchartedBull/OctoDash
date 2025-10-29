# coding=utf-8
from __future__ import absolute_import

from flask import make_response

import octoprint.plugin


class OctodashPlugin(
    octoprint.plugin.SettingsPlugin,
):

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            "octoprint": {
                "accessToken": "1t9H6i51hQLMm2eZXGAPbvRLv4iJr2Yao_LoxhE_66E",
                "url": "http://localhost:8080/",
            },
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
                "user": "UnchartedBull",
                "repo": "Octodash",
                "current": self._plugin_version,
                # update method: pip
                "pip": "https://github.com/UnchartedBull/Octodash/archive/{target_version}.zip",
            }
        }


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
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
