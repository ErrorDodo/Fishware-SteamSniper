import { Logger, ConsoleLogger } from "./ConsoleLogger";
import axios from "axios";
import * as cheerio from "cheerio";

export interface IWebHelper {
  // doesProfileExist(url: string): Promise<boolean>;
  doProfilesExist(urls: string[]): Promise<boolean[]>;
}

export class WebHelper implements IWebHelper {
  private httpClient: typeof axios;
  private logger: Logger;

  constructor(httpClient: typeof axios, logger?: Logger) {
    this.httpClient = httpClient;
    this.logger = logger ?? new ConsoleLogger();
  }

  private async doesProfileExist(url: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get(url);
      const htmlCode = response.data;
      const $ = cheerio.load(htmlCode);

      // Using CSS selectors to locate the specific HTML structure
      const node = $("#BG_bottom #message h3");
      if (
        node.length &&
        node.text().includes("The specified profile could not be found.")
      ) {
        this.logger.warn(`Profile not found at URL: ${url}`);
        return false;
      }
      this.logger.info(`Profile found at URL: ${url}`);
      return true;
    } catch (ex) {
      this.logger.error(
        `An error occurred while checking the profile at URL: ${url}`
      );
      // Rethrow the error to handle it in the calling code
      throw ex;
    }
  }

  public async doProfilesExist(urls: string[]): Promise<boolean[]> {
    // Map each URL to the doesProfileExist promise
    const profileExistencePromises = urls.map((url) =>
      this.doesProfileExist(url).catch((error) => {
        // Log the error and return false as the default "existence" state in case of error
        this.logger.error(
          `An error occurred while checking the profile at URL: ${url}: ${error}`
        );
        return false;
      })
    );

    // Execute all the promises concurrently
    const profilesExistence = await Promise.all(profileExistencePromises);
    return profilesExistence;
  }
}
