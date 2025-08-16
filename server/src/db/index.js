import { Sequelize, DataTypes, Op } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const ssl =
  process.env.DATABASE_URL?.includes("supabase.co") ||
  process.env.DATABASE_URL?.includes("render.com");

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
});

// Models
import UserModel from "./models/User.js";
import AuctionModel from "./models/Auction.js";
import BidModel from "./models/Bid.js";
import CounterOfferModel from "./models/CounterOffer.js";

export const User = UserModel(sequelize, DataTypes);
export const Auction = AuctionModel(sequelize, DataTypes);
export const Bid = BidModel(sequelize, DataTypes);
export const CounterOffer = CounterOfferModel(sequelize, DataTypes);

// Relations
Auction.belongsTo(User, { as: "seller", foreignKey: "sellerId" });
Bid.belongsTo(User, { as: "bidder", foreignKey: "bidderId" });
Bid.belongsTo(Auction, { foreignKey: "auctionId" });
CounterOffer.belongsTo(Auction, { foreignKey: "auctionId" });
CounterOffer.belongsTo(User, { as: "seller", foreignKey: "sellerId" });
CounterOffer.belongsTo(User, { as: "buyer", foreignKey: "buyerId" });

export { Op };
