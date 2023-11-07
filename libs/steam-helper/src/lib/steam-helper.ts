import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger, ConsoleLogger } from './ConsoleLogger';

export interface IWebHelper {
  doesProfileExist(url: string): Promise<boolean>;
}

export class WebHelper implements IWebHelper {
  private httpClient = axios;
  private Logger: Logger;

  constructor(logger?: Logger) {
    this.Logger = logger ?? new ConsoleLogger();
  }

  public async doesProfileExist(url: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get(url);
      const htmlCode = response.data;
      const $ = cheerio.load(htmlCode);

      // Using Cheerio to locate the specific HTML structure
      const node = $('#BG_bottom #message h3').first();

      if (
        node.length &&
        node.text().includes('The specified profile could not be found.')
      ) {
        this.Logger.warn(`Profile not found at URL: ${url}`);
        // The specific HTML block exists, which means the profile does not exist
        return false;
      }
      // If the block does not exist, then we can assume the profile does exist
      return true;
    } catch (ex) {
      this.Logger.error(`Error while checking profile existence: ${ex}`);
    }
  }
}
