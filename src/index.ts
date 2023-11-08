import axios from "axios";
import { SteamProfileManager } from "./SteamProfileManager";
import { SteamLoginManager } from "./SteamLoginManager";
import { ConsoleLogger } from "./ConsoleLogger";
import { ProfileQueue, ProfileTask } from "./ProfileQueue";
import * as fs from "fs";

const logger = new ConsoleLogger();
const profileChecker = new SteamProfileManager(axios, logger);
const steamLoginManager = new SteamLoginManager(logger);

// Get profile URLs from a file
const getProfileUrlsFromFile = (): string[] => {
  try {
    const profilesFilePath = "./config/profiles.json";
    if (!fs.existsSync(profilesFilePath)) {
      logger.error("No profiles file found.");
      process.exit(1);
    }
    const rawData = fs.readFileSync(profilesFilePath, "utf-8");
    const profileUrls: string[] = JSON.parse(rawData);
    logger.info("Reading profile URLs from file.");
    return profileUrls;
  } catch (error) {
    logger.error(`Error reading profiles file: ${error}`);
    process.exit(1);
  }
};

let profileUrls = getProfileUrlsFromFile();

// We can do whatever we want with this callback now
// For Example:
//        Log the profile URL that was snipped into a file
const onProfileClaimed = (profileUrl: string) => {
  // Remove the claimed profile URL from the list
  profileUrls = profileUrls.filter((url) => url !== profileUrl);
  logger.info(`Profile ${profileUrl} has been claimed.`);
};

// Define concurrency level for how many profiles can be processed at once
const concurrencyLevel = 2;
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
    setInterval(checkProfiles, 5000);
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

  // Ensure there are profiles to check and accounts logged in
  if (
    profileUrls.length === 0 ||
    steamLoginManager.getLoggedInAccounts().length === 0
  ) {
    logger.warn("No profiles to check or no accounts available.");
    return;
  }

  const loggedInAccounts = steamLoginManager.getLoggedInAccounts();

  // Reset the count when all accounts have been used
  if (tasksAssigned >= loggedInAccounts.length) {
    logger.error("All accounts have been utilized.");
    process.exit(1);
  }

  // Check if profiles exist and add them to the queue
  try {
    const profilesExist = await profileChecker.doProfilesExist(profileUrls);

    profilesExist.forEach((exists, index) => {
      if (exists) {
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
        profileQueue.addTask(task);
      }
    });
  } catch (error) {
    logger.error(`An error occurred while checking profiles: ${error}`);
  }
};
