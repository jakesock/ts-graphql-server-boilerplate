import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../../entity";

/**
 * Creates loader that takes an array of user ids and returns a sorted array of users.
 * Solves n+1 problem by fetching each user once and populating other
 * instances of each user by their id.
 * @return {DataLoader<string, User>} Instance of DataLoader that returns a sorted array of users.
 */
export const createUserLoader = (): DataLoader<string, User> =>
  new DataLoader<string, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as string[]) });
    const userIdToUserMap: Record<string, User> = {};
    users.forEach((user) => {
      userIdToUserMap[user.id] = user;
    });

    const sortedUsers = userIds.map((userId) => userIdToUserMap[userId]);
    return sortedUsers;
  });
