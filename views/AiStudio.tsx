import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Craft } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { generateCraftImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AiStudioProps {
  craft: Craft;
  onClose: () => void;
}

const AiStudio: React.FC<AiStudioProps> = ({ craft, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAiCreation } = useAppContext();
  const { language, t } = useLanguage();

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError(t('aiStudioErrorPrompt'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateCraftImage(craft.name[language], prompt);
      setGeneratedImage(imageUrl);
      addAiCreation({
          craftId: craft.id,
          craftName: craft.name[language],
          prompt: prompt,
          imageUrl: imageUrl,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('aiStudioErrorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }, [prompt, craft, addAiCreation, language, t]);

  return (
    <motion.div 
      className="h-full w-full bg-[var(--color-bg)] flex flex-col overflow-y-auto"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }}
    >
      {/* Museum-style Header */}
      <header className="flex items-center justify-between p-6 flex-shrink-0 border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-bg)] to-transparent">
        <div className="text-left">
          <motion.h1 
            className="text-3xl font-bold text-[var(--color-text-primary)]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            AI 創作室
          </motion.h1>
          <motion.p 
            className="text-sm text-[var(--color-text-secondary)] mt-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create with {craft.name[language]}
          </motion.p>
        </div>
        <motion.button 
          onClick={onClose} 
          className="bg-[var(--color-surface)] p-3 rounded-full text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-secondary-accent)] transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </header>

      {/* Minimalist Workspace */}
      <div className="flex-grow p-6 flex flex-col space-y-6">
        {/* Museum-style Canvas Area */}
        <motion.div 
          className="w-full aspect-[4/3] bg-[var(--color-surface)] rounded-2xl flex items-center justify-center border border-[var(--color-border)] relative overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
        >
          {isLoading && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 border-3 border-[var(--color-primary-accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-base text-[var(--color-text-secondary)] font-medium">Creating your design...</p>
            </motion.div>
          )}
          {error && (
            <motion.div 
              className="text-center p-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[var(--color-error)] text-base">{error}</p>
            </motion.div>
          )}
          {generatedImage && (
            <motion.img 
              src={generatedImage} 
              alt="AI generated craft" 
              className="w-full h-full object-contain rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {!isLoading && !generatedImage && !error && (
            <motion.div 
              className="text-center text-[var(--color-text-secondary)] p-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-20 h-20 bg-[var(--color-secondary-accent)] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Your creation will appear here</p>
              <p className="text-sm mt-2 opacity-70">Enter your inspiration below</p>
            </motion.div>
          )}
        </motion.div>
        
        {/* Museum-style Input Section */}
        <motion.div 
          className="space-y-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Inspiration
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="輸入靈感或主題…"
              rows={4}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent resize-none transition-all duration-200 text-base"
              disabled={isLoading}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          <motion.button 
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full bg-[var(--color-primary-accent)] text-white font-bold py-5 px-8 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:shadow-[var(--color-primary-accent)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 8px 32px rgba(232, 92, 74, 0.2)'
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating...' : 'Generate Design'}
          </motion.button>
        </motion.div>

        {/* Follow-up CTA */}
        {generatedImage && (
          <motion.div 
            className="museum-card p-6 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              🪡 想將這個設計變成實物嗎？
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Connect with artisans to bring your design to life
            </p>
            <motion.button 
              className="bg-[var(--color-primary-accent)] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-primary-accent)]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Marketplace
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AiStudio;
