const fs = require('fs');
const path = require('path');

require('colors');

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

/**
 * @function compare_files
 * @description Compares the contents of two directories.
 * @param {*} dir1 String. Path to parent directory.
 * @param {*} dir2 String. Path to child directory.
 * @returns A list of missing files, if no files are missing the list will be empty.
 */
function compare_files(dir1, dir2) {
    const fs = require('fs');

    require('colors');

    const parent_files = walkSync(dir1);
    const child_files = walkSync(dir2);

    let missing = [];
    for (var i=0; i < parent_files.length; i++) {
        if (!child_files.includes(parent_files[i])) {
            missing.push(parent_files[i]);
        }
    }
    return missing;
}

if (fs.existsSync("./out/Electron Style-win32-x64")) {
    if (fs.existsSync("./src/bin/neural_style")) {
        var missing = compare_files("./src/bin", "./out/Electron Style-win32-x64");
        if (missing.length !== 0) {
            let fail_message = "Missing files: ";
            for (var i=0; i < missing.length; i++) {
                if (i < missing.length - 1) {
                    fail_message += missing[i] + " ";
                } else {
                    fail_message += missing[i];
                }
            }
            
            console.error(fail_message.red + "\n");
            process.exit(1);
        } else {
            console.log("All files packaged.".green + "\n");
            process.exit(0);
        }
    } else {
        console.error("No compiled neural style found at ./src/bin/neural_style".red + "\n");
        process.exit(1);
    }
} else {
    console.error("No packaged project found at ./out/Electron Style-win32-x64".red + "\n");
    process.exit(1);
}
