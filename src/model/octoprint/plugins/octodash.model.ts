export interface OctoDashPlugin {
  fanspeed?: {
    [index: number]: number;
  };
  settingsUpdate?: boolean;
}
