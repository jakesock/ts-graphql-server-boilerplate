import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";

let TestDataSource: DataSource;
let userId: string;
const testUser = {
  username: "LogoutUser",
  email: "LogoutUser@test.com",
  password: "LogoutUser123",
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

const logoutUserMutation = `
  mutation LogoutUser {
    logoutUser
  }
`;

describe("USER: Logout User Mutation", () => {
  it("returns true on successful logout", async () => {
    // Logout User
    const logoutUserResponse = await gqlCall<boolean>({
      source: logoutUserMutation,
      userId,
    });

    expect(logoutUserResponse.data).toBeTruthy();
    expect(logoutUserResponse.errors).toBeUndefined();
    expect(logoutUserResponse.data!.logoutUser).toBeTruthy();
    expect(logoutUserResponse.data!.logoutUser).toEqual(true);
  });
});
