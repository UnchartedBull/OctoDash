## These contain information about the various plugins
## That OctoDash can integrate with. The keys are the `plugin_identifier`
## and `settingsKey` is how they are stored in the OctoDash config

POWER_PLUGINS = {
    'psucontrol': {
        'legacySettingsKey': 'psuControl',
        'requiresConfig': False,
    },
    'ophom': {
        'legacySettingsKey': 'ophom',
        'requiresConfig': False,
    },
    'tplinksmartplug': {
        'legacySettingsKey': 'tpLinkSmartPlug',
        'requiresConfig': True,
    },
    'tuyasmartplug': {
        'legacySettingsKey': 'tuya',
        'requiresConfig': False,
    },
    'tasmota': {
        'legacySettingsKey': 'tasmota',
        'requiresConfig': True,
    },
    'tasmota_mqtt': {
        'legacySettingsKey': 'tasmotaMqtt',
        'requiresConfig': True,
    },
    'wemo': {
        'legacySettingsKey': 'wemo',
        'requiresConfig': True,
    },
}

SINGLE_PLUGINS = {
    'DisplayLayerProgress': {
        'legacySettingsKey': 'displayLayerProgress',
        'requiresConfig': False
    },
    'preheat': {
        'legacySettingsKey': 'preheatButton',
        'requiresConfig': False
    },
    'enclosure': {
        'legacySettingsKey': 'enclosure',
        'requiresConfig': True,
    },
}

FILAMENT_PLUGINS = {
    'Spoolman': {
        'legacySettingsKey': 'spoolman',
        'requiresConfig': False,
    },
    'SpoolManager': {
        'legacySettingsKey': 'spoolManager',
        'requiresConfig': False,
    },
    'filamentmanager': {
        'legacySettingsKey': 'filamentManager',
        'requiresConfig': False,
    }
}

ALL_PLUGINS = {**POWER_PLUGINS, **SINGLE_PLUGINS, **FILAMENT_PLUGINS}