const fs = require('fs');
const exec = require('child_process').exec;

if (!fs.existsSync("Assets\\bin\\neural_style\\neural_style.exe")) {
    console.log("neural_style.exe not found, recompiling...");
    compile_process = exec('npm run compile-neural-style');

    compile_process.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    compile_process.on('exit', (code) => {
        if (code != 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
} else {
    process.exit(0);
}
