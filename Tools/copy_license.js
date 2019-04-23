const fs = require('fs');
require('colors');

fs.createReadStream('./Assets/Scripts/neural_style/LICENSE').pipe(fs.createWriteStream('./src/bin/neural_style/LICENSE'));

if (fs.existsSync('./src/bin/neural_style/LICENSE')) {
    console.log("License copied successfully.".blue);
} else {
    console.error("Failed to copy license.".red);
    process.exit(1);
}
