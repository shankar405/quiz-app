import express from "express";
import { getWinnerController, submitAllAnswers } from "../controllers/quizController.js";

const router = express.Router();

router.post("/submit-all", submitAllAnswers);
router.get("/winner/:sessionId", getWinnerController);
export default router;
