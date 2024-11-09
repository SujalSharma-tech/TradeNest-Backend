import Product from "../models/productSchema.js";
import cloudinary from "cloudinary";
export const createProduct = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length == 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded!" });
    }

    let { images } = req.files;

    const imageIds = [];
    for (const img of Array.isArray(images) ? images : [images]) {
      const result = await cloudinary.uploader.upload(img.tempFilePath);
      if (!result) {
        return res
          .status(500)
          .json({ success: false, message: "Image Upload Failed!" });
      }
      imageIds.push({ url: result.public_id });
    }
    const { title, category, subcategory, details, location, owner } = req.body;
    if (
      !title ||
      !category ||
      !subcategory ||
      !details ||
      !location ||
      !owner
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }
    let objDetails = JSON.parse(details);
    images = imageIds;
    const product = await Product.create({
      title,
      owner,
      category,
      subcategory,
      details: objDetails,
      location,
      images,
      createdBy: req.userId,
    });
    res.status(201).json({
      success: true,
      message: "Product Created Successfully!",
      product,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error!");
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });
    res.status(200).json({
      success: true,
      message: "Products Fetched Successfully!",
      products,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error!");
  }
};
