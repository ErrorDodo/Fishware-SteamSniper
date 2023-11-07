import axios from "axios";
import { ProfileChecker } from "./SteamProfileChecker";

const webHelper = new ProfileChecker(axios);
const profileUrls = [
  "https://steamcommunity.com/id/tedlookatmyprofile",
  "https://steamcommunity.com/id/dodowhatyouwantcauseapiratelifeisfree",
];

const checkProfiles = async () => {
  console.log("Running a check on the profiles...");
  try {
    const profilesExist = await webHelper.doProfilesExist(profileUrls);
    profilesExist.forEach((exists, index) => {});
  } catch (error) {}
};

// Run the task every 5 seconds
setInterval(checkProfiles, 5000);

console.log("Task scheduled. Checking profiles every 5 seconds.");
