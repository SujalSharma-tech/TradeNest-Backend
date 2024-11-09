import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  first_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  saved_products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Products",
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(8);
  this.password = await hash(this.password, salt);
  next();
});

const User = mongoose.model("Users", userSchema);
export default User;
