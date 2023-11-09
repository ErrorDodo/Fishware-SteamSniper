import SteamCommunity from "steamcommunity";
import { Logger, ConsoleLogger } from "./ConsoleLogger";
import { getLoginDetailsFromFile } from "./Settings";

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
      getLoginDetailsFromFile();

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
      community.login(accountDetails, (err) => {
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
      });
    });
  }

  public getLoggedInAccounts(): {
    accountName: string;
    community: SteamCommunity;
  }[] {
    return this.loggedInAccounts;
  }
}
