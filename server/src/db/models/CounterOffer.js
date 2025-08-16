export default (sequelize, DataTypes) => {
  const CounterOffer = sequelize.define("CounterOffer", {
    amount: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("pending", "accepted", "rejected"), defaultValue: "pending" },
    auctionId: { type: DataTypes.INTEGER, allowNull: false },
    sellerId: { type: DataTypes.INTEGER, allowNull: false },
    buyerId: { type: DataTypes.INTEGER, allowNull: false }
  });
  return CounterOffer;
};
