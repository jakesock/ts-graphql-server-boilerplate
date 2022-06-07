import { errorMessages } from "@monorepo/yup-schemas";
import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";
import { AuthFormResponse, FieldError } from "../../../types";
import { invalidExpiredConfirmationCodeErrorMessage } from "../error-messages";

let TestDataSource: DataSource;
const testUser = {
  username: "ResetPassword",
  email: "ResetPassword@test.com",
  password: "ResetPassword123",
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

const resetUserPasswordMutation = `
  mutation ResetUserPasswordMutation($resetPasswordInput: ResetUserPasswordInput!) {
    resetUserPassword(resetPasswordInput: $resetPasswordInput) {
      user {
        id
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

describe("USER: Reset User Password Mutation", () => {
  it("returns errors with invalid input", async () => {
    const invalidToken = "12345";
    const invalidPassword = "te1";
    const invalidConfirmPassword = "te2";
    const expectedErrorsResponse: FieldError[] = [
      {
        field: "token",
        message: errorMessages.common.invalidToken,
      },
      {
        field: "password",
        message: errorMessages.user.password.tooShort,
      },
      {
        field: "password",
        message: errorMessages.user.password.invalidRegEx,
      },
      {
        field: "confirmPassword",
        message: errorMessages.common.fieldsDoNotMatch("Passwords"),
      },
    ];

    // Reset User Password
    const response = await gqlCall<AuthFormResponse>({
      source: resetUserPasswordMutation,
      variableValues: {
        resetPasswordInput: {
          token: invalidToken,
          password: invalidPassword,
          confirmPassword: invalidConfirmPassword,
        },
      },
    });

    expect(response.data).toBeDefined();
    expect(response.errors).toBeUndefined();
    expect(response.data!.resetUserPassword.user).toBeFalsy();
    expect(response.data!.resetUserPassword.errors).toEqual(expectedErrorsResponse);
  });

  it("returns error with non-existent token", async () => {
    const nonExistentToken = "123456789012345678901234567890ab";
    const password = "ValidPass123";
    const expectedErrorsResponse: FieldError[] = [
      {
        field: "token",
        message: invalidExpiredConfirmationCodeErrorMessage,
      },
    ];

    // Reset User Password
    const response = await gqlCall<AuthFormResponse>({
      source: resetUserPasswordMutation,
      variableValues: {
        resetPasswordInput: {
          token: nonExistentToken,
          password,
          confirmPassword: password,
        },
      },
    });

    expect(response.data).toBeDefined();
    expect(response.errors).toBeUndefined();
    expect(response.data!.resetUserPassword.user).toBeFalsy();
    expect(response.data!.resetUserPassword.errors).toEqual(expectedErrorsResponse);
  });
});
