import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";

let TestDataSource: DataSource;
let userId: string;
const testUser = {
  username: "CurrentUser",
  email: "CurrentUser@test.com",
  password: "CurrentUser123",
};

beforeAll(async () => {
  TestDataSource = await testConnection();
  if (redisClient.status === "end") await redisClient.connect();
  if (redisTestClient.status === "end") await redisTestClient.connect();

  const user = await User.create({
    username: testUser.username,
    email: testUser.email,
    password: testUser.password,
  }).save();

  userId = user.id;
});
afterAll(async () => {
  redisClient.disconnect();
  redisTestClient.disconnect();
  await TestDataSource.destroy();
});

const getCurrentUserQuery = `
  query GetCurrentUser {
    getCurrentUser {
      id
      username
      email
      isConfirmed
    }
  }
`;

describe("USER: Get Current User Query", () => {
  it("gets currently logged in user", async () => {
    // Get currently logged in user
    const getCurrentUserResponse = await gqlCall({
      source: getCurrentUserQuery,
      userId,
    });

    expect(getCurrentUserResponse.data!.getCurrentUser).toBeTruthy();
    expect(getCurrentUserResponse).toMatchObject({
      data: {
        getCurrentUser: {
          id: userId,
          username: testUser.username,
          email: testUser.email,
          isConfirmed: false,
        },
      },
    });
  });
});
