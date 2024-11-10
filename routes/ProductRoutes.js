import { Router } from "express";
import {
  createProduct,
  fetchFilteredProducts,
  getProducts,
} from "../controllers/productController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const productRoutes = Router();

productRoutes.post("/createproduct", verifyToken, createProduct);
productRoutes.get("/allproducts", getProducts);
productRoutes.post("/products", fetchFilteredProducts);
export default productRoutes;
