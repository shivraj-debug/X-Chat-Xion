import Link from "next/link";
import React from "react";
import { FiPlus, FiMessageSquare } from "react-icons/fi";
import { Ellipsis } from "lucide-react";
import { Trash2, FolderPen } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Conversation {
  id: string;
  sessionId: string;
  title: string;
  createdAt: Date | string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  conversations?: Conversation[];
  onSelectConversation: (sessionId: string, days?: number) => void;
  onNewConversation: () => void;
  currentSessionId?: string;
  onDeleteConversation: (sessionId: string) => void;
  onRenameConversation: (sessionId: string, title: string) => void;
}

function Sidebar({
  sidebarOpen,
  conversations = [],
  onSelectConversation,
  onNewConversation,
  currentSessionId,
  onDeleteConversation,
  onRenameConversation,
}: SidebarProps) {
  const getConversationKey = (conversation: Conversation) => {
    if (!conversation) return Math.random().toString(36).substring(2, 9);

    const date = conversation.createdAt
      ? new Date(conversation.createdAt)
      : new Date();

    return `${conversation.sessionId || "no-session"}-${date.getTime()}`;
  };

  const conversationGroups = [
    {
      title: "Today",
      filter: (conv: Conversation) => {
        if (!conv?.createdAt) return false;
        try {
          const convDate = new Date(conv.createdAt);
          return convDate.toDateString() === new Date().toDateString();
        } catch {
          return false;
        }
      },
      days: 1,
    },
    {
      title: "Yesterday",
      filter: (conv: Conversation) => {
        if (!conv?.createdAt) return false;
        try {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return (
            new Date(conv.createdAt).toDateString() === yesterday.toDateString()
          );
        } catch {
          return false;
        }
      },
      days: 2,
    },
    {
      title: "Last 7 Days",
      filter: (conv: Conversation) => {
        if (!conv?.createdAt) return false;
        try {
          const convDate = new Date(conv.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return (
            convDate >= weekAgo &&
            convDate.toDateString() !== new Date().toDateString() &&
            convDate.toDateString() !==
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toDateString()
          );
        } catch {
          return false;
        }
      },
      days: 7,
    },
    {
      title: "Older",
      filter: (conv: Conversation) => {
        if (!conv?.createdAt) return false;
        try {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(conv.createdAt) < weekAgo;
        } catch {
          return false;
        }
      },
      days: undefined,
    },
  ];

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className={`flex-1 overflow-y-auto ${sidebarOpen ? "p-4" : "hidden"}`}>
        <button
          className="w-full border border-gray-600 rounded-md py-2 px-4 flex items-center gap-3 hover:bg-gray-700 transition-colors mb-6 cursor-pointer"
          onClick={onNewConversation}
        >
          <FiPlus className="w-4 h-4" />
          <span>New chat</span>
        </button>

        <div className="space-y-6">
          {conversationGroups.map((group) => {
            const filteredConversations = conversations.filter(
              (conv) => conv && group.filter(conv)
            );

            if (filteredConversations.length === 0) return null;

            return (
              <ConversationGroup
                key={group.title}
                title={group.title}
                conversations={filteredConversations}
                onSelect={onSelectConversation}
                currentSessionId={currentSessionId}
                getKey={getConversationKey}
                daysToLoad={group.days}
                ondelete={onDeleteConversation}
                onrename={onRenameConversation}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  onSelect: (sessionId: string, days?: number) => void;
  currentSessionId?: string;
  getKey: (conv: Conversation) => string;
  daysToLoad?: number;
  ondelete: (sessionId: string) => void;
  onrename: (sessionId: string, title: string) => void;
}

function ConversationGroup({
  title,
  conversations = [],
  onSelect,
  currentSessionId,
  getKey,
  daysToLoad,
  ondelete,
  onrename
}: ConversationGroupProps) {
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState("");

  const handleRenameStart = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setInputValue(currentTitle);
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (inputValue.trim() === "") {
      alert("Please enter a valid name");
      return;
    }
    onrename(sessionId, inputValue);
    setEditingSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(sessionId);
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  return (
    <div>
      <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">
        {title}
      </h3>
      <ul className="space-y-1">
        {conversations.map((conversation) => (
          <li key={getKey(conversation)} className="group relative">
            {editingSessionId === conversation.sessionId ? (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 py-2 px-3 rounded-md text-sm bg-gray-700 text-white"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, conversation.sessionId)}
                  onBlur={() => handleRenameSubmit(conversation.sessionId)}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center">
                <Link 
                  href={`/chat/?session=${conversation.sessionId}`} 
                  replace
                  className="flex-1"
                >
                  <button
                    onClick={() => onSelect(conversation.sessionId, daysToLoad)}
                    className={`w-full text-left py-2 px-3 rounded-md text-sm truncate flex items-center gap-2 transition-colors ${
                      currentSessionId === conversation.sessionId
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="truncate">
                      {conversation.title || "Untitled conversation"}
                    </span>
                  </button>
                </Link>

                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
                  <Popover>
                    <PopoverTrigger className="p-1 rounded hover:bg-gray-700">
                      <Ellipsis className="w-4 h-4" />
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-2 bg-gray-700 border-gray-600">
                      <button
                        onClick={() => handleRenameStart(conversation.sessionId, conversation.title)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-600"
                      >
                        <FolderPen className="w-4 h-4" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => ondelete(conversation.sessionId)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded text-red-400 hover:bg-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;