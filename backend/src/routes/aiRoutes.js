import { Router } from "express";
import { getAIResponse } from "../controllers/ai.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.post('/generate-response', upload.array('images', 5), getAIResponse); 

export default router;