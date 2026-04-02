import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const outDir = path.join(import.meta.dirname, "public", "screenshots");
fs.mkdirSync(outDir, { recursive: true });

const urls = [
  // Launched
  { name: "tron-light-cycles", url: "https://tron-mp-party.st-patrick.partykit.dev" },
  { name: "liquid-mirror", url: "https://codepen.io/patrickreinbold/pen/pvEVMwq" },
  { name: "blackforest-interiors", url: "https://blackforest-interiors.de" },
  { name: "synapse-agentur", url: "https://synapse-agentur.de" },
  { name: "winteracademy2025", url: "https://winteracademy2025.de" },
  { name: "style-my-space", url: "https://style-my-space.com" },
  { name: "introdote-dashboard", url: "https://introdote.patrickreinbold.com" },
  // Live subdomains
  { name: "dailymoji", url: "https://dailymoji.patrickreinbold.com" },
  { name: "strategizer", url: "https://strategizer.patrickreinbold.com" },
  { name: "brain-teasers", url: "https://brain-teasers.patrickreinbold.com" },
  { name: "timekeeper", url: "https://timekeeper.patrickreinbold.com" },
  { name: "thinks", url: "https://thinks.patrickreinbold.com" },
  { name: "sex-pistol", url: "https://sex-pistol.patrickreinbold.com" },
  { name: "job-work-dashboard", url: "https://job-work-dashboard.patrickreinbold.com" },
  { name: "appaday", url: "https://appaday.patrickreinbold.com" },
  { name: "resume", url: "https://resume.patrickreinbold.com" },
  { name: "recurrr", url: "https://recurrr.patrickreinbold.com" },
  { name: "formbuilder", url: "https://formbuilder.patrickreinbold.com" },
  { name: "indexcards", url: "https://indexcards.patrickreinbold.com" },
  { name: "vinyls", url: "https://vinyls.patrickreinbold.com" },
  { name: "writing", url: "https://writing.patrickreinbold.com" },
  { name: "pizula", url: "https://pizula.patrickreinbold.com" },
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--window-size=1280,800"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const { name, url } of urls) {
    const outFile = path.join(outDir, `${name}.webp`);
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: outFile, type: "webp", quality: 80 });
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.log(`  ✗ ${name} — ${(e as Error).message.slice(0, 80)}`);
    }
  }

  await browser.close();
  console.log(`\nDone. ${urls.length} screenshots in ${outDir}`);
}

run();
