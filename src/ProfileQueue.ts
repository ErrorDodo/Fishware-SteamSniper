import async, { QueueObject } from "async";
import SteamCommunity from "steamcommunity";
import { Logger } from "./ConsoleLogger";
import { SteamProfileManager } from "./SteamProfileManager";

export interface ProfileTask {
  profileUrl: string;
  account: {
    community: SteamCommunity;
    accountName: string;
  };
}

export class ProfileQueue {
  private queue: QueueObject<ProfileTask>;
  private onProfileClaimed: (profileUrl: string) => void;

  constructor(
    private profileChecker: SteamProfileManager,
    private logger: Logger,
    concurrencyLevel: number,
    onProfileClaimedCallback: (profileUrl: string) => void
  ) {
    this.queue = async.queue(this.processTask.bind(this), concurrencyLevel);
    this.queue.error(this.handleError.bind(this));
    this.onProfileClaimed = onProfileClaimedCallback;
  }

  private async processTask(
    task: ProfileTask,
    completed: (error: Error | null, result?: string) => void
  ) {
    const { profileUrl, account } = task;
    const maxAttempts = 3; // Maximum number of attempts

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const resultMessage =
          await this.profileChecker.performActionWithAccount(
            account.community,
            profileUrl,
            account.accountName,
            [account]
          );
        this.logger.info(resultMessage);
        this.onProfileClaimed(profileUrl);
        completed(null, profileUrl);
        return;
      } catch (error) {
        this.logger.error(
          `Attempt ${attempt} failed for account ${account.accountName}`
        );
        if (attempt === maxAttempts) {
          this.logger.error(
            `Attempts exhausted for account ${account.accountName} to change to profile ${profileUrl}`
          );
          completed(error as Error, profileUrl);
        }
      }
    }
  }

  private handleError(err: Error, task: ProfileTask) {
    this.logger.error(`Error processing profile ${task.profileUrl}`);
  }

  public addTask(task: ProfileTask) {
    this.queue.push(task);
  }

  public getQueueLength(): number {
    return this.queue.length();
  }
}
