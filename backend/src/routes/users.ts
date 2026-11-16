import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me/submissions", requireAuth, usersController.submissionHistory);
router.get("/:username", usersController.getByUsername);

export default router;
