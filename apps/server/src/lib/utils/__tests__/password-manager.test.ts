import { PasswordManager } from "../password-manager";

const passwordManager = new PasswordManager();
const originalPassword = "ValidPass123";
let hashedPassword: string;

describe("UTILS: Password Manager", () => {
  it("should hash a password", async () => {
    hashedPassword = await passwordManager.toHash(originalPassword);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(originalPassword);
  });

  it("should return true if passwords match", async () => {
    const match = await passwordManager.compare(hashedPassword, originalPassword);
    expect(match).toEqual(true);
  });

  it("should return false if passwords do not match", async () => {
    const wrongPassword = "WrongPassword";
    const match = await passwordManager.compare(hashedPassword, wrongPassword);
    expect(match).toEqual(false);
  });
});
