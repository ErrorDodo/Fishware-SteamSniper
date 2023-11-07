import { Logger, ConsoleLogger } from './ConsoleLogger';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface IWebHelper {
  doesProfileExist(url: string): Promise<boolean>;
}

export class WebHelper implements IWebHelper {
  private httpClient: typeof axios;
  private logger: Logger;

  constructor(httpClient: typeof axios, logger?: Logger) {
    this.httpClient = httpClient;
    this.logger = logger ?? new ConsoleLogger();
  }

  public async doesProfileExist(url: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get(url);
      const htmlCode = response.data;
      const $ = cheerio.load(htmlCode);

      // Using CSS selectors to locate the specific HTML structure
      const node = $('#BG_bottom #message h3');
      if (
        node.length &&
        node.text().includes('The specified profile could not be found.')
      ) {
        this.logger.warn(`Profile not found at URL: ${url}`);
        // The specific HTML block exists, which means the profile does not exist
        return false;
      }
      // If the block does not exist, then we can assume the profile does exist
      return true;
    } catch (ex) {
      this.logger.error(
        `An error occurred while checking the profile at URL: ${url}`
      );
      throw new Error('An error occurred while checking the profile.');
    }
  }
}
