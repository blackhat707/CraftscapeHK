import React, { useState, useCallback } from 'react';
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
  const [lastUsedPrompt, setLastUsedPrompt] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const { addAiCreation } = useAppContext();
  const { language, t } = useLanguage();

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError(t('aiStudioErrorPrompt'));
      return;
    }
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError(t('aiStudioErrorPrompt'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setLastUsedPrompt(trimmedPrompt);

    try {
      const imageUrl = await generateCraftImage(craft.name[language], trimmedPrompt);
      setGeneratedImage(imageUrl);
      addAiCreation({
          craftId: craft.id,
          craftName: craft.name[language],
          prompt: trimmedPrompt,
          imageUrl,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('aiStudioErrorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }, [prompt, craft, addAiCreation, language, t]);

  const handleOpenContact = useCallback(() => {
    setContactName('');
    setContactEmail('');
    const messageTemplate = t('aiStudioContactMessageTemplate', {
      artisan: craft.artisan[language],
      prompt: lastUsedPrompt || prompt,
    });
    setContactMessage(messageTemplate);
    setContactSuccess(false);
    setIsSubmittingContact(false);
    setIsContactOpen(true);
  }, [craft, language, lastUsedPrompt, prompt, t]);

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

  return (
    <div className="h-full w-full bg-[var(--color-bg)] flex flex-col overflow-y-auto">
      <header className="flex items-center justify-between p-4 flex-shrink-0 border-b border-[var(--color-border)]">
        <div className="text-left">
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">{t('aiStudioTitle')}</h1>
          <p className="text-[17px] text-[var(--color-primary-accent)] font-semibold">{craft.name[language]}</p>
        </div>
        <button onClick={onClose} className="bg-[var(--color-surface)] p-2 rounded-full text-[var(--color-text-primary)] border border-[var(--color-border)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-grow p-4 flex flex-col justify-between">
        <div className="w-full aspect-[3/4] bg-[var(--color-secondary-accent)]/30 rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--color-secondary-accent)]">
          {isLoading && (
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-[var(--color-primary-accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-[var(--color-primary-accent)]">{t('aiStudioLoading')}</p>
            </div>
          )}
          {error && <p className="text-[var(--color-error)] p-4 text-center">{error}</p>}
          {generatedImage && <img src={generatedImage} alt="AI generated craft" className="w-full h-full object-contain rounded-2xl"/>}
          {!isLoading && !generatedImage && !error && (
            <div className="text-center text-[var(--color-text-secondary)] p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <p className="mt-2 text-[17px]">{t('aiStudioPlaceholder')}</p>
            </div>
          )}
        </div>
        
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
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('aiStudioInputPlaceholder')}
            rows={3}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-accent)] resize-none"
            disabled={isLoading}
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full mt-2 bg-[var(--color-primary-accent)] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 hover:scale-105 disabled:bg-[var(--color-secondary-accent)] disabled:cursor-not-allowed disabled:scale-100">
            {isLoading ? t('aiStudioGenerating') : t('aiStudioGenerate')}
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
  );
};

export default AiStudio;
