const getEnvConfig = () => {
  return {
    // http-proxy-middleware
    // https://github.com/chimurai/http-proxy-middleware?tab=readme-ov-file#table-of-contents-
    // https://github.com/chimurai/http-proxy-middleware/tree/v2.0.4#readme
    envList: [
      {
        name: "1号测试环境",
        target: "http://localhost:3011",
        localPort: "3001",
      },
      {
        name: "222号测试环境",
        target: "http://localhost:3012",
        localPort: "3002",
      },
      {
        name: "333号测试环境",
        target: "http://localhost:3013",
        localPort: "3003",
      },
    ],
  };
};

module.exports = getEnvConfig;
