import * as fs from "fs";
import { Settings, Account, AppSettings } from "settings";
import { LoginOptions } from "steamcommunity";

const settingsFilePath = "./config/settings.json";

export const getProfileUrlsFromFile = (): string[] => {
  const rawData = fs.readFileSync(settingsFilePath, "utf-8");
  const settings: Settings = JSON.parse(rawData);

  return settings.profiles;
};

export const getLoginDetailsFromFile = (): LoginOptions[] => {
  const rawData = fs.readFileSync(settingsFilePath, "utf-8");
  const settings: Settings = JSON.parse(rawData);

  return settings.accounts.map((account: Account): LoginOptions => {
    return {
      accountName: account.username, // Rename username to accountName
      password: account.password,
    };
  });
};

export const getAppSettingsFromFile = (): AppSettings => {
  const rawData = fs.readFileSync(settingsFilePath, "utf-8");
  const settings: Settings = JSON.parse(rawData);

  const appSettings: AppSettings = {
    ...settings.settings,
    ProfileCheckInterval: settings.settings.ProfileCheckInterval * 1000, // Convert seconds to milliseconds
  };

  return appSettings;
};
