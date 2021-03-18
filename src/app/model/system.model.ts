export interface Notification {
  heading: string;
  text: string;
  type: string;
  closed: () => void;
}

export interface UpdateError {
  error: {
    message: string;
    stack?: string;
  };
}

export interface UpdateDownloadProgress {
  percentage: number;
  transferred: number;
  total: number | string;
  remaining: number;
  eta: string;
  runtime: string;
  delta: number;
  speed: number | string;
}
