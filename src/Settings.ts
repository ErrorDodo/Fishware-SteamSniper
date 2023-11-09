import * as fs from "fs";
import { Settings, Account, AppSettings } from "settings";
import { LoginOptions } from "steamcommunity";

const settingsFilePath = "./config/settings.json";

const doesSettingsFileExist = (): boolean => {
  return fs.existsSync(settingsFilePath);
};

export const getProfileUrlsFromFile = (): string[] => {
  if (!doesSettingsFileExist()) {
    throw new Error("Settings file does not exist.");
  }
  try {
    const rawData = fs.readFileSync(settingsFilePath, "utf-8");
    const settings: Settings = JSON.parse(rawData);
    return settings.profiles;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse settings file: ${error.message}`);
    } else {
      throw new Error(`Failed to parse settings file: ${String(error)}`);
    }
  }
};

export const getLoginDetailsFromFile = (): LoginOptions[] => {
  if (!doesSettingsFileExist()) {
    throw new Error("Settings file does not exist.");
  }
  try {
    const rawData = fs.readFileSync(settingsFilePath, "utf-8");
    const settings: Settings = JSON.parse(rawData);

    return settings.accounts.map((account: Account): LoginOptions => {
      return {
        accountName: account.username, // Rename username to accountName
        password: account.password,
      };
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse settings file: ${error.message}`);
    } else {
      throw new Error(`Failed to parse settings file: ${String(error)}`);
    }
  }
};

export const getAppSettingsFromFile = (): AppSettings => {
  if (!doesSettingsFileExist()) {
    throw new Error("Settings file does not exist.");
  }
  try {
    const rawData = fs.readFileSync(settingsFilePath, "utf-8");
    const settings: Settings = JSON.parse(rawData);

    return settings.settings;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse settings file: ${error.message}`);
    } else {
      throw new Error(`Failed to parse settings file: ${String(error)}`);
    }
  }
};
