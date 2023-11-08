import { Logger, ConsoleLogger } from "./ConsoleLogger";
import axios from "axios";
import * as cheerio from "cheerio";
import SteamCommunity, { EditProfileSettings } from "steamcommunity";

export interface ISteamProfileManager {
  // doesProfileExist(url: string): Promise<boolean>;
  doProfilesExist(urls: string[]): Promise<boolean[]>;
  performActionWithAccount(
    community: SteamCommunity,
    profileUrl: string,
    accountName: string,
    loggedInAccounts: { accountName: string; community: SteamCommunity }[]
  ): Promise<string>;
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
        this.logger.info(`Profile not found at URL: ${combinedUrl}`);
        return false;
      }
      this.logger.info(`Profile found at URL: ${combinedUrl}`);
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

  public async performActionWithAccount(
    community: SteamCommunity,
    profileUrl: string,
    accountName: string
  ): Promise<string> {
    const combinedUrl = `${this.baseUrl}${profileUrl}`;

    const profileUpdate: EditProfileSettings = {
      customURL: profileUrl,
      name: "Sniped by Fishware",
      realName: "",
      summary: "https://github.com/ErrorDodo/Fishware-SteamSniper",
      country: "",
      state: "",
      city: "",
      background: "",
      featuredBadge: "",
      primaryGroup: "",
    };

    return new Promise((resolve, reject) => {
      community.editProfile(profileUpdate, (err) => {
        if (err) {
          this.logger.error(
            `An error occurred on account ${accountName} while updating the profile at URL: ${combinedUrl}: ${err}`
          );
          reject(new Error(`Profile URL ${combinedUrl} is taken.`));
        } else {
          resolve(`Profile URL ${combinedUrl} is free and has been claimed.`);
        }
      });
    });
  }
}
