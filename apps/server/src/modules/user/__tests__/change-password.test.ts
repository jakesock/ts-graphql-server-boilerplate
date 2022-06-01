import { NotAuthenticatedError, ServerErrorMessage, StatusCodes } from "@monorepo/errors";
import { errorMessages } from "@monorepo/yup-schemas";
import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { PasswordManager } from "../../../lib/utils";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";
import { AuthFormResponse, FieldError } from "../../../types";
import {
  changePasswordNewPasswordMustBeDifferentErrorMessage,
  changePasswordOldPasswordIncorrectErrorMessage,
  invalidLoginInputErrorMessage,
} from "../error-messages";
import { ChangeUserPasswordInput } from "../inputs";

let TestDataSource: DataSource;
const testUser = {
  username: "ChangePasswordUser",
  email: "ChangePasswordUser@test.com",
  password: "ChangePassword123",
  newPassword: "NewPassword123",
};
let dbUser: User;

beforeAll(async () => {
  TestDataSource = await testConnection();
  if (redisClient.status === "end") await redisClient.connect();
  if (redisTestClient.status === "end") await redisTestClient.connect();

  const passwordManager = new PasswordManager();
  const hashedPassword = await passwordManager.toHash(testUser.password);
  dbUser = await User.create({
    username: testUser.username,
    email: testUser.email,
    password: hashedPassword,
  }).save();
});
afterAll(async () => {
  redisClient.disconnect();
  redisTestClient.disconnect();
  await TestDataSource.destroy();
});

const changeUserPasswordMutation = `
  mutation ChangePassword($changeUserPasswordInput: ChangeUserPasswordInput!) {
    changeUserPassword(changeUserPasswordInput: $changeUserPasswordInput) {
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

const loginUserMutation = `
  mutation LoginUser($loginUserInput: LoginUserInput!) {
    loginUser(loginUserInput: $loginUserInput) {
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

describe("USER: Change User Password Mutation", () => {
  it("returns error if user not logged in", async () => {
    const { password, newPassword } = testUser;

    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: password,
      password: newPassword,
      confirmPassword: newPassword,
    };

    const response = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
    });

    const error = response.errors![0];
    const originalError = error.originalError as NotAuthenticatedError;

    expect(response.errors).toBeTruthy();
    expect(error).toBeTruthy();
    expect(error.message).toEqual(ServerErrorMessage.NOT_AUTHENTICATED);
    expect(originalError.statusCode).toEqual(StatusCodes.NOT_AUTHORIZED);
  });

  it("returns error if old password is incorrect", async () => {
    const wrongPassword = "WrongPassword123";
    const { newPassword } = testUser;
    const expectedErrors: FieldError[] = [
      {
        field: "oldPassword",
        message: changePasswordOldPasswordIncorrectErrorMessage,
      },
    ];

    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: wrongPassword,
      password: newPassword,
      confirmPassword: newPassword,
    };

    const response = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
      userId: dbUser.id,
    });

    const { errors } = response.data!.changeUserPassword;

    expect(errors).toBeTruthy();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if old password and new password are the same", async () => {
    const { password } = testUser;
    const expectedErrors: FieldError[] = [
      {
        field: "password",
        message: changePasswordNewPasswordMustBeDifferentErrorMessage,
      },
    ];

    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: password,
      password,
      confirmPassword: password,
    };

    const response = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
      userId: dbUser.id,
    });

    const { errors } = response.data!.changeUserPassword;

    expect(errors).toBeTruthy();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if new password does not meet requirements", async () => {
    const { password } = testUser;
    const invalidPassword = "abc";
    const expectedErrors: FieldError[] = [
      {
        field: "password",
        message: errorMessages.user.password.tooShort,
      },
      {
        field: "password",
        message: errorMessages.user.password.invalidRegEx,
      },
    ];

    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: password,
      password: invalidPassword,
      confirmPassword: invalidPassword,
    };

    const response = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
      userId: dbUser.id,
    });

    const { errors } = response.data!.changeUserPassword;

    expect(errors).toBeTruthy();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if new password is too long", async () => {
    const { password } = testUser;
    const invalidPassword =
      "Abcdefghijklmnopqrstuvwxyz123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
    const expectedErrors: FieldError[] = [
      {
        field: "password",
        message: errorMessages.user.password.tooLong,
      },
    ];

    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: password,
      password: invalidPassword,
      confirmPassword: invalidPassword,
    };

    const response = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
      userId: dbUser.id,
    });

    const { errors } = response.data!.changeUserPassword;

    expect(errors).toBeTruthy();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if new passwords do not match", async () => {
    const { password, newPassword } = testUser;
    const wrongPassword = "WrongPassword123";
    const expectedErrors: FieldError[] = [
      {
        field: "confirmPassword",
        message: errorMessages.common.fieldsDoNotMatch("Passwords"),
      },
    ];

    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: password,
      password: newPassword,
      confirmPassword: wrongPassword,
    };

    const response = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
      userId: dbUser.id,
    });

    const { errors } = response.data!.changeUserPassword;

    expect(errors).toBeTruthy();
    expect(errors).toEqual(expectedErrors);
  });

  it("changes user password with valid input", async () => {
    const { username, email, password, newPassword } = testUser;

    // Login user with old password (should succeed)
    const firstLoginResponse = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: username,
          password,
        },
      },
    });

    expect(firstLoginResponse.data!.loginUser).toBeTruthy();
    expect(firstLoginResponse.data!.loginUser).toMatchObject({
      user: {
        username,
        email,
        isConfirmed: false,
      },
    });

    // Change password (should succeed)
    const expectedChangePasswordDataResponse = {
      changeUserPassword: {
        user: {
          username,
          email,
          isConfirmed: false,
        },
        errors: null,
      },
    };
    const changeUserPasswordInput: ChangeUserPasswordInput = {
      oldPassword: password,
      password: newPassword,
      confirmPassword: newPassword,
    };

    const changeUserPasswordResponse = await gqlCall<AuthFormResponse>({
      source: changeUserPasswordMutation,
      variableValues: {
        changeUserPasswordInput,
      },
      userId: dbUser.id,
    });

    expect(changeUserPasswordResponse.data!.changeUserPassword).toBeTruthy();
    expect(changeUserPasswordResponse.data!.changeUserPassword.errors).toBeFalsy();
    expect(changeUserPasswordResponse.data).toMatchObject(expectedChangePasswordDataResponse);

    // Login user with old password (should fail)
    const expectedErrorsArray: FieldError[] = [
      {
        field: "usernameOrEmail",
        message: invalidLoginInputErrorMessage,
      },
      {
        field: "password",
        message: invalidLoginInputErrorMessage,
      },
    ];
    const expectedFailedLoginDataResponse = {
      loginUser: {
        user: null,
        errors: expectedErrorsArray,
      },
    };
    const failedLoginResponse = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: username,
          password,
        },
      },
    });

    expect(failedLoginResponse.data).toBeTruthy();
    expect(failedLoginResponse.data).toMatchObject(expectedFailedLoginDataResponse);

    // Login user with new password (should succeed)
    const lastLoginResponse = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: username,
          password: newPassword,
        },
      },
    });

    expect(lastLoginResponse.data!.loginUser).toBeTruthy();
    expect(lastLoginResponse.data!.loginUser).toMatchObject({
      user: {
        username,
        email,
        isConfirmed: false,
      },
    });
  });
});
