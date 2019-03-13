const fs = require('fs');

if (fs.existsSync("Assets\\bin\\neural_style\\neural_style.exe")) {
    process.exit(0);
} else {
    console.error("neural_style.exe not found, recompile by running 'npm run compile'");
    process.exit(1);
}