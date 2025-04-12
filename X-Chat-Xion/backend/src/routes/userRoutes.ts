import express from "express"
import { signup,logout,user,checkUser} from "../controllers/user.controller"
import middleware from "../auth/middleware";
const router=express.Router();

// router.post("/login",login)
router.post("/signup",signup);
router.post("/logout",middleware,logout);
router.post("/",user);
router.post("/checkUser",checkUser);

export  default router

