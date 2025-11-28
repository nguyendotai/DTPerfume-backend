const app = require("./app");
const { syncDB } = require("./models");

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await syncDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
