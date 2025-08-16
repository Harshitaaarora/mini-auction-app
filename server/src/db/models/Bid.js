export default (sequelize, DataTypes) => {
  const Bid = sequelize.define("Bid", {
    amount: { type: DataTypes.INTEGER, allowNull: false },
    auctionId: { type: DataTypes.INTEGER, allowNull: false },
    bidderId: { type: DataTypes.INTEGER, allowNull: false }
  });
  return Bid;
};
