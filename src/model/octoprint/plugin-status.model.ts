export interface PluginInfo {
  enabled: boolean;
  key: string;
}

export interface PluginResponse {
  plugins: PluginInfo[];
}
