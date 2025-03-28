# coding=utf-8
from __future__ import absolute_import

from flask import make_response

### (Don't forget to remove me)
# This is a basic skeleton for your plugin's __init__.py. You probably want to adjust the class name of your plugin
# as well as the plugin mixins it's subclassing from. This is really just a basic skeleton to get you started,
# defining your plugin as a template plugin, settings and asset plugin. Feel free to add or remove mixins
# as necessary.
#
# Take a look at the documentation on what other plugin mixins are available.

import octoprint.plugin


html = """
<!doctype html>
<html lang="en" dir="ltr" data-critters-container>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OctoDash</title>
    <base href="./">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
  <style>html{--mat-ripple-color:rgba(255, 255, 255, .1)}html{--mat-option-selected-state-label-text-color:#3f51b5;--mat-option-label-text-color:white;--mat-option-hover-state-layer-color:rgba(255, 255, 255, .08);--mat-option-focus-state-layer-color:rgba(255, 255, 255, .08);--mat-option-selected-state-layer-color:rgba(255, 255, 255, .08)}html{--mat-optgroup-label-text-color:white}html{--mat-full-pseudo-checkbox-selected-icon-color:#ff4081;--mat-full-pseudo-checkbox-selected-checkmark-color:#303030;--mat-full-pseudo-checkbox-unselected-icon-color:rgba(255, 255, 255, .7);--mat-full-pseudo-checkbox-disabled-selected-checkmark-color:#303030;--mat-full-pseudo-checkbox-disabled-unselected-icon-color:#686868;--mat-full-pseudo-checkbox-disabled-selected-icon-color:#686868;--mat-minimal-pseudo-checkbox-selected-checkmark-color:#ff4081;--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color:#686868}html{--mat-app-background-color:#303030;--mat-app-text-color:white}html{--mat-option-label-text-font:Roboto, sans-serif;--mat-option-label-text-line-height:24px;--mat-option-label-text-size:16px;--mat-option-label-text-tracking:.03125em;--mat-option-label-text-weight:400}html{--mat-optgroup-label-text-font:Roboto, sans-serif;--mat-optgroup-label-text-line-height:24px;--mat-optgroup-label-text-size:16px;--mat-optgroup-label-text-tracking:.03125em;--mat-optgroup-label-text-weight:400}@font-face{font-family:Montserrat;font-weight:400;src:url(Montserrat-Regular.09cae4fd24e6bfa5.ttf) format("truetype")}@font-face{font-family:Montserrat;font-weight:500;src:url(Montserrat-Medium.50ba2624ff93733b.ttf) format("truetype")}*:not(path):not(svg){font-family:Montserrat,sans-serif;color:#f5f6fa;font-size:4.3vw;margin:0;padding:0;overflow:hidden}*,*:after,*:before{-webkit-user-select:none;-webkit-user-drag:none;-webkit-app-region:no-drag;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;user-select:none;cursor:default}html,body,.app-root{width:100%;height:100%;padding:0}body{display:block;margin-left:0;margin-top:0}app-root{display:block;background-color:#353b48;padding:.9vh .9vw;overflow:hidden}.splash-screen__icon{height:50vh;margin-top:20vh;margin-left:auto;margin-right:auto;display:block}.splash-screen__credits{display:block;font-size:1.8vw;text-align:center;opacity:.8;margin-top:6vh}html,body,span,img{margin:0;padding:0;border:0;font:inherit;vertical-align:baseline}body{line-height:1.2}span:focus,img:focus{outline:0}</style><link rel="stylesheet" href="styles.394a2f02f43a91b2.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="/plugin/octodash/static/styles.394a2f02f43a91b2.css"></noscript></head>

  <body lang="en-US">
    <app-root class="app-root">
      <img src="/plugin/octodash/static/assets/icon/icon-main-title.svg" class="splash-screen__icon">
      <span class="splash-screen__credits">by UnchartedBull</span>
    </app-root>
  <script src="/plugin/octodash/static/runtime.409cea6e2e64252f.js" type="module"></script><script src="/plugin/octodash/static/polyfills.9051428c3a252b62.js" type="module"></script><script src="/plugin/octodash/static/main.93879358aec29d77.js" type="module"></script></body>
</html>
"""


class OctodashPlugin(
    octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.UiPlugin,
    octoprint.plugin.TemplatePlugin,
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

    ##~~ AssetPlugin mixin

    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        # core UI here.
        return {
            "js": [
                "runtime.409cea6e2e64252f.js",
                "polyfills.9051428c3a252b62.js",
                "main.93879358aec29d77.js",
            ],
            "css": ["css/octodash.css"],
            "less": [],
        }

    def will_handle_ui(self, request):
        if request.args.get("octodash") == "1":
            return True

    def on_ui_render(self, now, request, render_kwargs):
        response = make_response(html)
        response.headers["Content-Type"] = "text/html"
        return response

    def get_ui_permissions(self):
        return []

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
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
