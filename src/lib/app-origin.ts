type Environment = Record<string, string | undefined>;

// Only deployment configuration establishes trust; never use request Host or
// forwarded headers to decide whether a mutation's Origin is allowed.
export function allowedAppOrigins(env: Environment = process.env): string[] {
  const origins = env.APP_ORIGIN ? [env.APP_ORIGIN] : [];
  if (env.VERCEL === "1" && env.VERCEL_ENV === "preview") {
    for (const hostname of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
      if (hostname && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/.test(hostname)) {
        origins.push(`https://${hostname}`);
      }
    }
  }
  return origins;
}

export function isAllowedAppOrigin(origin: string | null, env: Environment = process.env): boolean {
  return origin !== null && allowedAppOrigins(env).includes(origin);
}

export function secureSessionCookie(env: Environment = process.env): boolean {
  return env.VERCEL === "1" || env.APP_ORIGIN?.startsWith("https://") === true;
}
