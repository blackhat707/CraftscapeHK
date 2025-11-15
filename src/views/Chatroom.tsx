import React, { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import type { ChatMessage } from "../types/types";

interface ChatroomProps {
  threadId: string;
  artisanName: string;
  onClose: () => void;
}

const Chatroom: React.FC<ChatroomProps> = ({ artisanName, onClose, threadId }) => {
  const { t } = useLanguage();

  const convexMessages = useQuery(api.data.getChatMessagesByThread, {
    threadId,
  });

  const messages: ChatMessage[] =
    convexMessages?.map((m) => ({
      id: m.messageId,
      sender: m.sender,
      originalText: m.originalText,
      translatedText: m.translatedText ?? undefined,
      language: m.language,
      timestamp: m.timestamp,
    })) ?? [];

  const [draft, setDraft] = useState("");
  const sendChatMessage = useMutation(api.data.sendChatMessage);

  const handleSend = useCallback(
    async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text) return;
      await sendChatMessage({
        threadId,
        sender: "customer",
        text,
        language: "en",
        offerPrice: undefined,
      });
      setDraft("");
    },
    [draft, sendChatMessage, threadId]
  );
  return (
    <div className="h-full w-full bg-[var(--color-bg)] flex flex-col relative">
      <header className="flex items-center justify-between p-4 flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
        <div className="text-left">
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">
            {t("chatroomWith", { name: artisanName })}
          </h1>
        </div>
        <button
          onClick={onClose}
          className="bg-[var(--color-surface)] p-2 rounded-full text-[var(--color-text-primary)] border border-[var(--color-border)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </header>

      <div className="flex-grow p-4 pb-24 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs ${
                m.sender === "customer"
                  ? "bg-[var(--color-primary-accent)] text-white"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)]"
              }`}
            >
              <p>{m.originalText}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-[var(--color-surface)]/70 backdrop-blur-xl border-t border-[var(--color-border)]"
        style={{
          background: "var(--color-nav-bg, var(--color-surface))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--color-nav-border, var(--color-border))",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
        onSubmit={handleSend}
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("chatroomPlaceholder")}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)]"
          />
          <button
            type="submit"
            className="bg-[var(--color-primary-accent)] text-white p-3 rounded-full flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
