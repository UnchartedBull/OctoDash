export interface Config {
    port: number;
    octoprint: Octoprint;
    printer: Printer;
}

interface Octoprint {
    url: string;
    accessToken: string;
}

interface Printer {
    name: string;
}