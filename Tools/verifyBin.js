const fs = require('fs');
require('colors');

/* eslint-disable */
function walkSync(dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(dir + '/' + file).isDirectory()) {
        filelist = walkSync(dir + '/' + file + '/', filelist);
      }
      else {
        filelist.push(file);
      }
    });
    return filelist;
}
/* eslint-enable */

/**
 * @function compareFiles
 * @description Compares the contents of two directories.
 * @param {*} dir1 String. Path to parent directory.
 * @param {*} dir2 String. Path to child directory.
 * @returns A list of missing files, if no files are missing the list will be empty.
 */
function compareFiles(dir1, dir2) {
    const parentFiles = walkSync(dir1);
    const childFiles = walkSync(dir2);

    const missing = [];
    for (let i = 0; i < parentFiles.length; i++) {
        if (!childFiles.includes(parentFiles[i])) {
            missing.push(parentFiles[i]);
        }
    }
    return missing;
}

if (fs.existsSync("./out/Electron Style-win32-x64")) {
    if (fs.existsSync("./src/bin/neural_style")) {
        const missing = compareFiles("./src/bin", "./out/Electron Style-win32-x64");
        if (missing.length !== 0) {
            let failMessage = "Missing file(s): ";
            for (let i = 0; i < missing.length; i++) {
                if (i < missing.length - 1) {
                    failMessage += `${missing[i]} `;
                } else {
                    failMessage += missing[i];
                }
            }
            
            console.error(`${failMessage}\n`.red);
            process.exit(1);
        } else {
            console.log("All files packages.\n".green);
            process.exit(0);
        }
    } else {
        console.error("No neural style binary found at ./src/bin/neural_style\n".red);
        process.exit(1);
    }
} else {
    console.error("No packaged project found at ./out/Electron Style-win32-x64\n".red);
    process.exit(1);
}
