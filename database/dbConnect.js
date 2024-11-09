import mongoose from "mongoose";

export const dbConnect = () => {
  mongoose
    .connect(process.env.DATABASE_URL, { dbName: "TradeNest" })
    .then((res) => {
      console.log("DB Connected");
    })
    .catch((err) => {
      console.log(err.message);
    });
};
