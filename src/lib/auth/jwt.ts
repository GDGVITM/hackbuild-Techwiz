import { SignJWT, jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface JWTPayloadWithUser extends JWTPayload {
  userId: string;
  role: string;
  email?: string;
}

export const signToken = (
  payload: Omit<JWTPayloadWithUser, 'iat' | 'exp'>,
  expiresIn: string = "7d"
): Promise<string> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

export const verifyToken = async <T = JWTPayloadWithUser>(token: string): Promise<T> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error("Token verification failed");
  }
};

export const decodeToken = async <T = JWTPayloadWithUser>(token: string): Promise<T | null> => {
  try {
    return await verifyToken<T>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): Promise<boolean> => {
  return decodeToken(token).then(payload => {
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  });
};