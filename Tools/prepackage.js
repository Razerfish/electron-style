const fs = require('fs');
require('colors');

if (!fs.existsSync("./src/bin/torchbrain/torchbrain.exe")) {
    console.error("No torchbrain binary found\nCompile one by running \"npm run compile\"\n".red);
    process.exit(1);
} else {
    process.exit(0);
}
