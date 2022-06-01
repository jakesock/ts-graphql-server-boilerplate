import { errorMessages } from "@monorepo/yup-schemas";
import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";
import { AuthFormResponse, FieldError } from "../../../types";
import { emailTakenErrorMessage, usernameTakenErrorMessage } from "../error-messages";

let TestDataSource: DataSource;
const userInfo = {
  username: "RegisterUser",
  email: "RegisterUser@test.com",
  password: "RegisterUser123",
};

beforeAll(async () => {
  TestDataSource = await testConnection();
  if (redisClient.status === "end") await redisClient.connect();
  if (redisTestClient.status === "end") await redisTestClient.connect();
});
afterAll(async () => {
  redisClient.disconnect();
  redisTestClient.disconnect();
  await TestDataSource.destroy();
});

const registerMutation = `
  mutation RegisterUser($registerUserInput: RegisterUserInput!) {
    registerUser(registerUserInput: $registerUserInput) {
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

describe("USER: Register User Mutation", () => {
  it("creates user with valid input", async () => {
    const { username, email, password } = userInfo;

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email,
          confirmEmail: email,
          password,
          confirmPassword: password,
        },
      },
    });

    expect(response).toMatchObject({
      data: {
        registerUser: {
          user: {
            username,
            email,
            isConfirmed: false,
          },
          errors: null,
        },
      },
    });

    const databaseUser = await User.findOne({ where: { email } });
    expect(databaseUser).toBeDefined();
    expect(databaseUser!.isConfirmed).toBeFalsy();
    expect(databaseUser!.username).toBe(username);
    expect(databaseUser!.email).toBe(email);
  });

  it("returns errors if required input missing", async () => {
    const expectedErrors: FieldError[] = [
      {
        field: "username",
        message: errorMessages.user.username.tooShort,
      },
      {
        field: "username",
        message: errorMessages.user.username.invalidRegEx,
      },
      {
        field: "username",
        message: errorMessages.common.required,
      },
      {
        field: "email",
        message: errorMessages.common.required,
      },
      {
        field: "confirmEmail",
        message: errorMessages.common.required,
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
        field: "password",
        message: errorMessages.common.required,
      },
      {
        field: "confirmPassword",
        message: errorMessages.common.required,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username: "",
          email: "",
          confirmEmail: "",
          password: "",
          confirmPassword: "",
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns errors if username or email is already taken", async () => {
    const { username, email, password } = userInfo;
    const expectedErrors: FieldError[] = [
      {
        field: "username",
        message: usernameTakenErrorMessage,
      },
      {
        field: "email",
        message: emailTakenErrorMessage,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email,
          confirmEmail: email,
          password,
          confirmPassword: password,
        },
      },
    });
    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if username is too short", async () => {
    const { password } = userInfo;
    const email = "testboy@test.com";
    const invalidUsername = "wo";
    const expectedErrors: FieldError[] = [
      {
        field: "username",
        message: errorMessages.user.username.tooShort,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username: invalidUsername,
          email,
          confirmEmail: email,
          password,
          confirmPassword: password,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if username is too long", async () => {
    const { password } = userInfo;
    const invalidUsername = "abcdefghijklmnopqrstuvwxyz";
    const email = "testboy@test.com";
    const expectedErrors: FieldError[] = [
      {
        field: "username",
        message: errorMessages.user.username.tooLong,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username: invalidUsername,
          email,
          confirmEmail: email,
          password,
          confirmPassword: password,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if username contains invalid characters", async () => {
    const { password } = userInfo;
    const invalidUsername = "abc?*&";
    const email = "testboy@test.com";
    const expectedErrors: FieldError[] = [
      {
        field: "username",
        message: errorMessages.user.username.invalidRegEx,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username: invalidUsername,
          email,
          confirmEmail: email,
          password,
          confirmPassword: password,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if email is invalid", async () => {
    const { password } = userInfo;
    const username = "testboy";
    const invalidEmail = "testboytest.com";
    const expectedErrors: FieldError[] = [
      {
        field: "email",
        message: errorMessages.user.email.invalid,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email: invalidEmail,
          confirmEmail: invalidEmail,
          password,
          confirmPassword: password,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if emails do not match", async () => {
    const { password } = userInfo;
    const username = "testboy";
    const email = "testboy@test.com";
    const invalidConfirmEmail = "testboy23@test.com";
    const expectedErrors: FieldError[] = [
      {
        field: "confirmEmail",
        message: errorMessages.common.fieldsDoNotMatch("Emails"),
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email,
          confirmEmail: invalidConfirmEmail,
          password,
          confirmPassword: password,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns errors if password doesn't match requirements", async () => {
    const username = "testboy";
    const email = "testboy@test.com";
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

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email,
          confirmEmail: email,
          password: invalidPassword,
          confirmPassword: invalidPassword,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns errors if password is too long", async () => {
    const username = "testboy";
    const email = "testboy@test.com";
    const invalidPassword =
      "Abcdefghijklmnopqrstuvwxyz123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
    const expectedErrors: FieldError[] = [
      {
        field: "password",
        message: errorMessages.user.password.tooLong,
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email,
          confirmEmail: email,
          password: invalidPassword,
          confirmPassword: invalidPassword,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });

  it("returns error if passwords do not match", async () => {
    const username = "testboy";
    const email = "testboy@test.com";
    const { password } = userInfo;
    const invalidConfirmPassword = "Test123456789";
    const expectedErrors: FieldError[] = [
      {
        field: "confirmPassword",
        message: errorMessages.common.fieldsDoNotMatch("Passwords"),
      },
    ];

    const response = await gqlCall<AuthFormResponse>({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username,
          email,
          confirmEmail: email,
          password,
          confirmPassword: invalidConfirmPassword,
        },
      },
    });

    const { errors } = response.data!.registerUser;

    expect(errors).toBeDefined();
    expect(errors).toEqual(expectedErrors);
  });
});
