const getEnvConfig = () => {
  return {
    // http-proxy-middleware
    // https://github.com/chimurai/http-proxy-middleware/tree/v2.0.4#readme
    fallbackTarget: "http://localhost:8080",
    envList: [
      {
        name: "1号测试环境",
        localPort: "3001",
        target: {
          "http://localhost:3010": "http://localhost:3011",
          "http://localhost:3099": "http://localhost:3020",
        },
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
