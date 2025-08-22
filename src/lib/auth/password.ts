import bcrypt from "bcryptjs";

/**
 * Hash a plain text password
 * @param plainPassword The plain text password
 * @returns Promise<string> The hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns Promise<boolean> True if passwords match, false otherwise
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
