export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
}
export class ConsoleLogger implements Logger {
  private getFormattedStackTrace(error: Error): string {
    // This will give us a stack trace with file names and line numbers
    const stack = error.stack;
    if (!stack) {
      return "";
    }

    const stackLines = stack.split("\n");
    // Skip the first line as it's the error message
    for (const line of stackLines.slice(1)) {
      if (line.indexOf("at ") !== -1) {
        // This is a simplistic way to extract file and line number
        const match =
          /at (.+?) \((?:file:\/\/\/)?(.+?):(\d+):\d+\)/.exec(line) ||
          /at (?:file:\/\/\/)?(.+?):(\d+):\d+/.exec(line);
        if (match) {
          // Depending on the presence of a method name, the file path will be in a different match group
          const filePath = match[2] || match[1];
          const lineNumber = match[3] || match[2];
          return `at ${filePath}:${lineNumber}`;
        }
      }
    }
    return "";
  }

  info(message: string): void {
    console.log(`\x1b[36mINFO: ${message}\x1b[0m`);
  }

  warn(message: string): void {
    console.warn(`\x1b[33mWARN: ${message}\x1b[0m`);
  }

  error(message: string, error?: Error): void {
    const formattedStackTrace = error ? this.getFormattedStackTrace(error) : "";
    console.error(
      `\x1b[31mERROR: ${message} ${formattedStackTrace}\x1b[0m`,
      error
    );
  }
}
