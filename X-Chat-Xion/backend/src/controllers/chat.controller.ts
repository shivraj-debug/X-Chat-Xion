import { Request, Response, NextFunction } from "express";
import Chat from "../models/chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user";
import { console } from "inspector";
import mongoose from "mongoose";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// History Handler (Placeholder)
interface IRequestQuery {
  userId?:mongoose.Schema.Types.ObjectId;
  sessionId?: string;
  days?: string;
  address?: string;
}

export const chatHistory = async (
  req: Request<{}, {}, {}, IRequestQuery>,
  res: Response
): Promise<void> => {

  const { sessionId, days, address } = req.query;
  console.log("sessionId", sessionId);

  try {

    if (!address || !sessionId) {
      res.status(400).json({
        success: false,
        error: "Both userId and sessionId are required query parameters",
      });
      return;
    }

    const user = await User.findOne({ xion_id: address });

    if (!user) {
      res.status(400).json({
        success: false,
        error: "User not found",
      });
      return;
    }
    // Build the query object
    const query:any
    //   // userId: mongoose.Schema.Types.ObjectId;
    //   // sessionId: string;
    //   // isDeleted: boolean;
    //   createdAt?: { $gte: Date };
    = {
      userId: user._id, 
      sessionId,
      isDeleted: false,
    };

    // Add date filter if days parameter is provided
    if (days && !isNaN(Number(days))) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number(days));
      query.createdAt = { $gte: fromDate };
    }

    // Fetch messages sorted by creation time (oldest first)
    const history = await Chat.find(query)
      .sort({ createdAt: 1 }) // 1 for ascending (oldest first), -1 for descending
      .select("-__v -isDeleted") // Exclude these fields from the response
      .lean(); // Return plain JavaScript objects

    // Format the response
    const response = {
      success: true,
      count: history.length,
      sessionId,
      userId: user._id,
      messages: history.map((message) => ({
        id: message._id,
        sender: message.sender,
        content: message.content,
        timestamp: message.createdAt,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching chat history",
    });
  }
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, sessionId, address } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      res
        .status(400)
        .json({ error: "Message content is required and must be non-empty" });
      return;
    }

    const user = await User.findOne({ xion_id: address });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userId = user._id;
    const today = new Date().toDateString();
    const lastMsgDate = new Date(user.lastMessageDate).toDateString();

    // Reset daily message count if it's a new day
    if (today !== lastMsgDate) {
      user.dailyMessages = 0;
      user.lastMessageDate = new Date();
    }
    
    await user.save();

    // Save user message
    const userMessage = new Chat({
      userId,
      sessionId,
      sender: "user",
      content: content.trim(),
      isDeleted: false,
    });
    await userMessage.save();

    // Initialize Gemini model
    const previousMessages = await Chat.find({
      sessionId: sessionId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .limit(10);

    // Convert to Gemini format: { role: 'user' | 'model', parts: [{ text }] }
    const geminiHistory = previousMessages.map((msg) => ({
      role: msg.sender === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // 2. Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 600,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });

    if (!model) {
      res.status(500).json({ error: "Failed to initialize Gemini model." });
      return;
    }

    // 3. Start a new chat session with system instruction
    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: { temperature: 0.8 },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `
    You are a helpful, friendly AI assistant 🤖.
    Respond clearly, using simple language and real-life examples when needed.
    Keep responses concise, but don't skip important details.
    Feel free to use bullet points, code blocks, or emojis if it improves understanding.
          `.trim(),
          },
        ],
      },
    });

    // 4. Send user message to Gemini0
    const result = await chat.sendMessageStream(content.trim())

    let responseText = "";

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      responseText += chunkText;
      res.write(chunkText);
    }

    res.end();
    // 5. Save the AI response
    const aiMessage = new Chat({
      userId,
      sessionId,
      sender: "ai",
      content: responseText,
      isDeleted: false,
    });
    await aiMessage.save();
  
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process chat message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const conversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { address  } = req.body;

    const user = await User.findOne({ xion_id: address });

    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    let currConversation = await Chat.findOne({ userId:user.id }).sort({
      createdAt: -1,
    });

    console.log("currConversation", currConversation);

    if (!currConversation) {
      currConversation = await Chat.create({
        userId: user.id,
        sessionId: crypto.randomUUID(),
        title: "New Chat",
      });
    }

    // Get all conversations for sidebar
    const conversations = await Chat.aggregate([
      { $match: { userId: Object } },
      {
        $group: {
          _id: "$sessionId",
          rootDoc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$rootDoc" } },
      {
        $project: {
          _id: 0,
          sessionId: 1,
          id: "$_id",
          content: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.json({
      currentConversation: currConversation,
      conversations,
      conversationsCount: conversations.length,
    });
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation messages",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteconversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId ,address} = req.query;
    console.log("sessionId", sessionId);
    // const userId = (req.user as { id: string })?.id;
    const user = await User.findOne({ xion_id: address });

    if (!user || !sessionId) {
      res.status(400).json({ error: "Both userId and sessionId are required" });
      return;
    }

    // Delete the conversation
    const result = await Chat.deleteMany({ userId:user._id, sessionId });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "No conversations found to delete" });
      return;
    }

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete conversation"
    });
  }
};

export const updateconversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId, newTitle, address } = req.body;
    console.log("sessionId", sessionId, "newTitle", newTitle);
    // const userId = (req.user as { id: string })?.id;

    const user = await User.findOne({ xion_id: address });

    if (!user || !sessionId || !newTitle) {
      res.status(400).json({ error: "Both userId and sessionId are required" });
      return;
    }

    // Update the conversation title
    const result = await Chat.findOneAndUpdate(
      { userId:user._id, sessionId },
      { newTitle: newTitle },
      { new: true }
    );

    if (!result) {
      res.status(404).json({ error: "No conversations found to update" });
      return;
    }
    res
      .status(200)
      .json({
        message: "Conversation updated successfully",
        conversation: result,
      });
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update conversationsfbs",
    });
  }
};

