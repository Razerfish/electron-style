const fs = require('fs');
require('colors');

if (!fs.existsSync("src\\bin\\neural_style\\neural_style.exe")) {
    console.error("No neural style binary found\nCompile one by running \"npm run compile\"\n".red);
    process.exit(1);
} else {
    process.exit(0);
}
