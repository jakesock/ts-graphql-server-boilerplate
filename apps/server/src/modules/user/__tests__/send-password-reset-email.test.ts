import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";

let TestDataSource: DataSource;
const testUser = {
  username: "PasswordResetEmail",
  email: "PasswordResetEmail@test.com",
  password: "PasswordResetEmail123",
};

beforeAll(async () => {
  TestDataSource = await testConnection();
  if (redisClient.status === "end") await redisClient.connect();
  if (redisTestClient.status === "end") await redisTestClient.connect();

  await User.create({
    username: testUser.username,
    email: testUser.email,
    password: testUser.password,
  }).save();
});
afterAll(async () => {
  redisClient.disconnect();
  redisTestClient.disconnect();
  await TestDataSource.destroy();
});

const sendPasswordResetEmailMutation = `
  mutation SendPasswordResetEmailMutation ($email: String!) {
    sendPasswordResetEmail(email: $email)
  }
`;

describe("USER: Send Password Reset Email Mutation", () => {
  it("returns true with valid email", async () => {
    // Send Password Reset Email
    const response = await gqlCall<boolean>({
      source: sendPasswordResetEmailMutation,
      variableValues: {
        email: testUser.email,
      },
    });

    expect(response.data).toBeTruthy();
    expect(response.errors).toBeUndefined();
    expect(response.data!.sendPasswordResetEmail).toBeTruthy();
    expect(response.data!.sendPasswordResetEmail).toEqual(true);
  });

  it("returns true with non-existent email", async () => {
    const fakeEmail = "IDONTEXIST@test.com";

    // Send Password Reset Email
    const response = await gqlCall<boolean>({
      source: sendPasswordResetEmailMutation,
      variableValues: {
        email: fakeEmail,
      },
    });

    expect(response.data).toBeTruthy();
    expect(response.errors).toBeUndefined();
    expect(response.data!.sendPasswordResetEmail).toBeTruthy();
    expect(response.data!.sendPasswordResetEmail).toEqual(true);
  });
});
