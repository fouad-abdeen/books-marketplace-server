import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));

const sourceDirctory = path.join(
  __dirname,
  "src",
  "core",
  "services",
  "notification",
  "mail",
  "templates"
);

const destinationDirctory = path.join(
  __dirname,
  "build",
  "core",
  "services",
  "notification",
  "mail",
  "templates"
);

// Create the destination directory if it doesn't exist
fs.mkdirSync(destinationDirctory, { recursive: true });

// Read all files from the source directory
fs.readdirSync(sourceDirctory).forEach((file) => {
  // Copy each file to the destination directory
  fs.copyFileSync(
    path.join(sourceDirctory, file),
    path.join(destinationDirctory, file)
  );
});
