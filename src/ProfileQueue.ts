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
    try {
      const resultMessage = await this.profileChecker.performActionWithAccount(
        account.community,
        profileUrl,
        account.accountName,
        [account]
      );
      this.logger.info(resultMessage);
      this.onProfileClaimed(profileUrl);
      completed(null, profileUrl);
    } catch (error) {
      this.logger.error(
        `An error occurred while performing action on profile: ${error}`
      );
      completed(error as Error, profileUrl);
    }
  }

  private handleError(err: Error, task: ProfileTask) {
    this.logger.error(
      `Error processing profile ${task.profileUrl}: ${err.message}`
    );
  }

  public addTask(task: ProfileTask) {
    this.queue.push(task);
  }

  public getQueueLength(): number {
    return this.queue.length();
  }
}
