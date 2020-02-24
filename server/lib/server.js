const http = require('http');
const fs = require('fs');
const path = require('path');
const process = require('process');

const mimeTypes = require('../config/mimeTypes.json');
const resolvePackage = require('./resolvePackage.js');
const resolveApp = require('./resolveApp');
const getPackageMap = require('./getPackageMap');

const rootApp = process.argv[2];
const port = 3000;

const cwd = process.cwd();

if (!rootApp) {
    throw new Error('No app name provided.');
}

// (async function () {

const fetchFile = (filePath, response) => new Promise((resolve, reject) => {
    // console.log(filePath);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                return reject('ENOENT');
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                reject(error);
            }
            return reject(error);
        }

        resolve(content);
    });
});

// const checkMapForDep

const startServer = async (packageMap) => {
    // console.log(rootApp);
    const app = await resolveApp(rootApp);
    // console.log(123, app)
    // console.log(packageMap);

    const appServerPath = path.join(cwd, app.dir, app.serverRoot);
    // console.log(appServerPath);
    // process.chdir(serverPath);
    const basedir = appServerPath;

    http.createServer(async (request, response) => {
        // console.log('request ', request.url);
        
        let filePath = path.join(basedir,  request.url);
        // console.log(filePath);
        // console.log(basedir);

        if (filePath === `${basedir}/`) {
            filePath = path.join(basedir, 'index.html');
        }
        console.log({filePath});

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        let content;
        try {
            content = await fetchFile(filePath, response);
        } catch (e) {
            console.error(e);
        }

        console.log({typeOfContent: typeof content});
        if (content && typeof content !== 'error') {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
            return;
        }

        const localPath = filePath.split(basedir)[1].slice(1);
        console.log({localPath});

        const localMod = packageMap.mods.find(mod => mod.name === localPath);
        console.log({localMod});

        if (localMod) {
            const modPath = path.join(cwd, localMod.dir, localMod.main);        
            console.log({modPath});
            let modContent;
            try {
                modContent = await fetchFile(modPath, response);
                if (modContent && typeof modContent !== 'error') {
                    console.log(String(modContent));
                    response.writeHead(200, { 'Content-Type': 'text/javascript' });
                    response.end(String(modContent), 'utf-8');
                } else {
                    fs.readFile('./public/404.html', (error, content) => {
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.end(content, 'utf-8');
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }

        return 
    }).listen(port);

    console.log(`Server running at http://127.0.0.1:${port}/`);
};

getPackageMap().then(startServer);

