// One-command local preview: create .env from the example if missing, install
// dependencies, set up the database with the fictional sample data, start dev.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

if (!existsSync(".env")) copyFileSync(".env.example", ".env");

const run = (cmd, args) => {
  const { status } = spawnSync(cmd, args, { stdio: "inherit" });
  if (status !== 0) process.exit(status ?? 1);
};

if (!existsSync("node_modules")) run("npm", ["install"]);
run("npm", ["run", "db:setup"]);
run("npm", ["run", "dev", "--", "--port", "3100"]);
