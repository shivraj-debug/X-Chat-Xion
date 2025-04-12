import express from "express"
// import authMiddleware from "../auth/middleware"
import {chatHistory,chat,conversation,deleteconversation,updateconversation} from "../controllers/chat.controller"
const router=express.Router();

router.get("/history",chatHistory)
router.post("/message",chat);
router.post("/getConversations",conversation);
router.delete("/deleteConversation",deleteconversation);
router.put("/updateConversation",updateconversation);
// router.get("/",authMiddleware,conversation);


export  default router


