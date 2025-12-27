# coding=utf-8
"""
OctoDash Plugin for OctoPrint

Some bits (noted below) are taken from the OctoDash Companion plugin which is available under the MIT license
See https://github.com/jneilliii/OctoPrint-OctoDashCompanion/blob/142652a3c2eccfa1bd2f459447caec31f29deb4c/octoprint_octodashcompanion/__init__.py
"""
from __future__ import absolute_import
import subprocess
import re
from importlib import resources
import shutil

from flask import make_response, send_file, request
from flask import redirect, Response
import os.path

import json

import flask
import octoprint.plugin
from octoprint.access.permissions import Permissions
from octoprint.filemanager import FileDestinations
from octoprint.util.paths import normalize
from octoprint.events import Events

LANGUAGES = ["en", "fr", "de", "da"]
DEFAULT_LANGUAGE = "en"

POWER_PLUGINS = {
    'psucontrol': {
        'settingsKey': 'psuControl',
        'requiresConfig': False,
    },
    'ophom': {
        'settingsKey': 'ophom',
        'requiresConfig': False,
    },
    'tplinksmartplug': {
        'settingsKey': 'tpLinkSmartPlug',
        'requiresConfig': True,
    },
    'tuyasmartplug': {
        'settingsKey': 'tuya',
        'requiresConfig': False,
    },
    'tasmota': {
        'settingsKey': 'tasmota',
        'requiresConfig': True,
    },
    'tasmota_mqtt': {
        'settingsKey': 'tasmotaMqtt',
        'requiresConfig': True,
    },
    'wemo': {
        'settingsKey': 'wemo',
        'requiresConfig': True,
    },
}

SINGLE_PLUGINS = {
    'DisplayLayerProgress': {
        'settingsKey': 'displayLayerProgress',
        'requiresConfig': False
    },
    'preheat': {
        'settingsKey': 'preheatButton',
        'requiresConfig': False
    },
    'PrintTimeGenius': {
        'settingsKey': 'printTimeGenius',
        'requiresConfig': False
    },
    'enclosure': {
        'settingsKey': 'enclosure',
        'requiresConfig': True,
    },
}

FILAMENT_PLUGINS = {
    'Spoolman': {
        'settingsKey': 'spoolman',
        'requiresConfig': False,
    },
    'SpoolManager': {
        'settingsKey': 'spoolManager',
        'requiresConfig': False,
    },
    'filamentmanager': {
        'settingsKey': 'filamentManager',
        'requiresConfig': False,
    }
}


class OctodashPlugin(
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.UiPlugin,
    octoprint.plugin.SettingsPlugin,
    octoprint.plugin.EventHandlerPlugin,
    octoprint.plugin.BlueprintPlugin,
    octoprint.plugin.WizardPlugin,
    octoprint.plugin.TemplatePlugin,
):

    def __init__(self):
        # These two lines from OctoDash Companion
        self.use_received_fan_speeds = False
        self.fan_regex = re.compile("M106 (?:P([0-9]) )?S([0-9]+)")


    def _is_plugin_enabled(self, plugin, plugin_name):
        manager = octoprint.plugin.plugin_manager()
        if plugin["enabled"] is False:
            return plugin
        enabled =  plugin_name in manager.enabled_plugins
        plugin["enabled"] = enabled
        return plugin


    def _throw():
        raise Exception("Intentional Exception for testing")

    #~~ SettingsPlugin mixin

    def on_settings_load(self):
        manager = octoprint.plugin.plugin_manager()
        installed = set(manager.enabled_plugins.keys())

        all_plugins = dict()
        all_plugins.update(POWER_PLUGINS)
        all_plugins.update(SINGLE_PLUGINS)
        all_plugins.update(FILAMENT_PLUGINS)
        data = octoprint.plugin.SettingsPlugin.on_settings_load(self)

        for plugin_name, plugin_info in all_plugins.items():
            if not plugin_name in installed:
                data["plugins"][plugin_info["settingsKey"]]["enabled"] = False

        return data

    # def get_settings_preprocessors(self):
    #     manager = octoprint.plugin.plugin_manager()
    #     installed = set(manager.enabled_plugins.keys())

    #     getters = {}
    #     setters = {}


        # all_plugins = {}
        # all_plugins.update(POWER_PLUGINS)
        # all_plugins.update(SINGLE_PLUGINS)
        # all_plugins.update(FILAMENT_PLUGINS)
        
    #     plugin_getters = {
    #         "displayLayerProgress": lambda plugin: self._is_plugin_enabled(plugin, "DisplayLayerProgress")
    #     }


    #     # for plugin_name, plugin_info in all_plugins.items():
    #     #     plugin_getters[plugin_info["settingsKey"]] = lambda plugin: self._is_plugin_enabled(plugin, plugin_name)

    #     getters["plugins"] = plugin_getters


    #     return {"printer": lambda x: "foo"}, setters

    def on_settings_migrate(self, target, current):
        self._set_initial_plugins()

    def get_settings_version(self):
        return 1

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
                "spoolman": {"enabled": False},
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
                "screenSleepDelay": 300,
                "turnOnPrinterWhenExitingSleep": False,
                "preferPreviewWhilePrinting": False,
                "previewProgressCircle": False,
                "screenSleepCommand": "DISPLAY=:0.0 xset dpms force standby",
                "screenWakeupCommand": "DISPLAY=:0.0 xset s off && DISPLAY=:0.0 xset -dpms && DISPLAY=:0.0 xset s noblank",
                "showExtruderControl": True,
                "showNotificationCenterIcon": True,
                "defaultDirectory": "/",
                "language": None,
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



    ##~ EventHandler Mixin

    def on_event(self, event, payload):
        """
        Handle upload of custom-styles.css to move it to plugin data folder

        From the OctoDash Companion
        """
        if event == Events.UPLOAD:
            #TODO: Better error handling and notifications
            if payload["target"] == "local" and payload["path"] == "custom-styles.css":
                source_file = self._file_manager.sanitize_path(FileDestinations.LOCAL, payload["path"])
                destination_file = normalize("{}/custom-styles.css".format(self.get_plugin_data_folder()))
                self._logger.debug("attempting copy of {} to {}".format(source_file, destination_file))
                shutil.copyfile(source_file, destination_file)
                self._logger.debug("attempting removal of {}".format(source_file))
                self._file_manager.remove_file(FileDestinations.LOCAL, payload["path"])
    
    # ~~ extension_tree hook

    def get_extension_tree(self, *args, **kwargs):
        """
        Indicate that OctoPrint should allow upload of extra file types

        From OctoDash Companion
        """
        return dict(
            machinecode=dict(
                octodashcompanion=["css"]
            )
        )

    ##~~ AssetPlugin mixin
    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        # core UI here.
        return {
            "js": [
                "vendor/js/jquery-ui.min.js",
                "vendor/js/knockout-sortable.1.2.0.js",
                "vendor/js/fontawesome-iconpicker.min.js",
                "vendor/js/ko.iconpicker.js",
                'js/octodash-icons.js',
                'js/octodash.js',
                'js/octodash_wizard.js',
            ],
            "css": [
                "vendor/css/fontawesome-iconpicker.min.css",
            ],
            "less": ['less/wizard.less', 'less/settings.less'],
        }

    
    # ~~ BlueprintPlugin

    @octoprint.plugin.BlueprintPlugin.route("/custom-styles.css")
    @octoprint.plugin.BlueprintPlugin.csrf_exempt()
    def get_custom_styles(self):
        if not os.path.exists(normalize("{}/custom-styles.css".format(self.get_plugin_data_folder()))):
            #TODO: Better message, maybe reference docs
            message = "/* Upload a file called `custom-styles.css` and it will get used here by OctoDash */"
            return Response(message, mimetype="text/css")
        return send_file(normalize("{}/custom-styles.css".format(self.get_plugin_data_folder())))

    def is_blueprint_protected(self):
        return False

    @octoprint.plugin.BlueprintPlugin.route("/", defaults={"path": ""}, methods=["GET"])
    @octoprint.plugin.BlueprintPlugin.route("/<path>", methods=["GET"])
    def get_ui_root(self, path):
        return send_file(self._get_index_path())

    @octoprint.plugin.BlueprintPlugin.route("/api/copy_script", methods=["POST"])
    def copy_script(self):
        try:
            self._create_management_script()
            return make_response(json.dumps({"success": True}), 200)
        except Exception as e:
            self._logger.exception("Error copying management script")
            return make_response(json.dumps({"error": str(e)}), 500)

    @octoprint.plugin.BlueprintPlugin.route("/api/migrate", methods=["POST"])
    @Permissions.ADMIN.require(403)
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

    @octoprint.plugin.BlueprintPlugin.route("/api/screen_sleep", methods=["POST"])
    @Permissions.ADMIN.require(403)
    def set_screen_sleep(self):
        command = self._settings.get(['octodash', 'screenSleepCommand'])
        try:
            subprocess.run(command, shell=True, check=True, timeout=10)
        except subprocess.TimeoutExpired:
            self._logger.error("Screen sleep command timed out")
            return make_response(json.dumps({"error": "Command timed out"}), 500)
        except Exception as e:
            self._logger.error(f"Error calling screen sleep command: {e}")
            return make_response(json.dumps({"error": "Error calling screen sleep command"}), 500)
        return make_response(json.dumps({"success": True}), 200)

    @octoprint.plugin.BlueprintPlugin.route("/api/screen_wakeup", methods=["POST"])
    @Permissions.ADMIN.require(403)
    def set_screen_wakeup(self):
        command = self._settings.get(['octodash', 'screenWakeupCommand'])
        try:
            subprocess.run(command, shell=True, check=True, timeout=10)
        except subprocess.TimeoutExpired:
            self._logger.error("Screen wakeup command timed out")
            return make_response(json.dumps({"error": "Command timed out"}), 500)
        except Exception as e:
            self._logger.error(f"Error getting screen wakeup command: {e}")
            return make_response(json.dumps({"error": "Error getting screen wakeup command"}), 500)

        return make_response(json.dumps({"success": True}), 200)

    @Permissions.WEBCAM.require(403)
    @octoprint.plugin.BlueprintPlugin.route("webcam")
    def webcam_route(self):
        webcam_url = self._settings.global_get(["webcam", "stream"])

        # Anything passed here can be used as {{ variable_name }} in the template
        render_kwargs = {
            "webcam_url": webcam_url
        }

        if self._settings.global_get(["plugins", "multicam"]) and "webcam" in flask.request.values:
            webcam = self._settings.global_get(["plugins", "multicam", "multicam_profiles"])[
                int(flask.request.values["webcam"]) - 1]
            render_kwargs["webcam_url"] = webcam["URL"]
            if webcam["flipH"]:
                render_kwargs["webcam_flip_horizontal"] = "flipH"
            if webcam["flipV"]:
                render_kwargs["webcam_flip_vertical"] = "flipV"
            if webcam["rotate90"]:
                render_kwargs["webcam_rotate_ccw"] = "rotate90"
        else:
            if self._settings.global_get_boolean(["webcam", "flipH"]):
                render_kwargs["webcam_flip_horizontal"] = "flipH"
            if self._settings.global_get_boolean(["webcam", "flipV"]):
                render_kwargs["webcam_flip_vertical"] = "flipV"
            if self._settings.global_get_boolean(["webcam", "rotate90"]):
                render_kwargs["webcam_rotate_ccw"] = "rotate90"
            if self._settings.global_get(["plugins", "multicam"]):
                render_kwargs["webcams"] = self._settings.global_get(["plugins", "multicam", "multicam_profiles"])

        response = flask.make_response(flask.render_template("plugin_octodash/webcam.jinja2", **render_kwargs))
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        return response



    def is_blueprint_csrf_protected(self):
        return False

    def is_blueprint_protected(self):
        return False

    def get_blueprint_api_prefixes(self):
        return ['api']

    def _get_language(self):
        language = self._settings.get(["octodash", "language"])
        if language is not None:
            return language

        global_language = self._settings.global_get(["appearance", "defaultLanguage"])
        if global_language in LANGUAGES:
            return global_language
        return DEFAULT_LANGUAGE

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
        
        return os.path.join(self._basefolder, "static", "ui", self._get_language(), "index.html")

    ##~~ UiPlugin mixin

    def will_handle_ui(self, request):
        if request.args.get("octodash") == "1":
            return True

    def on_ui_render(self, now, request, render_kwargs):
        return redirect("/plugin/octodash/", code=307)

    def get_ui_permissions(self):
        return []

    def is_wizard_required(self):
        return True

    def get_wizard_details(self):
        details = {
            "legacyConfigs": self._find_legacy_config(),
            "plugins": self._find_available_plugins(),
        }
        self._logger.info(f"Returning wizard details: {details}")
        return details

    def get_wizard_version(self):
        return 1

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

    def _set_initial_plugins(self):
        manager = octoprint.plugin.plugin_manager()
        installed = set(manager.enabled_plugins.keys())
        filament = installed.intersection(FILAMENT_PLUGINS.keys())
        
        if len(filament) == 1:
            settingskey = FILAMENT_PLUGINS[filament.pop()]["settingsKey"]
            self._settings.set_boolean(['plugins', settingskey, 'enabled'], True)

        power = installed.intersection(POWER_PLUGINS.keys())

        if len(power) == 1:
            plugin_details = POWER_PLUGINS[power.pop()]
            settingskey = plugin_details['settingsKey']
            if not plugin_details['requiresConfig']:
                self._settings.set_boolean(['plugins', settingskey, 'enabled'], True)

    def _find_available_plugins(self):
        return dict()
        # manager = octoprint.plugin.plugin_manager()
        # installed = set(manager.enabled_plugins.keys())
        # power = installed.intersection(POWER_PLUGINS.keys())
        # singles = installed.intersection(SINGLE_PLUGINS.keys())
        # filament = installed.intersection(FILAMENT_PLUGINS.keys())
        # return dict(power=list(power), singles=list(singles), filament=list(filament))

    def _create_management_script(self):
        with resources.path("octoprint_octodash", "scripts", "manage-octodash.sh") as script_path:
            # copy the script to the appropriate location
            target_path = os.path.expanduser(os.path.join("~", "manage-octodash.sh"))
            shutil.copy(script_path, target_path)

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
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information,
        "octoprint.filemanager.extension_tree": __plugin_implementation__.get_extension_tree,
    }
