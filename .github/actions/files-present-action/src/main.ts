import * as core from "@actions/core";
import * as path from "path";
import fs from "fs";

async function run() {
    validatePackageJson();
    validateCatalogFiles();
}

/**
 * Files that should be present will be passed in via input args
 * @see {@link https://github.com/newrelic/nr1-catalog/issues/3|Issue 3}
 */
function validateCatalogFiles() {
    console.debug("Running validateCatalogFiles");
    try {
        const files = core.getInput("files");
        const fileList = files.split(/,\s+/);

        const inputPath: string = core.getInput("path", { required: true });

        var doesntExist: string[] = [];
        fileList.forEach(function (file) {
            const pathedFile: string = path.join(inputPath, file);
            console.debug("Pathed file: " + pathedFile);
            if (!fs.existsSync(pathedFile)) {
                doesntExist.push(pathedFile);
            }
        });
        if (doesntExist.length > 0) {
            core.setFailed("These files do not exist: " + doesntExist.join(", "));
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

/**
 * package.json should contain the following commands:
 *  scripts.eslint-check
 *  scripts.eslint-fix
 * @see {@link https://github.com/newrelic/nr1-catalog/issues/3|Issue 3}
 */
function validatePackageJson() {
    console.debug("Running validatePackageJson");
    try {
        const wd: string = process.env[`GITHUB_WORKSPACE`] || "";
        const inputPath: string = core.getInput("path", { required: true });
        const packageJsonPath: string = path.join(wd, inputPath, "package.json");
        const packageJson = require(packageJsonPath);

        console.debug("PackageJson", packageJson);
        console.debug("process.env:", process.env);
        // return process.env.npm_package_scripts && process.env.npm_package_scripts["eslint-check"];
    } catch (error) {
        core.setFailed(error.message);
    }
}

/**
 * Temp: Keep for now, but probably remove
 */
// function getPackageJSON<T = object>(): T {
//     const workspace = process.env.GITHUB_WORKSPACE as string
//     const pathToPackage = path.join(workspace, 'package.json')
//     if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
//     return require(pathToPackage)
// }

run();
