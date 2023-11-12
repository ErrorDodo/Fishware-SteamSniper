import axios from "axios";
import { SteamProfileManager } from "./SteamProfileManager";
import { SteamLoginManager } from "./SteamLoginManager";
import { ConsoleLogger } from "./ConsoleLogger";
import { ProfileQueue, ProfileTask } from "./ProfileQueue";
import * as fs from "fs";
import { getAppSettingsFromFile, getProfileUrlsFromFile } from "./Settings";

const logger = new ConsoleLogger();
const profileChecker = new SteamProfileManager(axios, logger);
const steamLoginManager = new SteamLoginManager(logger);

let profileUrls = getProfileUrlsFromFile();
const appSettings = getAppSettingsFromFile();

const onProfileClaimed = (profileUrl: string, accountName: string) => {
  // TODO: Look into why onProfileClaimed is not creating a file
  const claimedProfilesFilePath = "./claimedProfiles.json";
  const claimedProfiles = JSON.parse(
    fs.readFileSync(claimedProfilesFilePath, "utf-8")
  );
  claimedProfiles.push({ profileUrl, accountName });
  fs.writeFileSync(
    claimedProfilesFilePath,
    JSON.stringify(claimedProfiles, null, 2)
  );
  // Remove the claimed profile URL from the list
  profileUrls = profileUrls.filter((url) => url !== profileUrl);
};

// Define concurrency level for how many profiles can be processed at once
const concurrencyLevel = appSettings.ConcurrentProfileChecks;
const profileQueue = new ProfileQueue(
  profileChecker,
  logger,
  concurrencyLevel,
  onProfileClaimed
);

// Initialize Steam logins and then start the profile check routine
steamLoginManager
  .initializeLogins()
  .then(() => {
    logger.info("All accounts are initialized.");
    checkProfiles();
    // Run the profile check every 5 seconds
    setInterval(checkProfiles, appSettings.ProfileCheckIntervalInMilliseconds);
  })
  .catch((error) => {
    logger.error("Failed to initialize one or more Steam logins:", error);
  });

// Keep track of the index of the account to use next
let currentAccountIndex = 0;
// Keep track of the number of tasks assigned to check when all accounts have been used
let tasksAssigned = 0;

const checkProfiles = async () => {
  logger.info("Running a check on the profiles...");

  // Ensure there are profiles to check
  if (profileUrls.length === 0) {
    logger.warn("No profiles to check");
    return;
  }

  const loggedInAccounts = steamLoginManager.getLoggedInAccounts();

  if (tasksAssigned >= loggedInAccounts.length) {
    logger.error("All accounts have been utilized.");
    process.exit(1);
  }

  // Check if profiles exist and add them to the queue
  try {
    const profilesExist = await profileChecker.doProfilesExist(profileUrls);

    profilesExist.forEach((exists, index) => {
      if (!exists) {
        const profileUrl = profileUrls[index];

        // Use the next account in the list for the task
        const accountToUse = loggedInAccounts[currentAccountIndex];
        currentAccountIndex =
          (currentAccountIndex + 1) % loggedInAccounts.length; // Wrap the index after the last account
        tasksAssigned++; // Increment the number of tasks assigned

        const task: ProfileTask = {
          profileUrl: profileUrl,
          account: accountToUse,
        };

        logger.info(
          `Placing account ${accountToUse.accountName} to snipe ${profileUrl} in queue.`
        );
        profileQueue.addTask(task);
      }
    });
  } catch (error) {
    logger.error(`An error occurred while checking profiles: ${error}`);
  }
};
