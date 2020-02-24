const resolvePackage = (moduleName, basePath) => {
    console.log(moduleName, basePath);
    return require.resolve('moduleName', {paths: [basePath]});
};

module.exports = resolvePackage;