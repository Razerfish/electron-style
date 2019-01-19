const execSync = require('child_process').execSync;

/**
 * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
 *
 * This function was born in http://stackoverflow.com/a/6832721.
 *
 * @param {string} v1 The first version to be compared.
 * @param {string} v2 The second version to be compared.
 * @param {object} [options] Optional flags that affect comparison behavior:
 * <ul>
 *     <li>
 *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
 *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
 *         "1.2".
 *     </li>
 *     <li>
 *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
 *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
 *     </li>
 * </ul>
 * @returns {number|NaN}
 * <ul>
 *    <li>0 if the versions are equal</li>
 *    <li>a negative integer iff v1 < v2</li>
 *    <li>a positive integer iff v1 > v2</li>
 *    <li>NaN if either version string is in the wrong format</li>
 * </ul>
 *
 * @copyright by Jon Papaioannou (["john", "papaioannou"].join(".") + "@gmail.com")
 * @license This function is in the public domain. Do what you want with it, no strings attached.
 */
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

function pip_to_json(data) {
    data = data.split("}, ");
    for (i = 0; i < data.length-1; i++){
        data[i] = data[i] + "}";
    }
    var output = [];
    for (i = 0; i < data.length; i++) {
        output.push(JSON.parse(data[i]));
    }

    return output;
}

function check_installed(installed, required) {
    var is_compatible = true;
    for (i = 0; i < required.length; i++) {
        for (j = 0; j < installed.length; j++) {
            if (required[i]["name"] == installed[j]["name"]) {
                var version_data = versionCompare(required[i]["version"], installed[j]["version"]);
                if (!(version_data === 0 || version_data === -1)) {
                    is_compatible = false;
                }
            }
        }
    }
    return is_compatible;
}

const required_packages = [
    {"name":"altgraph", "version":"0.16.1"},
    {"name":"future", "version":"0.17.1"},
    {"name":"macholib", "version":"1.11"},
    {"name":"numpy", "version":"1.15.4"},
    {"name":"pefile", "version":"2018.8.8"},
    {"name":"Pillow", "version":"5.3.0"},
    {"name":"PyInstaller", "version":"3.4"},
    {"name":"pywin32-ctypes", "version":"0.2.0"},
    {"name":"six", "version":"1.11.0"},
    {"name":"torch", "version":"0.4.1"},
    {"name":"torchvision", "version":"0.2.1"}
];

try {
    var pip_installed = execSync("pip list --format=json", {
    cwd: process.cwd(),
    env: process.env,
    encoding:'utf8'
    });
} catch (Error) {
    console.error("An error occured while running pip, most likely pip and/or python are either not installed or not added to PATH.");
    process.exit(1);
}

const data = pip_to_json(pip_installed.substr(1, pip_installed.length-4));

if (check_installed(data, required_packages)) {
    process.exit(0);
} else {
    process.exit(1)
}