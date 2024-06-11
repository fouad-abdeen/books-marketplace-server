import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { env } from "../../config/env.config.js";

export class AuthHashService {
  constructor() {}

  /**
   * Hashes a password
   * @param {string} password password to hash
   * @returns {string} hashed password
   */
  hashPassword(password) {
    // Bcrypt is an adaptive hash function as we are able to increase the number of iterations
    // performed by the function based on a passed key factor, the cost.
    // This adaptability is what allows us to compensate for increasing computer power,
    // but it comes with an opportunity cost: speed or security?
    // Check how does bcrypt work:
    // https://auth0.com/blog/hashing-in-action-understanding-bcrypt/#How-does--bcrypt--work-

    return hashSync(password, AuthHashService.generateSalt());
  }

  /**
   * Verifies a password against a hashed password
   * @param {string} password password to verify
   * @param {string} hash hashed password
   * @returns {boolean} true if the password matches the hashed password and false otherwise
   */
  verifyPassword(password, hash) {
    // Since We are not storing the salt, how does bcrypt's compare function know which salt to use?
    // Looking at an example hash/salt result,
    // notice how the hash is the salt with the hash appended to it:
    // Salt: $2b$10$3euPcmQFCiblsZeEu5s7p.
    // Hash: $2b$10$3euPcmQFCiblsZeEu5s7p.9OVHgeHWFDk9nhMqZ0m/3pd/lhwZgES
    // Compare function deduces the salt from the hash and can then
    // hash the provided password correctly for comparison.

    return compareSync(password, hash);
  }

  /**
   * Generates a salt for hashing
   * @returns a string representing the salt
   */
  static generateSalt() {
    // Salt rounds represent the cost or work factor
    const saltRounds = env.auth.hashingSaltRounds;

    // The challenge of security engineers is to decide what cost to set for the function.
    // This cost is also known as the work factor.
    // OWASP recommends as a common rule of thumb for work factor setting to tune the cost
    // so that the function runs as slow as possible without affecting the users' experience
    // and without increasing the need to use additional hardware that may be over budget.
    // Check bcrypt best practices below:
    // https://auth0.com/blog/hashing-in-action-understanding-bcrypt/#-bcrypt--Best-Practices

    // How to precisely decide the number of salt rounds?
    // Check this answer: https://security.stackexchange.com/a/17238

    return genSaltSync(saltRounds < 10 || !saltRounds ? 10 : saltRounds);
  }
}
