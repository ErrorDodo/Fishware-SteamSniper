import axios from "axios";
import { SteamProfileManager } from "./SteamProfileManager";
import { SteamLoginManager } from "./SteamLoginManager";
import { ConsoleLogger } from "./ConsoleLogger";

const logger = new ConsoleLogger();
const profileChecker = new SteamProfileManager(axios, logger);
const steamLoginManager = new SteamLoginManager(logger);

// Add the profile URLs you want to check
const profileUrls = [`tedlookatmyprofile`];

const checkProfiles = async () => {
  logger.info("Running a check on the profiles...");
  try {
    const profilesExist = await profileChecker.doProfilesExist(profileUrls);
    const loggedInAccounts = steamLoginManager.getLoggedInAccounts();

    profilesExist.forEach((exists, index) => {
      if (exists) {
        if (loggedInAccounts.length > 0) {
          // Choose an account to use (for example, the first one)
          const accountToUse = loggedInAccounts[0];
          // Perform an action with that account
          profileChecker.performActionWithAccount(
            accountToUse.community,
            profileUrls[index],
            accountToUse.accountName,
            loggedInAccounts
          );
        }
      }
    });
  } catch (error) {
    logger.error(`An error occurred while checking for the profiles: ${error}`);
  }
};

// Initialize Steam logins and then start the profile check routine
steamLoginManager
  .initializeLogins()
  .then(() => {
    logger.info("All accounts are initialized.");
    // Run the profile check every 5 seconds
    setInterval(checkProfiles, 5000);
  })
  .catch((error) => {
    logger.error("Failed to initialize one or more Steam logins:", error);
  });
