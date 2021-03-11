export interface OctoprintSocketCurrent {
  current: {
    busyFiles: Array<string>;
    currentZ: number;
    // TODO
    job: null;
    logs: Array<string>;
    messages: Array<string>;
    // TODO
    offsets: null;
    progress: null;
    resends: OctoprintSocketResends;
    serverTime: number;
    state: OctoprintSocketState;
    temps: OctoprintSocketTemperatures;
  };
}

export interface OctoprintPluginMessage {
  plugin: {
    plugin: string;
    data: unknown;
  };
}

interface OctoprintSocketResends {
  count: number;
  transmitted: number;
  ratio: number;
}

interface OctoprintSocketState {
  text: string;
  flags: OctoprintSocketStateFlags;
}

interface OctoprintSocketStateFlags {
  cancelling: boolean;
  closedOrError: boolean;
  error: boolean;
  finishing: boolean;
  operational: boolean;
  paused: boolean;
  pausing: boolean;
  printing: boolean;
  ready: boolean;
  resuming: boolean;
  sdReady: boolean;
}

interface OctoprintSocketTemperatures {
  [key: number]: {
    time: number;
    bed: OctoprintSocketTemperature;
    chamber: OctoprintSocketTemperature;
    tool0: OctoprintSocketTemperature;
  };
}

interface OctoprintSocketTemperature {
  actual: number;
  target: number;
}

// busyFiles: []
// currentZ: null
// job: {file: {…}, estimatedPrintTime: null, lastPrintTime: null, filament: {…}, user: null}
// logs: ["Recv: wait"]
// messages: ["wait"]
// offsets: {tool0: 0}
// progress: {completion: null, filepos: null, printTime: null, printTimeLeft: null, printTimeOrigin: null}
// resends: {count: 0, transmitted: 9, ratio: 0}
// serverTime: 1612993378.293588
// state: {text: "Operational", flags: {…}}
// temps: []
