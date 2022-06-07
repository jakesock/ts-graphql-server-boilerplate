import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";

let TestDataSource: DataSource;
let userId: string;
const testUser = {
  username: "ConfirmationCode",
  email: "ConfirmationCode@test.com",
  password: "ConfirmationCode123",
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

const sendNewConfirmationCodeMutation = `
  mutation SendNewConfirmationCodeMutation($sendNewConfirmationCodeInput: SendNewConfirmationCodeInput!) {
    sendNewConfirmationCode(sendNewConfirmationCodeInput: $sendNewConfirmationCodeInput)
  }
`;

describe("USER: Send New Confirmation Code Mutation", () => {
  it("returns true on successful email send", async () => {
    // Send New Confirmation Code
    const response = await gqlCall<boolean>({
      source: sendNewConfirmationCodeMutation,
      variableValues: {
        sendNewConfirmationCodeInput: {
          userId,
          userEmail: testUser.email,
        },
      },
    });

    expect(response.data).toBeTruthy();
    expect(response.errors).toBeUndefined();
    expect(response.data!.sendNewConfirmationCode).toBeTruthy();
    expect(response.data!.sendNewConfirmationCode).toEqual(true);
  });
});
