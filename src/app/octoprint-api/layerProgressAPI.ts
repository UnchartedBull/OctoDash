export interface OctoprintLayerProgressAPI {
  layer: OctoprintLayer;
  height: OctoprintHeight;
  fanSpeed: string;
  feedrate: string;
}

interface OctoprintLayer {
  total: string;
  current: string;
}

interface OctoprintHeight {
  total: string;
  totalWithExtrusion: string;
  current: string;
}
