#!/usr/bin/env node

import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_URL = "https://github.com/edrlab/thorium-locales.git";
const publicLocalesPath = path.join(__dirname, "../public/locales");
const i18nFileName = "thorium-shared";

function updateLocales() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "thorium-locales-"));

  try {
    console.log(`Fetching ${ REPO_URL }...`);
    execFileSync("git", ["clone", "--depth", "1", REPO_URL, tmpDir], { stdio: "inherit" });

    const readerPath = path.join(tmpDir, "reader");
    if (!fs.existsSync(readerPath)) {
      console.error(`Source directory not found: ${ readerPath }`);
      process.exit(1);
    }

    const files = fs.readdirSync(readerPath).filter(file => file.endsWith(".json"));

    files.forEach(file => {
      const sourcePath = path.join(readerPath, file);
      const locale = file.replace(".json", "");
      const targetDir = path.join(publicLocalesPath, locale);
      const targetPath = path.join(targetDir, `${ i18nFileName }.json`);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${ targetDir }`);
      }

      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${ file } -> ${ locale }/${ i18nFileName }.json`);
    });

    console.log("Locale update completed! Review the diff in public/locales before committing.");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

updateLocales();
