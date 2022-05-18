import { DataSource } from "typeorm";
import { User } from "../../../entity";
import { redisClient } from "../../../lib/config";
import { gqlCall, redisTestClient, testConnection } from "../../../test/utils";

let TestDataSource: DataSource;

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

describe("AUTH: Register Mutation", () => {
  it("creates user with valid input", async () => {
    const user = {
      username: "testboy",
      email: "testboy@test.com",
      password: "Test123",
    };

    const response = await gqlCall({
      source: registerMutation,
      variableValues: {
        registerUserInput: {
          username: user.username,
          email: user.email,
          confirmEmail: user.email,
          password: user.password,
          confirmPassword: user.password,
        },
      },
    });

    expect(response).toMatchObject({
      data: {
        registerUser: {
          user: {
            username: "testboy",
            email: "testboy@test.com",
            isConfirmed: false,
          },
          errors: null,
        },
      },
    });

    const databaseUser = await User.findOne({ where: { email: user.email } });
    expect(databaseUser).toBeDefined();
    expect(databaseUser!.isConfirmed).toBeFalsy();
    expect(databaseUser!.username).toBe(user.username);
    expect(databaseUser!.email).toBe(user.email);
  });
});
