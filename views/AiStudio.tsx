import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Craft, TranslationOption } from '../types';
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Craft } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { generateCraftImage } from '../services/geminiService';
import { getMahjongTranslationSuggestions } from '../services/translationService';
import { useLanguage } from '../contexts/LanguageContext';

interface AiStudioProps {
  craft: Craft;
  onClose: () => void;
}

const SPECIAL_TRANSLATION_IMAGES: Record<string, string> = {
  '海莉': '/images/presets/hailey.png',
  '港大': '/images/presets/hku.png',
};

const SPECIAL_IMAGE_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms);
});

const AiStudio: React.FC<AiStudioProps> = ({ craft, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationOptions, setTranslationOptions] = useState<TranslationOption[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationOption | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [lastUsedPrompt, setLastUsedPrompt] = useState('');
  const [lastOriginalPrompt, setLastOriginalPrompt] = useState('');
  const [recentlyUsedTranslation, setRecentlyUsedTranslation] = useState<TranslationOption | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const { addAiCreation } = useAppContext();
  const { language, t } = useLanguage();
  const isMahjongCraft = craft.category === 'mahjong' || craft.name.en.toLowerCase().includes('mahjong');
  const requiresTranslation = language === 'en' && isMahjongCraft;
  const translationStrategyLabels = useMemo(() => ({
    phonetic: t('aiStudioTranslationStrategyPhonetic'),
    meaning: t('aiStudioTranslationStrategyMeaning'),
    mixed: t('aiStudioTranslationStrategyMixed'),
  }), [t]);

  useEffect(() => {
    setTranslationOptions([]);
    setSelectedTranslation(null);
    setTranslationError(null);
    setIsTranslating(false);
    setRecentlyUsedTranslation(null);
  }, [requiresTranslation, craft.id]);

  const handleSelectTranslation = useCallback((option: TranslationOption) => {
    setSelectedTranslation(option);
    setError(null);
  }, []);

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
    if (requiresTranslation) {
      setTranslationOptions([]);
      setSelectedTranslation(null);
      setTranslationError(null);
      setRecentlyUsedTranslation(null);
    }
  }, [requiresTranslation]);

  const handleGenerate = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError(t('aiStudioErrorPrompt'));
      return;
    }

    setError(null);

    if (requiresTranslation) {
      setLastOriginalPrompt(trimmedPrompt);
      if (!translationOptions.length) {
        setIsTranslating(true);
        setTranslationError(null);
        try {
          const options = await getMahjongTranslationSuggestions(trimmedPrompt);
          if (!options.length) {
            setTranslationError(t('aiStudioTranslationNoResult'));
          } else {
            setTranslationOptions(options);
            setSelectedTranslation(options[0]);
          }
        } catch (err) {
          console.error(err);
          setTranslationError(t('aiStudioTranslationError'));
        } finally {
          setIsTranslating(false);
        }
        return;
      }

      if (!selectedTranslation) {
        setError(t('aiStudioTranslationSelectInstruction'));
        return;
      }
    } else {
      setLastOriginalPrompt(trimmedPrompt);
    }

    const effectivePrompt = requiresTranslation && selectedTranslation
      ? selectedTranslation.chinese
      : trimmedPrompt;

    const modelPrompt = requiresTranslation && selectedTranslation
      ? `${selectedTranslation.chinese} (${selectedTranslation.pronunciation}) — ${selectedTranslation.explanation}`
      : effectivePrompt;

    setIsLoading(true);
    setTranslationError(null);
    setGeneratedImage(null);
    setLastUsedPrompt(effectivePrompt);

    try {
      const specialTranslationKey = requiresTranslation && selectedTranslation
        ? selectedTranslation.chinese
        : null;
      const specialImageUrl = specialTranslationKey
        ? SPECIAL_TRANSLATION_IMAGES[specialTranslationKey]
        : undefined;

      let imageUrl: string;

      if (specialImageUrl) {
        await sleep(SPECIAL_IMAGE_DELAY_MS);
        imageUrl = specialImageUrl;
      } else {
        imageUrl = await generateCraftImage(craft.name[language], modelPrompt);
      }

      setGeneratedImage(imageUrl);
      setRecentlyUsedTranslation(requiresTranslation && selectedTranslation ? { ...selectedTranslation } : null);
      addAiCreation({
        craftId: craft.id,
        craftName: craft.name[language],
        prompt: effectivePrompt,
        imageUrl,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('aiStudioErrorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }, [
    prompt,
    requiresTranslation,
    translationOptions,
    selectedTranslation,
    craft,
    language,
    addAiCreation,
    getMahjongTranslationSuggestions,
    t,
  ]);

  const handleOpenContact = useCallback(() => {
    setContactName('');
    setContactEmail('');
    const messageTemplate = recentlyUsedTranslation
      ? t('aiStudioContactMessageTemplateTranslated', {
          artisan: craft.artisan[language],
          translation: recentlyUsedTranslation.chinese,
          original: lastOriginalPrompt || prompt,
        })
      : t('aiStudioContactMessageTemplate', {
          artisan: craft.artisan[language],
          prompt: lastUsedPrompt || prompt,
        });
    setContactMessage(messageTemplate);
    setContactSuccess(false);
    setIsSubmittingContact(false);
    setIsContactOpen(true);
  }, [craft, language, lastUsedPrompt, prompt, recentlyUsedTranslation, lastOriginalPrompt, t]);

  const handleCloseContact = useCallback(() => {
    setIsContactOpen(false);
  }, []);

  const handleSubmitContact = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingContact || contactSuccess) {
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
    }, 600);
  }, [contactSuccess, isSubmittingContact]);

  const disableGenerate = isLoading || isTranslating || !prompt.trim();
  const generateButtonLabel = isLoading
    ? t('aiStudioGenerating')
    : requiresTranslation && translationOptions.length
      ? t('aiStudioGenerateWithTranslation', { translation: selectedTranslation?.chinese ?? t('aiStudioTranslationLabelFallback') })
      : t('aiStudioGenerate');

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
        </div>

        {requiresTranslation && (isTranslating || translationOptions.length > 0 || translationError) && (
          <div className="bg-[var(--color-surface)] p-4 rounded-xl mt-4 border border-[var(--color-border)] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">{t('aiStudioTranslationTitle')}</h3>
                <p className="text-[13px] text-[var(--color-text-secondary)]">{t('aiStudioTranslationSubtitle')}</p>
                {(lastOriginalPrompt || prompt) && (
                  <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
                    {t('aiStudioTranslationOriginalLabel', { original: lastOriginalPrompt || prompt })}
                  </p>
                )}
              </div>
              {isTranslating && (
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-primary-accent)]">
                  <span className="w-3 h-3 border-2 border-[var(--color-primary-accent)] border-t-transparent rounded-full animate-spin"></span>
                  {t('aiStudioTranslationLoading')}
                </div>
              )}
            </div>

            {translationOptions.length > 0 && (
              <div className="space-y-3">
                {translationOptions.map((option) => {
                  const isActive = selectedTranslation?.id === option.id;
                  const strategyLabel = translationStrategyLabels[option.strategy] || translationStrategyLabels.mixed;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectTranslation(option)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                        isActive
                          ? 'border-[var(--color-primary-accent)] bg-[var(--color-primary-accent)]/10'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary-accent)]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[18px] font-semibold text-[var(--color-text-primary)]">{option.chinese}</span>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-primary-accent)]">
                          {strategyLabel}
                        </span>
                      </div>
                      {option.pronunciation && (
                        <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
                          {t('aiStudioTranslationOptionPronunciation', { pronunciation: option.pronunciation })}
                        </p>
                      )}
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-snug">
                        {option.explanation}
                      </p>
                    </button>
                  );
                })}
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {t('aiStudioTranslationUsePromptHint')}
                </p>
              </div>
            )}

            {translationError && (
              <p className="text-[13px] text-[var(--color-error)]">{translationError}</p>
            )}
          </div>
        )}
        
        {generatedImage && (
             <div className="bg-[var(--color-surface)] p-4 rounded-xl text-center mt-4 border border-[var(--color-border)] ios-shadow">
                <h3 className="text-[17px] font-semibold text-[var(--color-primary-accent)]">{t('aiStudioCtaTitle')}</h3>
                <button
                  onClick={handleOpenContact}
                  className="mt-2 bg-[var(--color-primary-accent)] text-white font-semibold py-2 px-5 rounded-full text-[15px] hover:opacity-80 transition-colors"
                >
                    {t('aiStudioCtaButton')}
                </button>
            </div>
        )}

        <div className="mt-4">
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder={t('aiStudioInputPlaceholder')}
            rows={3}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)] resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={disableGenerate}
            className="w-full mt-2 bg-[var(--color-primary-accent)] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 hover:scale-105 disabled:bg-[var(--color-secondary-accent)] disabled:cursor-not-allowed disabled:scale-100">
            {generateButtonLabel}
          </button>
        </div>
      </div>

      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-2xl">
            <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-[20px] font-semibold text-[var(--color-text-primary)]">
                  {t('aiStudioContactTitle', { artisan: craft.artisan[language] })}
                </h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">{t('aiStudioContactSubtitle')}</p>
              </div>
              <button
                onClick={handleCloseContact}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {contactSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-accent)]/10 text-[var(--color-primary-accent)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)]">{t('aiStudioContactSuccessTitle')}</h3>
                <p className="text-[14px] text-[var(--color-text-secondary)]">
                  {t('aiStudioContactSuccessDescription', { artisan: craft.artisan[language] })}
                </p>
                <button
                  onClick={handleCloseContact}
                  className="w-full bg-[var(--color-primary-accent)] text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-colors"
                >
                  {t('aiStudioContactClose')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="p-6 space-y-5">
                <div className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                  {generatedImage && (
                    <img
                      src={generatedImage}
                      alt={t('aiStudioContactPromptThumbnailAlt')}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-secondary)]">
                      {t('aiStudioContactPromptLabel')}
                    </p>
                    <p className="text-[14px] text-[var(--color-text-primary)] mt-1 leading-snug">
                      {lastUsedPrompt || prompt}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-[var(--color-text-secondary)]">
                    {t('aiStudioContactNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    required
                    placeholder={t('aiStudioContactNamePlaceholder')}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3 px-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-[var(--color-text-secondary)]">
                    {t('aiStudioContactEmailLabel')}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3 px-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-[var(--color-text-secondary)]">
                    {t('aiStudioContactMessageLabel')}
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                    rows={4}
                    required
                    placeholder={t('aiStudioContactMessagePlaceholder')}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3 px-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full bg-[var(--color-primary-accent)] text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmittingContact ? t('aiStudioContactSubmitting') : t('aiStudioContactSubmit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
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
