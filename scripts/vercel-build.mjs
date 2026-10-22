import { spawnSync } from "node:child_process";

function run(script) {
  const result = spawnSync("npm", ["run", script], { stdio: "inherit" });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}

if (process.env.VERCEL_ENV === "preview") {
  let database;
  try { database = new URL(process.env.DATABASE_URL ?? ""); } catch { /* Report configuration only, never the URL. */ }
  if (process.env.APP_MODE !== "demo" || !database ||
      !["postgresql:", "postgres:"].includes(database.protocol) ||
      !database.username || !database.password ||
      ["localhost", "127.0.0.1", "[::1]"].includes(database.hostname)) {
    console.error("Preview requires APP_MODE=demo and DATABASE_URL for a separate, authenticated managed PostgreSQL database. Do not use the local example or a production database.");
    process.exit(1);
  }
  run("db:generate");
  run("db:migrate");
  run("db:seed");
}

// Production builds never automatically migrate or seed demo content.
run("build");
