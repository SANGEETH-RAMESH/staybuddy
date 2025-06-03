import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITransaction {
  type: "deposit" | "withdrawal";
  amount: number;
  date: Date;
  description: string;
}

export interface IWallet extends Document {
  userOrHostId:  Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  transactionHistory: ITransaction[];
}

const transactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
    //   required: true,
    },
    amount: {
      type: Number,
    //   required: true,
    },
    date: {
      type: Date,
    //   default: Date.now,
    },
    description: {
      type: String,
    //   required: true,
    },
  },
  { _id: false }
);

const walletSchema: Schema = new Schema(
  {
    userOrHostId: {
      type: Types.ObjectId,
      required: true,
    },
    balance: {
      type: Number,
    //   required: true,
      default: 0,
    },
    currency: {
      type: String,
    //   required: true,
      default: "INR",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    transactionHistory: [transactionSchema],
  },
  { timestamps: true }
);

const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);

export default Wallet;
