import { Request, Response } from "express";
import User from "../models/user";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      xion_id: address,
      points: 0,
    });

    await newUser.save();

    res.status(201).json({ message: "Signup successful", name: newUser.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
};
}

export const checkUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ xion_id: address });

    if (!existingUser) {
      res.status(400).json({ error: "User not found", success: false });
      return;
    }

    res.status(200).json({ message: "User exists", success: true });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.cookie("token", "", {
      maxAge: 0, // Expire the cookie immediately
    });
    res.status(200).json({ message: "logged out successfully" });
  } catch (err) {
    throw new Error("error during logout");
  }
};

export const user = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.body;

    const detail = await User.findOne({ xion_id: address });

    res.status(200).json(detail);
  } catch (err) {
    console.error("Error in fetching user details:", err);
    res.status(500).json({ error: "error during fetching user details " });
  }
};



