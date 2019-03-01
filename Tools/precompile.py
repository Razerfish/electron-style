import re
import sys

import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict


def formatEntries(entries):
    if not len(entries) == 0:
        formatted = ""
        for i in range(len(entries)):
            if not i + 1 == len(entries):
                formatted += entries[i] + ", "
            else:
                formatted += entries[i]
        return formatted
    else:
        return None


def formatPackage(package):
    return re.split(">=|==", package)[0]


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


# Get required packages from requirements.txt
required = open("requirements.txt").read().split("\n")

# Convert the torch requirement from a URL to a form that pkg_resources can process
for i in range(len(required)):
    if "download.pytorch.org" in required[i]:
        torchVersion = list(re.search("(torch-\d.\d.\d)", required[i]).span())
        torchVersion = required[i][torchVersion[0] : torchVersion[1]]
        torchVersion = torchVersion.split("-")
        torchVersion = torchVersion[0] + "==" + torchVersion[1]
        required[i] = torchVersion

proceed = True
missing = []
conflicting = []
for i in range(len(required)):
    try:
        pkg_resources.require(required[i])
    except DistributionNotFound:
        proceed = False
        missing.append(formatPackage(required[i]))
    except VersionConflict:
        proceed = False
        conflicting.append(formatPackage(required[i]))

if not proceed:
    formattedMissing = formatEntries(missing)
    formattedConflicting = formatEntries(conflicting)

    message = "\n"

    if formattedMissing is not None:
        message += "The following packages are missing: " + formattedMissing + "."
    if formattedConflicting is not None:
        if len(message) != 1:
            message += "\n"
        message += (
            "The following packages are out of date: " + formattedConflicting + "."
        )
    message += "\nHave you run npm setup and activated the environment?\n"

    print(bcolors.FAIL + message + bcolors.ENDC)
    sys.exit(1)
else:
    print(
        bcolors.OKBLUE
        + "All required packages are installed and up to date"
        + bcolors.ENDC
    )
    sys.exit(0)
