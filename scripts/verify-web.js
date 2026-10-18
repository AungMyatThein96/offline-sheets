
const fs = require("fs");
const path = require("path");

const webDir = path.join(__dirname, "..", "www");
const indexFile = path.join(webDir, "index.html");

if (!fs.existsSync(indexFile)) {
  console.error("ERROR: www/index.html was not found.");
  console.error("Create www/index.html before building the APK.");
  process.exit(1);
}

console.log("Web app verification passed.");
console.log("Found:", indexFile);
