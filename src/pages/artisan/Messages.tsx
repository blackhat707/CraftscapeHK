import React, { useEffect, useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { MessageThread } from '../../types/types';
import Spinner from '../../components/Spinner';
import { useLanguage } from '../../contexts/LanguageContext';

const stripMarkup = (value: string): { text: string; hadImage: boolean } => {
    const imageRegex = /<image[^>]*\/>/g;
    const hadImage = imageRegex.test(value);
    const withoutImages = value.replace(imageRegex, '').trim();
    const withoutSystem = withoutImages.replace(/<system[^>]*>([\s\S]*?)<\/system>/g, (_, body) => body.trim());
    const cleaned = withoutSystem.trim();
    return { text: cleaned, hadImage };
};

const getPreviewText = (thread: MessageThread, language: 'en' | 'zh'): string => {
    if (!thread.messages || thread.messages.length === 0) {
        const { text: fallbackText, hadImage } = stripMarkup(thread.lastMessage);
        if (fallbackText.length === 0 && hadImage) {
            return '🖼️ Attachment';
        }
        return fallbackText || thread.lastMessage;
    }
    const lastMessage = thread.messages[thread.messages.length - 1];
    const { originalText, translatedText, language: messageLanguage } = lastMessage;

    const previewSource = language === messageLanguage ? originalText : translatedText ?? originalText;
    const { text: cleaned, hadImage } = stripMarkup(previewSource);

    if (cleaned.length === 0 && hadImage) {
        return '🖼️ Attachment';
    }

    if (language === messageLanguage) {
        return cleaned || originalText;
    }

    if (translatedText) {
        return cleaned || translatedText;
    }

    return cleaned || originalText;
};

const MessageThreadCard: React.FC<{
  thread: MessageThread;
  onSelect: () => void;
  language: "en" | "zh";
}> = ({ thread, onSelect, language }) => (
    <button onClick={onSelect} className="w-full bg-[var(--color-surface)] p-4 rounded-2xl flex items-center space-x-4 border border-[var(--color-border)] ios-shadow text-left transition-transform duration-200 ease-in-out hover:scale-[1.02]">
        <div className="relative flex-shrink-0">
            <img src={thread.avatar} alt={thread.customerName} className="w-14 h-14 object-cover rounded-full" />
            {thread.unread && (
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-[var(--color-primary-accent)] ring-2 ring-[var(--color-surface)]"></span>
            )}
        </div>
        <div className="flex-grow overflow-hidden">
            <div className="flex justify-between items-baseline">
                <h3 className={`font-bold text-[var(--color-text-primary)] truncate ${thread.unread ? 'font-extrabold' : 'font-semibold'}`}>{thread.customerName}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] flex-shrink-0 ml-2">{thread.timestamp}</p>
            </div>
            <p className={`text-sm text-[var(--color-text-secondary)] truncate ${thread.unread ? 'font-semibold text-[var(--color-text-primary)]' : ''}`}>
                {getPreviewText(thread, language)}
            </p>
        </div>
    </button>
);

interface MessagesProps {
    onSelectThread: (thread: MessageThread) => void;
}

const Messages: React.FC<MessagesProps> = ({ onSelectThread }) => {
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const convexThreads = useQuery(api.data.getMessageThreads);
    const isLoading = convexThreads === undefined;
    const { t, language } = useLanguage();

    useEffect(() => {
        if (!convexThreads) {
            setThreads([]);
            return;
        }
        const mapped: MessageThread[] = convexThreads.map((thread) => ({
            id: thread.threadId,
            customerName: thread.customerName,
            lastMessage: thread.lastMessage,
            timestamp: thread.timestamp,
            unread: thread.unread,
            avatar: thread.avatar,
            productId: thread.productId,
        }));
        setThreads(mapped);
    }, [convexThreads]);
    
    const unreadCount = threads.filter(t => t.unread).length;

    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg)] overflow-y-auto">
            <header className="p-6 pt-10">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{t('artisanMessagesTitle')}</h1>
                <p className="text-[17px] text-[var(--color-text-secondary)]">{t('artisanMessagesUnread', { count: unreadCount })}</p>
            </header>

            <div className="flex-grow p-6 space-y-3 pb-24">
                {isLoading ? (
                    <Spinner text={t('spinnerMessages')} />
                ) : (
                    threads.map(thread => {
                        const previewLanguage: "en" | "zh" =
                          language === "en" ? "en" : "zh";
                        return (
                          <MessageThreadCard
                            key={thread.id}
                            thread={thread}
                            language={previewLanguage}
                            onSelect={() => onSelectThread(thread)}
                          />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Messages;
