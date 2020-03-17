"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        validatePackageJson();
        validateCatalogFiles();
    });
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
        const inputPath = core.getInput("path", { required: true });
        var doesntExist = [];
        fileList.forEach(function (file) {
            const pathedFile = path.join(inputPath, file);
            console.debug("Pathed file: " + pathedFile);
            if (!fs_1.default.existsSync(pathedFile)) {
                doesntExist.push(pathedFile);
            }
        });
        if (doesntExist.length > 0) {
            core.setFailed("These files do not exist: " + doesntExist.join(", "));
        }
    }
    catch (error) {
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
        const packageJson = require("../package.json");
        console.debug("PackageJson", packageJson);
        console.debug("npm_package_scripts", process.env.npm_package_scripts);
        console.debug("npm_package_scripts", process.env.npm_package_scripts_eslint_check);
        console.debug("npm_package_scripts", process.env.npm_package_scripts_eslint_fix);
        // return process.env.npm_package_scripts && process.env.npm_package_scripts["eslint-check"];
    }
    catch (error) {
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
