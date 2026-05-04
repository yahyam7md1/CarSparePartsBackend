export type AuthEnv = {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
};

function readSecret(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const t = value.trim().replace(/^["']|["']$/g, "");
  return t.length > 0 ? t : undefined;
}

export function getAuthEnv(): AuthEnv {
  const jwtSecret = readSecret(process.env.JWT_SECRET);
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      "JWT_SECRET is required and must be at least 32 characters long.",
    );
  }

  const jwtExpiresIn =
    process.env.JWT_EXPIRES_IN ??
    process.env.JWT_EXPIRATION_TIME ??
    "8h";
  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS);
  const rounds =
    Number.isFinite(bcryptRounds) && bcryptRounds >= 10 && bcryptRounds <= 16
      ? bcryptRounds
      : 12;

  return {
    jwtSecret,
    jwtExpiresIn,
    bcryptRounds: rounds,
  };
}
