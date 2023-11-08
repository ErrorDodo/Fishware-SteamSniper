import SteamCommunity from "steamcommunity";
import { Logger, ConsoleLogger } from "./ConsoleLogger";
import * as fs from "fs";

export class SteamLoginManager {
  private loggedInAccounts: {
    accountName: string;
    community: SteamCommunity;
  }[] = [];
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? new ConsoleLogger();
  }

  public async initializeLogins() {
    const loginDetailsArray: SteamCommunity.LoginOptions[] =
      this.getLoginDetailsFromFile();

    let failedLogins = 0;

    for (const loginDetails of loginDetailsArray) {
      try {
        await this.loginToSteam(loginDetails);
      } catch (error) {
        failedLogins++;
      }
    }

    if (failedLogins === loginDetailsArray.length) {
      this.logger.error("All account logins have failed.");
      process.exit(1);
    }
  }

  private getLoginDetailsFromFile(): SteamCommunity.LoginOptions[] {
    try {
      if (!fs.existsSync("./config/accounts.json")) {
        this.logger.error("No accounts file found.");
        process.exit(1);
      }
      const rawData = fs.readFileSync("./config/accounts.json", "utf-8");
      const accounts = JSON.parse(rawData);
      this.logger.info("Reading login details from file.");

      return accounts.map((acc: any) => ({
        accountName: acc.username,
        password: acc.password,
      }));
    } catch (error) {
      this.logger.error(`Error reading accounts file: ${error}}`);
      process.exit(1);
    }
  }

  private async loginToSteam(
    accountDetails: SteamCommunity.LoginOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!accountDetails.accountName || !accountDetails.password) {
        this.logger.warn(
          "Missing account name or password for a Steam account."
        );
        return reject("Missing credentials");
      }

      const community = new SteamCommunity();
      community.login(
        accountDetails,
        (err, sessionID, cookies, steamguard, oAuthToken) => {
          if (err) {
            this.logger.error(
              `Login failed for ${accountDetails.accountName}: ${err}`
            );
            reject(err);
          } else {
            this.logger.info(
              `Logged in successfully as ${accountDetails.accountName}.`
            );
            this.loggedInAccounts.push({
              accountName: accountDetails.accountName,
              community,
            });
            resolve();
          }
        }
      );
    });
  }

  public getLoggedInAccounts(): {
    accountName: string;
    community: SteamCommunity;
  }[] {
    return this.loggedInAccounts;
  }
}
