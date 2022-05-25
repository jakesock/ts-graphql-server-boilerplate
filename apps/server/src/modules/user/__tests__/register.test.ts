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

describe("USER: Register User Mutation", () => {
  it("creates user with valid input", async () => {
    const username = "RegisterUser";
    const email = "RegisterUser@test.com";
    const password = "RegisterUser123";

    const response = await gqlCall({
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
});
