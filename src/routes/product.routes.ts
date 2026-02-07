import { Router } from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, bulkDeleteProducts, bulkUpdateProducts, importProducts } from "../controllers/product.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", isAdmin, upload.any(), createProduct);
router.post("/import", isAdmin, upload.any(), importProducts);
router.post("/bulk-delete", isAdmin, upload.any(), bulkDeleteProducts);
router.post("/bulk-update", isAdmin, upload.any(), bulkUpdateProducts);
router.post("/:id", isAdmin, upload.any(), updateProduct);
router.delete("/:id", isAdmin, deleteProduct);

export default router;
