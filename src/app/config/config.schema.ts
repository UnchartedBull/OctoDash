export const configSchema = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://example.com/root.json',
  type: 'object',
  required: ['octoprint', 'printer', 'filament', 'plugins', 'octodash'],
  properties: {
    octoprint: {
      $id: '#/properties/octoprint',
      type: 'object',
      required: ['accessToken', 'url'],
      properties: {
        accessToken: {
          $id: '#/properties/octoprint/properties/accessToken',
          type: 'string',
          pattern: '^(.*)$',
        },
        url: {
          $id: '#/properties/octoprint/properties/url',
          type: 'string',
          pattern: '^(.*)$',
        },
      },
    },
    printer: {
      $id: '#/properties/printer',
      type: 'object',
      required: ['name', 'xySpeed', 'zSpeed', 'zBabystepGCode', 'defaultTemperatureFanSpeed'],
      properties: {
        name: {
          $id: '#/properties/printer/properties/name',
          type: 'string',
          pattern: '^(.*)$',
        },
        xySpeed: {
          $id: '#/properties/printer/properties/xySpeed',
          type: 'integer',
        },
        zSpeed: {
          $id: '#/properties/printer/properties/zSpeed',
          type: 'integer',
        },
        zBabystepGCode: {
          $id: '#/properties/printer/properties/zBabystepGCode',
          type: 'string',
          pattern: '^(.*)$',
        },
        defaultTemperatureFanSpeed: {
          $id: '#/properties/printer/properties/defaultTemperatureFanSpeed',
          type: 'object',
          required: ['hotend', 'heatbed', 'fan'],
          properties: {
            hotend: {
              $id: '#/properties/printer/properties/defaultTemperatureFanSpeed/hotend',
              type: 'integer',
            },
            heatbed: {
              $id: '#/properties/printer/properties/defaultTemperatureFanSpeed/heatbed',
              type: 'integer',
            },
            fan: {
              $id: '#/properties/printer/properties/defaultTemperatureFanSpeed/fan',
              type: 'integer',
            },
          },
        },
      },
    },
    filament: {
      $id: '#/properties/filament',
      type: 'object',
      required: ['density', 'thickness', 'feedLength', 'feedSpeed', 'feedSpeedSlow', 'purgeDistance', 'useM600'],
      properties: {
        density: {
          $id: '#/properties/filament/properties/density',
          type: 'number',
        },
        thickness: {
          $id: '#/properties/filament/properties/thickness',
          type: 'number',
        },
        feedLength: {
          $id: '#/properties/filament/properties/feedLength',
          type: 'integer',
        },
        feedSpeed: {
          $id: '#/properties/filament/properties/feedSpeed',
          type: 'number',
        },
        feedSpeedSlow: {
          $id: '#/properties/filament/properties/feedSpeedSlow',
          type: 'number',
        },
        purgeDistance: {
          $id: '#/properties/filament/properties/purgeDistance',
          type: 'integer',
        },
        useM600: {
          $id: '#/properties/filament/properties/useM600',
          type: 'boolean',
        },
      },
    },
    plugins: {
      $id: '#/properties/plugins',
      type: 'object',
      required: [
        'displayLayerProgress',
        'enclosure',
        'filamentManager',
        'preheatButton',
        'printTimeGenius',
        'psuControl',
      ],
      properties: {
        displayLayerProgress: {
          $id: '#/properties/plugins/properties/displayLayerProgress',
          type: 'object',
          required: ['enabled'],
          properties: {
            enabled: {
              $id: '#/properties/plugins/properties/displayLayerProgress/properties/enabled',
              type: 'boolean',
            },
          },
        },
        enclosure: {
          $id: '#/properties/plugins/properties/enclosure',
          type: 'object',
          required: ['enabled', 'ambientSensorID', 'filament1SensorID', 'filament2SensorID'],
          properties: {
            enabled: {
              $id: '#/properties/plugins/properties/enclosure/properties/enabled',
              type: 'boolean',
            },
            ambientSensorID: {
              $id: '#/properties/plugins/properties/enclosure/properties/ambientSensorID',
              type: ['number', 'null'],
              pattern: '^(.*)$',
            },
            filament1SensorID: {
              $id: '#/properties/plugins/properties/enclosure/properties/filament1SensorID',
              type: ['number', 'null'],
              pattern: '^(.*)$',
            },
            filament2SensorID: {
              $id: '#/properties/plugins/properties/enclosure/properties/filament2SensorID',
              type: ['number', 'null'],
              pattern: '^(.*)$',
            },
          },
        },
        filamentManager: {
          $id: '#/properties/plugins/properties/filamentManager',
          type: 'object',
          required: ['enabled'],
          properties: {
            enabled: {
              $id: '#/properties/plugins/properties/filamentManager/properties/enabled',
              type: 'boolean',
            },
          },
        },
        preheatButton: {
          $id: '#/properties/plugins/properties/preheatButton',
          type: 'object',
          required: ['enabled'],
          properties: {
            enabled: {
              $id: '#/properties/plugins/properties/preheatButton/properties/enabled',
              type: 'boolean',
            },
          },
        },
        printTimeGenius: {
          $id: '#/properties/plugins/properties/printTimeGenius',
          type: 'object',
          required: ['enabled'],
          properties: {
            enabled: {
              $id: '#/properties/plugins/properties/printTimeGenius/properties/enabled',
              type: 'boolean',
            },
          },
        },
        psuControl: {
          $id: '#/properties/plugins/properties/psuControl',
          type: 'object',
          required: ['enabled', 'turnOnPSUWhenExitingSleep'],
          properties: {
            enabled: {
              $id: '#/properties/plugins/properties/printTimeGenius/properties/enabled',
              type: 'boolean',
            },
            turnOnPSUWhenExitingSleep: {
              $id: '#/properties/plugins/properties/turnOnPSUWhenExitingSleep',
              type: 'boolean',
            },
          },
        },
      },
    },
    octodash: {
      $id: '#/properties/octodash',
      type: 'object',
      required: [
        'customActions',
        'fileSorting',
        'pollingInterval',
        'touchscreen',
        'turnScreenOffWhileSleeping',
        'preferPreviewWhilePrinting',
        'previewProgressCircle',
      ],
      properties: {
        customActions: {
          $id: '#/properties/octodash/properties/customActions',
          type: 'array',
          items: {
            $id: '#/properties/octodash/properties/customActions/items',
            type: 'object',
            required: ['icon', 'command', 'color', 'confirm', 'exit'],
            properties: {
              icon: {
                $id: '#/properties/octodash/properties/customActions/items/properties/icon',
                type: 'string',
                pattern: '^(.*)$',
              },
              command: {
                $id: '#/properties/octodash/properties/customActions/items/properties/command',
                type: 'string',
                pattern: '^(.*)$',
              },
              color: {
                $id: '#/properties/octodash/properties/customActions/items/properties/color',
                type: 'string',
                pattern: '^(.*)$',
              },
              confirm: {
                $id: '#/properties/octodash/properties/customActions/items/properties/confirm',
                type: 'boolean',
              },
              exit: {
                $id: '#/properties/octodash/properties/customActions/items/properties/exit',
                type: 'boolean',
              },
            },
          },
        },
        fileSorting: {
          $id: '#/properties/octodash/properties/fileSorting',
          type: 'object',
          required: ['attribute', 'order'],
          properties: {
            attribute: {
              $id: '#/properties/octodash/properties/fileSorting/properties/attribute',
              type: 'string',
              pattern: '^(name|date|size)$',
            },
            order: {
              $id: '#/properties/octodash/properties/fileSorting/properties/order',
              type: 'string',
              pattern: '^(asc|dsc)$',
            },
          },
        },
        pollingInterval: {
          $id: '#/properties/octodash/properties/pollingInterval',
          type: 'integer',
        },
        touchscreen: {
          $id: '#/properties/octodash/properties/touchscreen',
          type: 'boolean',
        },
        turnScreenOffWhileSleeping: {
          $id: '#/properties/octodash/properties/turnScreenOffWhileSleeping',
          type: 'boolean',
        },
        preferPreviewWhilePrinting: {
          $id: '#/properties/octodash/properties/preferPreviewWhilePrinting',
          type: 'boolean',
        },
        previewProgressCircle: {
          $id: '#/properties/octodash/properties/previewProgressCircle',
          type: 'boolean',
        },
      },
    },
  },
};
