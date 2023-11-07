import { Logger, ConsoleLogger } from "./ConsoleLogger";
import axios from "axios";
import * as cheerio from "cheerio";
import SteamCommunity from "steamcommunity";

export interface ISteamProfileManager {
  // doesProfileExist(url: string): Promise<boolean>;
  doProfilesExist(urls: string[]): Promise<boolean[]>;
  performActionWithAccount(
    community: SteamCommunity,
    profileUrl: string,
    accountName: string,
    loggedInAccounts: { accountName: string; community: SteamCommunity }[]
  ): Promise<void>;
}

export class SteamProfileManager implements ISteamProfileManager {
  private httpClient: typeof axios;
  private logger: Logger;
  private baseUrl = "https://steamcommunity.com/id/";

  constructor(httpClient: typeof axios, logger?: Logger) {
    this.httpClient = httpClient;
    this.logger = logger ?? new ConsoleLogger();
  }

  private async doesProfileExist(url: string): Promise<boolean> {
    try {
      const combinedUrl = `${this.baseUrl}${url}`;
      const response = await this.httpClient.get(combinedUrl);
      const htmlCode = response.data;
      const $ = cheerio.load(htmlCode);

      // Using CSS selectors to locate the specific HTML structure
      const node = $("#BG_bottom #message h3");
      if (
        node.length &&
        node.text().includes("The specified profile could not be found.")
      ) {
        this.logger.warn(`Profile not found at URL: ${combinedUrl}`);
        return false;
      }
      this.logger.info(`Profile found at URL: ${combinedUrl}`);
      return true;
    } catch (ex) {
      this.logger.error(
        `An error occurred while checking the profile at URL: ${Comment}`
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

  public async performActionWithAccount(
    community: SteamCommunity,
    profileUrl: string,
    accountName: string,
    loggedInAccounts: { accountName: string; community: SteamCommunity }[]
  ): Promise<void> {
    this.logger.info(`Performing action with account on profile ${profileUrl}`);
    // community.editProfile(
    //   {
    //     customURL: profileUrl,
    //   },
    //   (err) => {
    //     if (err) {
    //       this.logger.error(
    //         `An error occurred while performing action on ${profileUrl}: ${err}`
    //       );
    //     } else {
    //       this.logger.info(`Successfully changed URL to ${profileUrl}`);
    //       const accountIndex = loggedInAccounts.findIndex(
    //         (acc) => acc.accountName === accountName
    //       );
    //       if (accountIndex !== -1) {
    //         loggedInAccounts.splice(accountIndex, 1);
    //         this.logger.info(
    //           `Account ${accountName} has been removed from the list after action.`
    //         );
    //       }
    //     }
    //   }
    // );
    // Perform the action with the given account and profile URL

    try {
    } catch (error) {
      this.logger.error(
        `An error occurred while performing action on ${profileUrl}:`
      );
    }
  }
}
