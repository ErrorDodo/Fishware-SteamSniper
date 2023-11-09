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
    ProfileCheckInterval: number;
    ConcurrentProfileChecks: number;
  }
}
