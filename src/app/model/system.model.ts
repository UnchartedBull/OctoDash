export interface Notification {
  heading: string;
  text: string;
  type: NotificationType;
  // closed: () => void;
}

export enum NotificationType {
  INFO,
  WARN,
  ERROR,
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
