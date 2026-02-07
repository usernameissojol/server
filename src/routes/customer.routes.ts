import { Router } from "express";
import { getCustomers, getCustomerStats, bulkDeleteCustomers } from "../controllers/customer.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", isAdmin, getCustomers);
router.get("/stats", isAdmin, getCustomerStats);
router.post("/bulk-delete", isAdmin, bulkDeleteCustomers);

export default router;
