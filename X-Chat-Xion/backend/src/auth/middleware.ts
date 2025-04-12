import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req:Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token // Get token from cookie or header
  console.log("Token from cookie:", token); // Log the token for debugging

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return; // Ensure function exits after response
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }

    if (!decoded.id) {
      throw new Error("Invalid token structure. Missing 'id'.");
    }

    req.user = { id: decoded.id }; // Ensure 'id' exists in the payload    
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
    return; // Ensure function exits after response
  }
};

export default authMiddleware;
