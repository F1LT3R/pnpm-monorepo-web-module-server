const path = require('path');
const glob = require('glob');
const process = require('process');
const fs = require('fs');
const packageList = [];

const cwd = process.cwd();

const appsGlob = path.join('packages', 'apps', '*!(node_modules)', '**', 'package.json');
const modsGlob = path.join('packages', 'mods', '*!(node_modules)', '**', 'package.json');

const listPackages = (pattern, cwd) => new Promise((resolve, reject) => {
    glob(pattern, {cwd}, (error, files) => {
        if (error) {
            console.error(error);
            return reject(error);
        }
    
        resolve(files);
    });
});

const getPackageName = packagePath => new Promise((resolve, reject) => {
    fs.readFile(packagePath, 'UTF-8', (error, contents) => {
        if (error) {
            console.error(error);
            return reject(error);
        }

        let def = null;
        
        try {
            def = JSON.parse(contents);
        } catch (error) {
            console.error(error);
            return reject(error);
        }

        if (!Reflect.has(def, 'name')) {
            throw new Error(`${packagePath} has no "name" field.`);
        }
        const name = def.name;

        const main = def.main;

        let dependencies = {};
        if (Reflect.has(def, 'dependencies')) {
            dependencies = def.dependencies;
        }

        let serverRoot = null;
        if (Reflect.has(def, 'serverRoot')) {
            serverRoot = def.serverRoot;
        }

        
        const package = packagePath;
        const dir = path.dirname(packagePath);
        
        resolve({name, dir, package, main, dependencies, serverRoot});
    });
});

const getPackageNames = appPackageFiles => new Promise((resolve, reject) => {
    const promises = [];
    appPackageFiles.forEach(file => promises.push(getPackageName(file)));

    Promise.all(promises)
        .then(resolve)
        .catch(error => reject(error));
});

const generatePackageMap = async () => {
    const appPackageFiles = await listPackages(appsGlob, cwd);
    const apps = await getPackageNames(appPackageFiles);
    // console.log(apps);

    const modPackageFiles = await listPackages(modsGlob, cwd);
    const mods = await getPackageNames(modPackageFiles);
    // console.log(mods);

    return {apps, mods}
};

// (async function () {
//     const map = await generatePackageMap();
//     console.log(map);
// })();

module.exports = generatePackageMap;