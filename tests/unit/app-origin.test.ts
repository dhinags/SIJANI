import { describe, expect, it } from "vitest";
import { allowedAppOrigins, isAllowedAppOrigin, secureSessionCookie } from "../../src/lib/app-origin";

const preview = {
  VERCEL: "1", VERCEL_ENV: "preview",
  VERCEL_URL: "sijani-deployment-team.vercel.app",
  VERCEL_BRANCH_URL: "sijani-git-phase4-team.vercel.app"
};

describe("deployment origin and session security", () => {
  it("allows the exact local origin and rejects absent, foreign, and lookalike origins", () => {
    const env = { APP_ORIGIN: "http://localhost:3000" };
    expect(isAllowedAppOrigin(env.APP_ORIGIN, env)).toBe(true);
    for (const origin of [null, "null", "http://localhost:3001", "https://attacker.example", "http://localhost:3000.attacker.example"]) {
      expect(isAllowedAppOrigin(origin, env)).toBe(false);
    }
    expect(isAllowedAppOrigin("https://sijani.example", {})).toBe(false);
    expect(secureSessionCookie(env)).toBe(false);
  });

  it("allows only this Vercel preview deployment and its configured branch alias", () => {
    expect(isAllowedAppOrigin(`https://${preview.VERCEL_URL}`, preview)).toBe(true);
    expect(isAllowedAppOrigin(`https://${preview.VERCEL_BRANCH_URL}`, preview)).toBe(true);
    for (const origin of [null, "null", `http://${preview.VERCEL_URL}`, "https://another-project.vercel.app", `https://${preview.VERCEL_URL}.attacker.example`]) {
      expect(isAllowedAppOrigin(origin, preview)).toBe(false);
    }
    expect(secureSessionCookie(preview)).toBe(true);
  });

  it("requires an explicit production/custom origin and never enables preview trust locally", () => {
    const production = { ...preview, VERCEL_ENV: "production", APP_ORIGIN: "https://sijani.example" };
    expect(allowedAppOrigins(production)).toEqual([production.APP_ORIGIN]);
    expect(isAllowedAppOrigin(`https://${preview.VERCEL_URL}`, production)).toBe(false);
    expect(allowedAppOrigins({ ...preview, VERCEL: undefined })).toEqual([]);
    expect(secureSessionCookie({ APP_ORIGIN: "https://sijani.example" })).toBe(true);
    expect(allowedAppOrigins({ ...preview, APP_ORIGIN: production.APP_ORIGIN })).toContain(production.APP_ORIGIN);
  });

  it("rejects malformed deployment hostnames instead of accepting paths or external domains", () => {
    for (const hostname of ["attacker.example", "vercel.app", "https://sijani.vercel.app", "sijani.vercel.app/path", "sijani.vercel.app:443", "sijani.vercel.app@attacker.example", "sijani.vercel.app.attacker.example"]) {
      expect(allowedAppOrigins({ ...preview, VERCEL_URL: hostname, VERCEL_BRANCH_URL: hostname })).toEqual([]);
    }
  });
});
