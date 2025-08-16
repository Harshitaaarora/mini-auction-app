import bcrypt from "bcryptjs";

export default (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
    name: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false }
  }, { indexes: [{ unique: true, fields: ["email"] }] });

  User.beforeCreate(async (user) => {
    if (user.passwordHash && !user.passwordHash.startsWith("$2a$")) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    }
  });

  return User;
};
