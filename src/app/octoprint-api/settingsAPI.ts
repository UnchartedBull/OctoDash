export interface OctoprintSettingsAPI {
    api: object;
    appearance: object;
    feature: object;
    folder: object;
    plugins: OctoprintPluginsAPI;
    scripts: object;
    serial: object;
    server: object;
    system: object;
    temperature: object;
    terminalFilters: object;
    webcam: object;
}

interface OctoprintPluginsAPI {
    [index: string]: object;
    enclosure: OctoprintEnclosureAPI;
}

interface OctoprintEnclosureAPI {
    debug: boolean;
    debug_temperature_log: boolean;
    filament_sensor_gcode: string;
    gcode_control: boolean;
    neopixel_dma: number;
    notification_api_key: string;
    notifictiion_event_name: string;
    notification_provider: string;
    notifications: Array<object>;
    rpi_inputs: Array<OctoprintEnclosureInputsAPI>;
    rpi_outputs: Array<object>;
    use_board_pin_number: boolean;
    use_fahrenheit: boolean;
}

interface OctoprintEnclosureInputsAPI {
    action_type: string;
    controlled_io: string;
    controlled_io_set_value: string;
    ds18b20_serial: string;
    edge: string;
    filament_sensor_enabled: boolean;
    filament_sensor_timeout: number;
    gpio_pin: string;
    index_id: number;
    input_pull_resistor: string;
    input_type: string;
    label: string;
    printer_action: string;
    temp_sensor_address: string;
    temp_sensor_humidity: number;
    temp_sensor_temp: number;
    temp_sensor_type: string;
    use_fahrenheit: boolean;
}
