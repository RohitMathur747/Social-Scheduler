import express from "express";
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addAccounts,
  disconnectAccounts,
  getAccounts,
} from "../controllers/accountController.js";

const accountRouter = Router();

accountRouter.get("/", protect, getAccounts);
accountRouter.post("/", protect, addAccounts);
accountRouter.delete("/:id", protect, disconnectAccounts);

export default accountRouter;
