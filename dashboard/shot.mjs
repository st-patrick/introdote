/**
 * shot.mjs — one-off local preview screenshot via real Chrome CDP.
 *
 * Usage: node shot.mjs <file-or-url> [out-png]
 *
 * Useful during site development for quick visual QA without running
 * the full take-screenshots.ts batch. Writes a viewport-sized PNG and
 * a full-page PNG for the same target.
 *
 * Uses real Chrome via DevTools Protocol — see
 * ~/.introdote/PLAYBOOK.md → "RULE: REAL CHROME VIA CDP".
 */

import puppeteer from "puppeteer-core";
import { spawn } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir, platform } from "os";
import path from "path";
import net from "net";

function resolveChromeBinary() {
  if (process.env.CHROME_BINARY) return process.env.CHROME_BINARY;
  switch (platform()) {
    case "darwin":
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    case "win32":
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    default:
      return "/usr/bin/google-chrome-stable";
  }
}

const target = process.argv[2];
if (!target) {
  console.error("usage: node shot.mjs <file-or-url> [out-png]");
  process.exit(1);
}
const out = process.argv[3] || "/tmp/shot.png";
const url = target.startsWith("http") ? target : "file://" + path.resolve(target);
const port = 9224;

const userDataDir = mkdtempSync(path.join(tmpdir(), "introdote-shot-"));
const proc = spawn(resolveChromeBinary(), [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  "--window-position=9999,9999",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
], { stdio: "ignore" });

await new Promise((resolve, reject) => {
  const deadline = Date.now() + 8000;
  const tryIt = () => {
    const s = net.createConnection({ port, host: "127.0.0.1" });
    s.once("connect", () => { s.destroy(); resolve(); });
    s.once("error", () => {
      s.destroy();
      if (Date.now() > deadline) reject(new Error(`port ${port} never opened`));
      else setTimeout(tryIt, 150);
    });
  };
  tryIt();
});

const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}` });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
await new Promise((r) => setTimeout(r, 2000));

await page.screenshot({ path: out, type: "png" });
const fullOut = out.replace(/\.png$/, "-full.png");
await page.screenshot({ path: fullOut, type: "png", fullPage: true });

console.log("wrote", out, "+", fullOut);
await browser.disconnect();
proc.kill("SIGTERM");
await new Promise((r) => setTimeout(r, 300));
try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
