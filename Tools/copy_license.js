const fs = require('fs');

fs.createReadStream('./Assets/Scripts/neural_style/LICENSE').pipe(fs.createWriteStream('./src/bin/neural_style/LICENSE'));

if (fs.existsSync('./src/bin/neural_style/LICENSE')) {
    // "\x1b[34m" makes the text blue. "\x1b[37m" makes the text white again.
    console.log("\x1b[34m" + "License copied successfully." + "\x1b[37m" + "\n");
} else {
    console.error("Failed to copy license.");
    process.exit(1);
}
