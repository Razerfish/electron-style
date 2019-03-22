import os
import sys

# Define colors for output. This class borrowed from https://stackoverflow.com/a/287944/9710543
class bcolors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"

def get_files(dirName):
    dirList = os.listdir(dirName)
    files = []
    for entry in dirList:
        path = os.path.join(dirName, entry)
        if os.path.isdir(path):
            files = files + get_files(path)
        else:
            files.append(path)
                
    return files

if os.path.isdir(os.path.normpath("./out/Pytorch Neural Style-win32-x64")):
    src = get_files(os.path.normpath("src/bin"))
    packaged = get_files(os.path.normpath("out/Pytorch Neural Style-win32-x64/resources/app.asar.unpacked/src/bin"))

    for p in range(len(packaged)):
        packaged[p] = packaged[p][packaged[p].find("src"):]

    missing = []
    for i in range(len(src)):
        try:
            packaged.index(src[i])
        except ValueError:
            missing.append(src[i])

    if len(missing) != 0:
        message = "Missing files: "
        for m in range(len(missing)):
            message = message + missing[m]
        print(bcolors.FAIL + message + bcolors.ENDC + "\n")
        sys.exit(1)
    else:
        print(bcolors.OKBLUE + "All bin files are packaged" + bcolors.ENDC + "\n")
else:
    print(bcolors.FAIL + "No packaged directory found at: ./out/Pytorch Neural Style-win32-x64" + bcolors.ENDC + "\n")
    sys.exit(1)