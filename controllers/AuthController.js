import { compare } from "bcrypt";
import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};
export const signup = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password are required!" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }
    user = await User.create({ email, password, first_name, last_name });
    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({
      success: true,
      message: "User Signup Success!",
      user: {
        email: user.email,
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        saved_products: user.saved_products,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error!");
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password are required!" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist!" });
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials!" });
    }
    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({
      success: true,
      message: "User Signin Success!",
      user: {
        email: user.email,
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        saved_products: user.saved_products,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error!");
  }
};

export const userInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).send("User not found!");
    }
    return res.status(200).json({
      email: user.email,
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      saved_products: user.saved_products,
    });
  } catch (err) {
    console.log(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });
    return res.status(200).send("Logout Success!");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
