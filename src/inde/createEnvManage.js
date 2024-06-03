const registerEnvManageRouter = require("./envManageRouter");
const getPort = require("../webpack-v5/getPort");

const createEnvManage = (options, static) => {
  const { port } = options;

  const app = express();

  registerEnvManageRouter(app, options, static);

  return getPort(port).then(() => {
    envMangePort = port;
    return app.listen(port);
  });
};

module.exports = createEnvManage;
