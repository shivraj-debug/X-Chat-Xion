"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Settings, LogOut } from "lucide-react";
import { FiMenu, FiSend } from "react-icons/fi";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Sidebar from "@/components/Sidebar";
import { logout } from "@/components/logout";
import { CircleUser } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModel";
import { CopyButton } from "@/components/CopyButton";
import { RenderFormattedContent } from "@/components/RenderFormattedContent";
import { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";

interface MessageType {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ConversationType {
  id: string;
  title: string;
  sessionId: string;
  createdAt: Date; // Add this to match Sidebar's interface
}

export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState(uuidv4());
  const [currentChat, setCurrentChat] = useState<ConversationType | null>(null);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [freeTrial, setFreeTrial] = useState(0);

  const api=process.env.NEXT_PUBLIC_API_URL;

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

  const { client: signingClient } = useAbstraxionSigningClient();

  const { data: account } = useAbstraxionAccount();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Triggered when `messages` updates

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const address = localStorage.getItem("address");

        const response = await fetch(
        `${api}/api/chat/getConversations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ address }),
          }
        );

        // 3. Check for errors
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse JSON data
        const { currentConversation, conversations } = await response.json();

        const transformedConversations = conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.content,
          sessionId: conv.sessionId,
          createdAt: conv.createdAt,
          date: new Date(conv.createdAt).toLocaleDateString(),
        }));

        setConversations(transformedConversations);

        if (currentConversation) {
          setCurrentSessionId(currentConversation.sessionId);
          setCurrentChat({
            id: currentConversation._id,
            title: currentConversation.content,
            sessionId: currentConversation.sessionId,
            createdAt: currentConversation.createdAt,
          });

          // Load messages for current conversation
          const currentSessionId = localStorage.getItem("currentSession");
          const historyRes = await fetch(
            `${api}/api/chat/history?sessionId=${currentSessionId}`,
            { credentials: "include" }
          );
          const historyData = await historyRes.json();

          if (historyData.success && historyData.messages) {
            setMessages(
              historyData.messages.map((msg: any) => ({
                id: msg._id,
                sender: msg.sender,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
              }))
            );
          }
        }
      } catch (error) {
        setMessages([
          {
            id: uuidv4(),
            sender: "ai",
            content: "No Conversation Found, Please start a new Chat",
            timestamp: new Date(),
          },
        ]);
      } finally {
        // 8. Reset loading state
        setLoading(false);
      }
    };

    fetchConversations();
  }, [router]);

  useEffect(() => {
    if (blocked === true) {
      setShowUpgradeModal(true);
    }
  }, [blocked]);

  const useCreditFromXion = async (creditFee: number) => {
    const msg = { use_credits: { credits: `${Math.abs(creditFee)}` } };
    
    try {
      if (signingClient) {
        await signingClient.execute(
          account?.bech32Address,
          contractAddress,
          JSON.parse(JSON.stringify(msg)),
          "auto"
        );
      }
    } catch (error) {
      console.error("Error querying contract:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: MessageType = {
      id: uuidv4(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };


    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const address = localStorage.getItem("address");

    // Track streamed AI message progressively
    let streamedText = "";
    const aiMessageId = uuidv4();

    const onToken = (chunk: string) => {
      streamedText += chunk;
      setMessages((prev) => {
        const others = prev.filter((m) => m.id !== aiMessageId);
        return [
          ...others,
          {
            id: aiMessageId,
            sender: "ai",
            content: streamedText,
            timestamp: new Date(),
          },
        ];
      });
    };

    const currentSession = localStorage.getItem("currentSession");

    try {
      const res = await fetch(`${api}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setFreeTrial(data.dailyMessages);

      if(freeTrial>4) {
        await useCreditFromXion(1);
      }

      const response = await fetch(`${api}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input.trim(),
          sessionId: currentSession,
          address,
        }),
        credentials: "include",
      });

      if(response.status === 403) {
        setBlocked(true);
        throw new Error("Daily message limit reached and no points left. Please upgrade your plan.");
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onToken(chunk); // Live update!
      }

      // Final update to ensure message is clean
      setMessages((prev) => {
        const others = prev.filter((m) => m.id !== aiMessageId);
        return [
          ...others,
          {
            id: aiMessageId,
            sender: "ai",
            content: streamedText || "Sorry, I couldn't process that.",
            timestamp: new Date(),
          },
        ];
      });

      // If this is the first message, create a new conversation
      if (messages.length === 0) {
        const newConversation = {
          id: uuidv4(),
          title:"No chat found, start a new conversation",
          date: "today",
          sessionId: currentSessionId,
          createdAt: new Date(),
        };
        setConversations((prev) => [newConversation, ...prev]);
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage: MessageType = {
        id: uuidv4(),
        sender: "ai",
        content: (err instanceof Error ? err.message : "An error occurred while processing your request."),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleSelectConversation = async (sessionId: string, days?: number) => {
    // console.log(`Received sessionId: ${sessionId}, days: ${days}`); // Debug
    try {
      setLoading(true);
      setCurrentSessionId(sessionId);
      const address = localStorage.getItem("address");

      const response = await fetch(
        `${api}/api/chat/history?sessionId=${sessionId}${
          days ? `&days=${days}` : ""
        }&address=${address}`,
        {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("response", data);
      if (data.success && data.messages) {
        setMessages(
          data.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
      localStorage.setItem("currentSession", sessionId);
    }
  };

  const handleNewConversation = () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setInput("");
    localStorage.setItem("currentSession", newSessionId);
    // Add empty conversation to list
  };

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    router.push("/");
  };

  const handleDeleteConversation = async (sessionId: string) => {
    const address = localStorage.getItem("address");
    try {
      const response = await fetch(
        `${api}/api/chat/deleteConversation?sessionId=${sessionId}&address=${address}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      console.log("Conversation deleted successfully");
      const updatedConversations = conversations.filter(
        (conv) => conv.sessionId !== sessionId
      );
      setConversations(updatedConversations);

      if (currentSessionId === sessionId) {
        setCurrentSessionId(uuidv4());
        setMessages([]);
        setInput("");
        localStorage.removeItem("currentSession");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          sender: "ai",
          content: "Failed to delete conversation",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleRenameConversation = async (
    sessionId: string,
    newTitle: string
  ) => {
    const address = localStorage.getItem("address");
    try {
      const response = await fetch(
        `${api}/api/chat/updateConversation`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, newTitle, address }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to rename conversation");
      }
      const updatedConversations = conversations.map((conv) =>
        conv.sessionId === sessionId ? { ...conv, title: newTitle } : conv
      );
      setConversations(updatedConversations);

      if (currentSessionId === sessionId) {
        setCurrentChat((prev) => ({ ...prev!, title: newTitle }));
      }
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          sender: "ai",
          content: `Conversation renamed to "${newTitle}"`,
          timestamp: new Date(),
        },
      ]);
      setInput("");
    } catch (error) {
      console.error("Error renaming conversation:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          sender: "ai",
          content: "Failed to rename conversation",
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden  dark:text-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        currentSessionId={currentSessionId}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
      <div className="flex-1 flex flex-col z-0">
        {/* Header */}
        <header className="border-b p-4 flex justify-between items-center border-gray-200 dark:border-gray-700 ">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md dark:hover:bg-gray-700  hover:bg-gray-100  mr-2"
            >
              <FiMenu className="w-6 h-6 text-black" />
            </button>
            <h1 className="text-xl text-black font-semibold">ChatAI</h1>
          </div>
          <div className="flex items-center gap-4 dark:text-white ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src="/user-photo.jpeg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 mr-1 bg-gray-700 dark:text-white">
                <DropdownMenuItem
                  onClick={() => router.push("/account")}
                  className="cursor-pointer flex items-center text-xl gap-2"
                >
                  <div className=" flex justify-center items-center gap-2">
                    <CircleUser size={16} />
                    <p className="text-center"> Account</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer flex items-center text-xl gap-2"
                >
                  <Settings size={16} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center text-xl gap-2 "
                >
                  <LogOut size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden p-4 md:mx-50 mx-10 ">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Start a new conversation by typing a message
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex gap-3 max-w-[80%]">
                    {message.sender === "ai" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`p-3 rounded-lg min-w-20 ${
                        message.sender === "user"
                          ? "dark:bg-blue-600 dark:text-white bg-blue-500 text-white"
                          : "dark:bg-gray-700 dark:text-white  bg-gray-200 text-gray-900"
                      }`}
                    >
                     {message.sender === "ai" && (
                       <div className=" -ml-3  gap-2">
                       <CopyButton text={message.content} />
                     </div>
                     )}
                      <div className="whitespace-pre-wrap max-w-4xl">
                      {message.sender === "ai"
                  ? RenderFormattedContent(message.content)
                  : message.content}    
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />

              {loading && (
                <div className="flex justify-start gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg dark:bg-gray-700 bg-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t dark:border-gray-700 border:gray-200">
          <form
            className="max-w-3xl mx-auto relative"
            onSubmit={handleSendMessage}
          >
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full p-4 pr-12  rounded-lg resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white border-gray-300"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                loading || !input.trim()
                  ? "text-gray-400"
                  : "dark:text-blue-400 dark:hover:text-blue-300 text-blue-500 hover:text-blue-600 "
              }`}
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-center mt-2 dark:text-gray-400 text-gray-500">
            ChatAI may produce inaccurate information about people, places, or
            facts.
          </p>
        </div>
      </div>
    </div>
  );
}
