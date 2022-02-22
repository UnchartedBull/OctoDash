export interface Notification {
  heading: string;
  text: string;
  type: NotificationType;
  time: Date;
  choices?: Array<string>;
  callback?: (index: number) => void;
  sticky?: boolean;
}

export enum NotificationType {
  INFO,
  WARN,
  ERROR,
  PROMPT,
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
