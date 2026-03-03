#!/usr/bin/env node
/**
 * Web-only build for Firebase Hosting.
 * Run: npm run build  (uses expo export -p web; output in dist/)
 */

const { spawn } = require("child_process");
const path = require("path");

const isWindows = process.platform === "win32";
const npx = isWindows ? "npx.cmd" : "npx";

const child = spawn(
  npx,
  ["expo", "export", "-p", "web"],
  {
    stdio: "inherit",
    shell: isWindows,
    cwd: path.resolve(__dirname, ".."),
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
