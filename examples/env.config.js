const getEnvConfig = () => {
  return [
    {
      name: "1号测试环境",
      target: "http://localhost:3010",
      localPort: "3001",
      targetMap: {
        "http://localhost:3099": "http://localhost:3020",
      },
    },
    {
      name: "222号测试环境",
      target: "http://localhost:3011",
      localPort: "3002",
    },
    {
      name: "333号测试环境",
      target: "http://localhost:3012",
      localPort: "3003",
    },
  ];
};

module.exports = getEnvConfig;
