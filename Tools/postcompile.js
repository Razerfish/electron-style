const fs = require('fs');
const rimraf = require('rimraf');

try {
    rimraf.sync("Assets\\bin\\build");
} catch (e) {
    console.error(e);
    console.error("Could not remove build folder");
}

try {
    fs.unlinkSync("neural_style.spec");
} catch (e) {
    console.error(e);
    console.error("Could not remove neural_style.spec");
}

if (!fs.existsSync("Assets\\Executables\\build") && !fs.existsSync("neural_style.spec")) {
    process.exit(0);
} else {
    console.error("Could not remove all work files");
    process.exit(1);
}