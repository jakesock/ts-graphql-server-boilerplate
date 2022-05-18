import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

/**
 * Represents our Password Manager.
 * Hashes and compares strings.
 */
export class PasswordManager {
  /**
   * Hashes provided password using SCrypt.
   * @param {string} password - Password given by a user upon registration.
   * @return {string} Hashed password represented by a buffer and a salt.
   */
  async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString("hex");
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buffer.toString("hex")}.${salt}`;
  }

  /**
   * Compares stored & hashed password with given password.
   * @param {string} storedPassword - Hashed password stored for a given user.
   * @param {string} suppliedPassword - Plain-text password provided by user.
   * @return {boolean} Whether or not the hashed password and the supplied password match.
   */
  async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buffer.toString("hex") === hashedPassword;
  }
}
