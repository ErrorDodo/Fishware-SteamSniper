export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
}

export class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(`\x1b[36mINFO: ${message}\x1b[0m`); // Cyan for info
  }

  warn(message: string): void {
    console.warn(`\x1b[33mWARN: ${message}\x1b[0m`); // Yellow for warn
  }

  error(message: string, error?: Error): void {
    console.error(`\x1b[31mERROR: ${message}\x1b[0m`, error); // Red for error
  }
}
