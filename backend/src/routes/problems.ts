import { Router } from "express";
import * as problemsController from "../controllers/problems.controller.js";

const router = Router();

router.get("/", problemsController.list);
router.get("/tags", problemsController.tags);
router.get("/:slug", problemsController.getBySlug);

export default router;
