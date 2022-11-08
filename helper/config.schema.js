const configSchema = {
  $schema: 'https://json-schema.org/draft/2019-09/schema',
  $id: 'octodash.schema',
  title: 'OctoDash Schema',
  type: 'object',
  required: [
    'customization',
    'printer',
    'screen',
    'preheatConfigurations',
    'filamentChange',
    'customActions',
    'backend',
  ],
  properties: {
    customization: {
      title: 'The customization Schema',
      type: 'object',
      required: [
        'turnOnPrinterWhenExitingSleep',
        'preferPreviewWhilePrinting',
        'previewProgressCircle',
        'showExtruderControl',
        'showNotificationCenterIcon',
        'fileSorting',
        'invertAxisControl',
      ],
      properties: {
        turnOnPrinterWhenExitingSleep: {
          title: 'The turnOnPrinterWhenExitingSleep Schema',
          type: 'boolean',
        },
        preferPreviewWhilePrinting: {
          title: 'The preferPreviewWhilePrinting Schema',
          type: 'boolean',
        },
        previewProgressCircle: {
          title: 'The previewProgressCircle Schema',
          type: 'boolean',
        },
        showExtruderControl: {
          title: 'The showExtruderControl Schema',
          type: 'boolean',
        },
        showNotificationCenterIcon: {
          title: 'The showNotificationCenterIcon Schema',
          type: 'boolean',
        },
        fileSorting: {
          title: 'The fileSorting Schema',
          type: 'object',
          required: ['attribute', 'order'],
          properties: {
            attribute: {
              title: 'The attribute Schema',
              type: 'string',
            },
            order: {
              title: 'The order Schema',
              type: 'string',
            },
          },
        },
        invertAxisControl: {
          title: 'The invertAxisControl Schema',
          type: 'object',
          required: ['x', 'y', 'z'],
          properties: {
            x: {
              title: 'The x Schema',
              type: 'boolean',
            },
            y: {
              title: 'The y Schema',
              type: 'boolean',
            },
            z: {
              title: 'The z Schema',
              type: 'boolean',
            },
          },
        },
      },
    },
    printer: {
      title: 'The printer Schema',
      type: 'object',
      required: ['name', 'xySpeed', 'zSpeed'],
      properties: {
        name: {
          title: 'The name Schema',
          type: 'string',
        },
        xySpeed: {
          title: 'The xySpeed Schema',
          type: 'integer',
        },
        zSpeed: {
          title: 'The zSpeed Schema',
          type: 'integer',
        },
      },
    },
    screen: {
      title: 'The screen Schema',
      type: 'object',
      required: ['touchscreen', 'turnOffWhileSleeping', 'sleepCommand', 'wakeupCommand'],
      properties: {
        touchscreen: {
          title: 'The touchscreen Schema',
          type: 'boolean',
        },
        turnOffWhileSleeping: {
          title: 'The turnOffWhileSleeping Schema',
          type: 'boolean',
        },
        sleepCommand: {
          title: 'The sleepCommand Schema',
          type: 'string',
        },
        wakeupCommand: {
          title: 'The wakeupCommand Schema',
          type: 'string',
        },
      },
    },
    preheatConfigurations: {
      title: 'The preheatConfigurations Schema',
      type: 'array',
      items: {
        title: 'A Schema',
        type: 'object',
        required: ['name', 'hotend', 'heatbed', 'fan'],
        properties: {
          name: {
            title: 'The name Schema',
            type: 'string',
          },
          hotend: {
            title: 'The hotend Schema',
            type: 'integer',
          },
          heatbed: {
            title: 'The heatbed Schema',
            type: 'integer',
          },
          fan: {
            title: 'The fan Schema',
            type: 'integer',
          },
        },
      },
    },
    filamentChange: {
      title: 'The filamentChange Schema',
      type: 'object',
      oneOf: [{ required: ['integrated'] }, { required: ['loadAndUnload'] }, { required: ['change'] }],
      properties: {
        integrated: {
          title: 'The integrated Schema',
          type: 'object',
          required: ['feedLength', 'feedSpeed', 'feedSpeedSlow', 'purgeDistance'],
          properties: {
            feedLength: {
              title: 'The feedLength Schema',
              type: 'integer',
            },
            feedSpeed: {
              title: 'The feedSpeed Schema',
              type: 'integer',
            },
            feedSpeedSlow: {
              title: 'The feedSpeedSlow Schema',
              type: 'integer',
            },
            purgeDistance: {
              title: 'The purgeDistance Schema',
              type: 'integer',
            },
          },
        },
        loadAndUnload: {
          title: 'The loadAndUnload Schema',
          type: 'object',
          required: ['unloadCommand', 'loadCommand'],
          properties: {
            unloadCommand: {
              title: 'The unloadCommand Schema',
              type: 'string',
            },
            loadCommand: {
              title: 'The loadCommand Schema',
              type: 'string',
            },
          },
        },
        change: {
          title: 'The change Schema',
          type: 'object',
          required: ['changeCommand'],
          properties: {
            changeCommand: {
              title: 'The changeCommand Schema',
              type: 'string',
            },
          },
        },
      },
    },
    customActions: {
      title: 'The customActions Schema',
      type: 'array',
      items: {
        title: 'A Schema',
        type: 'object',
        required: ['icon', 'command', 'color', 'confirm', 'exit'],
        properties: {
          icon: {
            title: 'The icon Schema',
            type: 'string',
          },
          command: {
            title: 'The command Schema',
            type: 'string',
          },
          color: {
            title: 'The color Schema',
            type: 'string',
          },
          confirm: {
            title: 'The confirm Schema',
            type: 'boolean',
          },
          exit: {
            title: 'The exit Schema',
            type: 'boolean',
          },
        },
      },
    },
    backend: {
      title: 'The backend Schema',
      type: 'object',
      required: ['type', 'url', 'accessToken', 'pollingInterval', 'commands'],
      properties: {
        type: {
          title: 'The type Schema',
          type: 'string',
        },
        url: {
          title: 'The url Schema',
          type: 'string',
        },
        accessToken: {
          title: 'The accessToken Schema',
          type: 'string',
        },
        pollingInterval: {
          title: 'The pollingInterval Schema',
          type: 'integer',
        },
        commands: {
          title: 'The commands Schema',
          type: 'object',
          required: ['disableExtruder', 'babystepZ'],
          properties: {
            disableExtruder: {
              title: 'The disableExtruder Schema',
              type: 'string',
            },
            babystepZ: {
              title: 'The babystepZ Schema',
              type: 'string',
            },
          },
        },
      },
    },
    octoprint: {
      title: 'The octoprint Schema',
      type: 'object',
      required: ['plugins'],
      properties: {
        plugins: {
          title: 'The plugins Schema',
          type: 'object',
          required: [
            'displayLayerProgress',
            'enclosure',
            'filamentManager',
            'spoolManager',
            'preheatButton',
            'printTimeGenius',
            'psuControl',
            'ophom',
            'tpLinkSmartPlug',
            'tasmota',
            'tasmotaMqtt',
          ],
          properties: {
            displayLayerProgress: {
              title: 'The displayLayerProgress Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            enclosure: {
              title: 'The enclosure Schema',
              type: 'object',
              required: ['enabled', 'ambientSensorID', 'filament1SensorID', 'filament2SensorID'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
                ambientSensorID: {
                  title: 'The ambientSensorID Schema',
                  type: 'null',
                },
                filament1SensorID: {
                  title: 'The filament1SensorID Schema',
                  type: 'null',
                },
                filament2SensorID: {
                  title: 'The filament2SensorID Schema',
                  type: 'null',
                },
              },
            },
            filamentManager: {
              title: 'The filamentManager Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            spoolManager: {
              title: 'The spoolManager Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            preheatButton: {
              title: 'The preheatButton Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            printTimeGenius: {
              title: 'The printTimeGenius Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            psuControl: {
              title: 'The psuControl Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            ophom: {
              title: 'The ophom Schema',
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
              },
            },
            tpLinkSmartPlug: {
              title: 'The tpLinkSmartPlug Schema',
              type: 'object',
              required: ['enabled', 'smartPlugIP'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
                smartPlugIP: {
                  title: 'The smartPlugIP Schema',
                  type: 'string',
                },
              },
            },
            tasmota: {
              title: 'The tasmota Schema',
              type: 'object',
              required: ['enabled', 'ip', 'index'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
                ip: {
                  title: 'The ip Schema',
                  type: 'string',
                },
                index: {
                  title: 'The index Schema',
                  type: 'null',
                },
              },
            },
            tasmotaMqtt: {
              title: 'The tasmotaMqtt Schema',
              type: 'object',
              required: ['enabled', 'topic', 'relayNumber'],
              properties: {
                enabled: {
                  title: 'The enabled Schema',
                  type: 'boolean',
                },
                topic: {
                  title: 'The topic Schema',
                  type: 'string',
                },
                relayNumber: {
                  title: 'The relayNumber Schema',
                  type: 'null',
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = configSchema;
