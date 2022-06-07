import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";
import { AuthFormResponse, FieldError } from "../../../types";
import { invalidExpiredConfirmationCodeErrorMessage } from "../error-messages";

let TestDataSource: DataSource;
const testUser = {
  username: "ConfirmEmail",
  email: "ConfirmEmail@test.com",
  password: "ConfirmEmail123",
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

const confirmUserEmailMutation = `
  mutation ConfirmUserEmailMutation($code: String!) {
    confirmUserEmail(code: $code) {
      user {
        username
        email
        isConfirmed
      }
      errors {
        field
        message
      }
    }
  }
`;

describe("USER: Confirm User Email Mutation", () => {
  it("returns error with invalid code", async () => {
    const invalidCode = "12345";
    const expectedErrorsResponse: FieldError[] = [
      {
        field: "code",
        message: invalidExpiredConfirmationCodeErrorMessage,
      },
    ];

    // Confirm User Email
    const response = await gqlCall<AuthFormResponse>({
      source: confirmUserEmailMutation,
      variableValues: {
        code: invalidCode,
      },
    });

    expect(response.data).toBeDefined();
    expect(response.errors).toBeUndefined();
    expect(response.data!.confirmUserEmail.user).toBeFalsy();
    expect(response.data!.confirmUserEmail.errors).toEqual(expectedErrorsResponse);

    const dbUser = await User.findOne({ where: { email: testUser.email } });
    expect(dbUser).toBeDefined();
    expect(dbUser!.isConfirmed).toBeFalsy();
  });
});
