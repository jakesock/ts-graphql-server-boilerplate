import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { PasswordManager } from "../../../lib/utils";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";
import { AuthFormResponse, FieldError } from "../../../types";
import { invalidLoginInputErrorMessage } from "../error-messages";

let TestDataSource: DataSource;
const testUser = {
  username: "LoginUser",
  email: "LoginUser@test.com",
  password: "LoginUser123",
};

const expectedUsernameError: FieldError = {
  field: "usernameOrEmail",
  message: invalidLoginInputErrorMessage,
};
const expectedPasswordError: FieldError = {
  field: "password",
  message: invalidLoginInputErrorMessage,
};
const expectedErrorsArray: FieldError[] = [expectedUsernameError, expectedPasswordError];
const expectedInvalidDataResponse = {
  loginUser: {
    user: null,
    errors: expectedErrorsArray,
  },
};

beforeAll(async () => {
  TestDataSource = await testConnection();
  if (redisClient.status === "end") await redisClient.connect();
  if (redisTestClient.status === "end") await redisTestClient.connect();

  const passwordManager = new PasswordManager();
  const hashedPassword = await passwordManager.toHash(testUser.password);
  await User.create({
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

describe("USER: Login User Mutation", () => {
  it("returns user with valid input", async () => {
    const { username, email, password } = testUser;

    const response = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: username,
          password,
        },
      },
    });

    expect(response.data!.loginUser).toBeTruthy();
    expect(response.data!.loginUser).toMatchObject({
      user: {
        username,
        email,
        isConfirmed: false,
      },
    });
  });

  it("returns user with email login", async () => {
    const { username, email, password } = testUser;

    const response = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: email,
          password,
        },
      },
    });

    expect(response.data!.loginUser).toBeTruthy();
    expect(response.data!.loginUser).toMatchObject({
      user: {
        username,
        email,
        isConfirmed: false,
      },
      errors: null,
    });
  });

  it("returns error with invalid username/email", async () => {
    const response = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: "INVALID_INPUT",
          password: testUser.password,
        },
      },
    });

    expect(response.data).toBeTruthy();
    expect(response.data).toMatchObject(expectedInvalidDataResponse);
  });

  it("returns error with invalid password", async () => {
    const response = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: testUser.username,
          password: "INVALID_INPUT",
        },
      },
    });

    expect(response.data).toBeTruthy();
    expect(response.data).toMatchObject(expectedInvalidDataResponse);
  });

  it("returns error with nonexistent user data", async () => {
    const response = await gqlCall<AuthFormResponse>({
      source: loginUserMutation,
      variableValues: {
        loginUserInput: {
          usernameOrEmail: "INVALID_INPUT",
          password: "INVALID_INPUT",
        },
      },
    });

    expect(response.data).toBeTruthy();
    expect(response.data).toMatchObject(expectedInvalidDataResponse);
  });
});
