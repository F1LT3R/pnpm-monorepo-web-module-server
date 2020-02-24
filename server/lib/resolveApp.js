const getPackageMap = require('./getPackageMap');

const resolveApp = async appName => {
    const packageMap = await getPackageMap();
    const appDef = packageMap.apps.find(appDef => appDef.name === appName ? appDef : false);
    return appDef;
};

module.exports = resolveApp;