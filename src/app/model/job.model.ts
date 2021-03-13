export interface JobStatus {
  status: string;
  file: string;
  thumbnail: string | undefined;
  progress: number;
  zIndicatorText: string;
  filamentAmount?: number;
  timePrinted: Duration;
  timeLeft?: Duration;
  estimatedPrintTime?: Duration;
  estimatedEndTime?: string;
}

interface Duration {
  value: string;
  unit: string;
}
