const getEnvConfig = () => {
  return [
    {
      name: "1号测试环境",
      targetIp: "http://localhost:3010",
      localPort: "3001",
      indexPage: "",
      targetIpMap: {
        "http://localhost:3099": "http://localhost:3020",
      },
    },
    {
      name: "222号测试环境",
      targetIp: "http://localhost:3011",
      localPort: "3002",
      indexPage: "",
    },
    {
      name: "333号测试环境",
      targetIp: "http://localhost:3012",
      localPort: "3003",
      indexPage: "",
    },
  ];
};

module.exports = getEnvConfig;
