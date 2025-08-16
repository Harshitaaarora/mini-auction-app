import { sequelize } from "./index.js";

(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log("DB synced");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
