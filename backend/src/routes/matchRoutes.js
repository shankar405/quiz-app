import {Router} from "express";
import { startMatch } from "../controllers/matchController.js";

const router = Router();

router.post("/start", startMatch);

export default router;
