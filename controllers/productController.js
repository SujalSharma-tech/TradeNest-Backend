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
    objDetails.price = parseInt(objDetails.price);
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

export const fetchFilteredProducts = async (req, res, next) => {
  const data = req.body;
  let {
    categories,
    condition,
    type,
    maxprice,
    minprice,
    location,
    searchValue,
  } = data;
  console.log(searchValue);

  const labels = {
    new: "New",
    gentlyUsed: "Gently Used",
    heavilyUsed: "Heavily Used",
  };

  const selectedLocations = Object.keys(location).filter(
    (key) => location[key]
  );
  const selectedConditions = Object.keys(condition)
    .filter((key) => condition[key])
    .map((key) => labels[key]);
  console.log(selectedConditions);

  minprice = parseInt(minprice) || 0;
  maxprice = parseInt(maxprice) || 10000000;
  if (categories) {
    categories = categories.split(",");
  }

  try {
    const query = { isActive: true };

    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    if (selectedConditions && selectedConditions.length > 0) {
      // query["details.condition"] = {
      //   $or: selectedConditions.map((condition) => ({
      //     "details.condition": { $regex: condition, $options: "i" },
      //   })),
      // };
      // query["details.condition"] = {
      //   $in: selectedConditions.map((condition) => new RegExp(condition, "i")),
      // };
      query["details.condition"] = { $in: selectedConditions };
    }

    if (searchValue) {
      query.$or = [
        { title: { $regex: searchValue, $options: "i" } },
        { "details.additionalInfo": { $regex: searchValue, $options: "i" } },
        { "details.brand": { $regex: searchValue, $options: "i" } },
        { "details.location": { $regex: searchValue, $options: "i" } },
      ];
    }

    if (minprice !== undefined && maxprice !== undefined) {
      query["details.price"] = { $gte: minprice, $lte: maxprice };
    } else if (minprice !== undefined) {
      query["details.price"] = { $gte: minprice };
    } else if (maxprice !== undefined) {
      query["details.price"] = { $lte: maxprice };
    }

    if (selectedLocations && selectedLocations.length > 0) {
      query.location = { $in: selectedLocations };
    }

    console.log(query);

    const products = await Product.find(query);

    return res.status(200).json({
      success: true,
      products: products,
      message: "Filtered Products",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error!");
  }
};
