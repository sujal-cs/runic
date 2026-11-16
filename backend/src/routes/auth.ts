import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";

const router = Router();

// Throttle credential endpoints to slow down brute-force attempts.
const authLimiter = createRateLimiter(15 * 60 * 1000, 20);

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.me);

export default router;
