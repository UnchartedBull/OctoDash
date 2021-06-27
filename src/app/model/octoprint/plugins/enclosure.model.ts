/* eslint-disable camelcase */

export interface EnclosurePluginAPI {
  controlled_io: string;
  temp_sensor_address: string;
  temp_sensor_navbar: boolean;
  temp_sensor_temp: number;
  printer_action: string;
  filament_sensor_enabled: boolean;
  controlled_io_set_value: number;
  temp_sensor_type: string;
  temp_sensor_humidity: number;
  filament_sensor_timeout: number;
  edge: string;
  ds18b20_serial: string;
  action_type: string;
  input_pull_resistor: string;
  input_type: string;
  label: string;
  index_id: number;
  use_fahrenheit: boolean;
  gpio_pin: string;
}

export interface EnclosureColorBody {
  red: number;
  green: number;
  blue: number;
}

export interface EnclosureOutputBody {
  status: boolean;
}

export interface EnclosurePWMBody {
  duty_cycle: number;
}
