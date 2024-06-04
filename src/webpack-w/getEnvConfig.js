const getEnvConfig = (envConfigPath) => {
  const envConfig = require(envConfigPath)();
  const { envList } = envConfig;
  envList.forEach((item) => {
    item.key = `${item.target}-+-${item.localPort}`;
  });

  return envList;
};

module.exports = getEnvConfig;
