export default (sequelize, DataTypes) => {
  const Auction = sequelize.define("Auction", {
    itemName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    startPrice: { type: DataTypes.INTEGER, allowNull: false },
    bidIncrement: { type: DataTypes.INTEGER, allowNull: false },
    goLiveAt: { type: DataTypes.DATE, allowNull: false },
    durationSec: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("scheduled", "live", "ended", "closed"), defaultValue: "scheduled" },
    winnerBidId: { type: DataTypes.INTEGER, allowNull: true },
    sellerId: { type: DataTypes.INTEGER, allowNull: false }
  });
  return Auction;
};
