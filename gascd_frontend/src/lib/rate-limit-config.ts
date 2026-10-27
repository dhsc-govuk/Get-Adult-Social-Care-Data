export function positiveInteger(
  name: string,
  fallback: number,
  maximum = 100000
) {
  const raw = process.env[name];
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`Invalid ${name}`);
  }
  return value;
}

export function rateLimitsEnabled() {
  // Disabling requires an explicit setting; E2E_TESTING_MODE never disables production limits.
  return process.env.RATE_LIMIT_ENABLED !== 'false';
}

export const userPolicy = () => ({
  name: 'user-api',
  windowSeconds: positiveInteger('RATE_LIMIT_USER_WINDOW_SECONDS', 60, 3600),
  max: positiveInteger('RATE_LIMIT_USER_MAX', 120),
});
