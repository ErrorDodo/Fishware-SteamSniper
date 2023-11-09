declare module "settings" {
  export interface Settings {
    profiles: string[];
    accounts: Account[];
    settings: AppSettings;
  }

  export interface Account {
    username: string;
    password: string;
  }

  export interface AppSettings {
    ProfileCheckIntervalInMilliseconds: number;
    ConcurrentProfileChecks: number;
  }
}
