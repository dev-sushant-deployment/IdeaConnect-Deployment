import { Router } from "express";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";
import { createCode, getChats, getCodeFiles, getCodes } from "../controllers/code.controller.js";

const router = Router();

router.route("/").get(isLoggedIn, getCodes);
router.route("/codeFiles/:codeId").get(isLoggedIn, getCodeFiles);
router.route("/codeChats/:codeId").get(isLoggedIn, getChats);
router.route("/createCode").post(isLoggedIn, createCode);

export default router;