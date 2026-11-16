import { Router } from "express";
import * as submissionsController from "../controllers/submissions.controller.js";
import { requireAuth, requireSubmissionOwner } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { runAllSchema, runCodeSchema, submissionIdParamsSchema, submitSchema } from "../validation/schemas.js";

const router = Router();

router.post("/", requireAuth, validate(submitSchema), submissionsController.create);
router.post("/run", requireAuth, validate(runCodeSchema), submissionsController.run);
router.post("/run-all", requireAuth, validate(runAllSchema), submissionsController.runAllHandler);
router.get("/", requireAuth, submissionsController.list);
router.get(
  "/:id",
  requireAuth,
  validate(submissionIdParamsSchema, "params"),
  requireSubmissionOwner("id"),
  submissionsController.getById,
);

export default router;
