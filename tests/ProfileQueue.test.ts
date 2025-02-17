import { ProfileQueue, ProfileTask } from "../src/ProfileQueue";
import SteamCommunity from "steamcommunity";
import { Logger, ConsoleLogger } from "../src/ConsoleLogger";
import { SteamProfileManager } from "../src/SteamProfileManager";
import axios from "axios";

jest.mock("axios");
jest.mock("steamcommunity", () => {
  return {
    __esModule: true, // this property makes it work as a module
    default: jest.fn().mockImplementation(() => ({
      editProfile: jest.fn((settings, callback) => callback(null)),
    })),
  };
});

describe("ProfileQueue", () => {
  let profileQueue: ProfileQueue;
  let profileCheckerMock: SteamProfileManager;
  let logger: Logger;
  let onProfileClaimedCallback: jest.Mock;

  beforeEach(() => {
    // Mocking axios with default resolved value
    (axios.get as jest.Mock).mockResolvedValue({ data: "<html></html>" });

    // Setup the logger
    logger = new ConsoleLogger();

    // Create a new instance of ProfileQueue with a concurrency of 1
    profileQueue = new ProfileQueue(
      profileCheckerMock,
      logger,
      1,
      onProfileClaimedCallback
    );
  });

  it("should add task to the queue and increase the queue length", () => {
    const task: ProfileTask = {
      profileUrl: "http://example.com",
      account: {
        community: new SteamCommunity(),
        accountName: "testAccount",
      },
    };

    expect(profileQueue.getQueueLength()).toBe(0);
    profileQueue.addTask(task);
    expect(profileQueue.getQueueLength()).toBe(1);
  });
});
