"use client";

import { useState } from "react";
import { mockChatThreads } from "../../lib/mock-data";
import type { ChatThread, ChatMessage } from "../../lib/types";

export default function ChatsPage() {
  const [threads, setThreads] = useState<ChatThread[]>(mockChatThreads);
  const [activeId, setActiveId] = useState<number>(mockChatThreads[0]?.id ?? 1);
  const [reply, setReply] = useState("");

  const activeThread = threads.find(t => t.id === activeId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeThread) return;
    const newMsg: ChatMessage = {
      id: Date.now(), thread_id: activeId, sender_id: 0,
      body: reply.trim(), is_admin: true, created_at: new Date().toISOString(),
    };
    setThreads(ts => ts.map(t =>
      t.id === activeId
        ? { ...t, messages: [...(t.messages ?? []), newMsg], unread_count: 0, last_message: newMsg }
        : t
    ));
    setReply("");
  };

  const handleSelect = (id: number) => {
    setActiveId(id);
    setThreads(ts => ts.map(t => t.id === id ? { ...t, unread_count: 0 } : t));
  };

  return (
    <div className="flex h-[calc(100vh-128px)] bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      {/* Thread list */}
      <div className="w-[280px] flex-shrink-0 border-r border-[#e4ece7] flex flex-col">
        <div className="px-4 py-3.5 border-b border-[#e4ece7]">
          <p className="text-sm font-heading font-bold text-[#0d3a24]">Conversations</p>
          <p className="text-xs text-[#8aab99] mt-0.5">{threads.reduce((s, t) => s + t.unread_count, 0)} unread</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => handleSelect(thread.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-[#f0f2ee] hover:bg-[#fafafa] transition-colors ${activeId === thread.id ? "bg-[#e8f3ec] border-l-2 border-l-[#17583a]" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#17583a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {thread.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0d3a24] truncate">{thread.user?.name}</p>
                    {thread.unread_count > 0 && (
                      <span className="w-4 h-4 bg-[#17583a] text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{thread.unread_count}</span>
                    )}
                  </div>
                  {thread.last_message && (
                    <p className="text-xs text-[#8aab99] truncate mt-0.5">{thread.last_message.body}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeThread ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e4ece7]">
              <div className="w-9 h-9 rounded-full bg-[#17583a] flex items-center justify-center text-white font-bold">
                {activeThread.user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0d3a24]">{activeThread.user?.name}</p>
                <p className="text-xs text-[#8aab99]">{activeThread.user?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeThread.messages?.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-6 ${
                    msg.is_admin
                      ? "bg-[#17583a] text-white rounded-br-sm"
                      : "bg-[#f0f2ee] text-[#0d3a24] rounded-bl-sm"
                  }`}>
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_admin ? "text-white/60" : "text-[#8aab99]"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <form onSubmit={handleSend} className="flex gap-3 p-4 border-t border-[#e4ece7]">
              <input
                type="text"
                placeholder="Type a reply…"
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#d4ded7] bg-[#fafafa] text-sm focus:outline-none focus:border-[#17583a] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8aab99] text-sm">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
