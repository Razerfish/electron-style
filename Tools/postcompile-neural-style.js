const fs = require('fs');
const rimraf = require('rimraf');

rimraf.sync("Assets\\Executables\\build");

fs.unlinkSync("neural_style.spec");

if (!fs.existsSync("Assets\\Executables\\build") && !fs.existsSync("neural_style.spec")) {
    process.exit(0);
} else {
    console.error("Could not remove all work files");
    process.exit(1);
}