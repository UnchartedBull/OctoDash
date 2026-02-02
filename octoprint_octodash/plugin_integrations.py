## These contain information about the various plugins
## That OctoDash can integrate with. The keys are the `plugin_identifier`
## and `settingsKey` is how they are stored in the OctoDash config

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

ALL_PLUGINS = {**POWER_PLUGINS, **SINGLE_PLUGINS, **FILAMENT_PLUGINS}