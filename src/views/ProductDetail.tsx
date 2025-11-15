

import React from 'react';
import type { Product } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onContact: () => void;
  onBuy?: () => void;
  onAiGen?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onContact, onBuy, onAiGen }) => {
  const { language, t } = useLanguage();
  const isLetterpress = product.category === 'letterpress';
  const rawDescription = product.full_description[language] || '';
  const formattedDescription = rawDescription.replace(/\\n/g, '\n');
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [product]);

  return (
    <div className="h-full w-full bg-[var(--color-page-bg)] relative flex flex-col">
      <div ref={scrollContainerRef} className="overflow-y-auto max-h-full pb-24">
        <header className="relative h-64">
          <img src={product.image} alt={product.name[language]} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-page-bg)] to-transparent"></div>
          <button onClick={onClose} className="absolute top-6 left-4 bg-black/20 p-2 rounded-full text-white backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute bottom-0 left-0 p-4 w-full">
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{product.name[language]}</h1>
              <p className="text-base text-[var(--color-primary-accent)] font-semibold">{product.artisan[language]}</p>
          </div>
        </header>
        
        <div className="p-4 space-y-4 text-[var(--color-text-primary)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{t('productDetailTitle')}</h2>
            <div className="text-[15px] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-line">{formattedDescription}</div>
          </section>
          
          {isLetterpress && (
            <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-[var(--color-text-primary)] font-semibold mb-2">
                {language !== 'en' ? '🤖 AI 設計工具' : '🤖 AI Design Tools'}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                {language !== 'en'
                  ? '使用我們的 AI 工具設計您的專屬文字排版' 
                  : 'Use our AI tools to design your custom text layout'}
              </p>
              <button
                onClick={onAiGen}
                className="w-full bg-gradient-to-r from-purple-500 to-[#006564] text-white font-bold py-3 px-4 rounded-lg transition-transform duration-300 hover:scale-105"
              >
                {language !== 'en' ? '開始 AI 設計' : 'Start AI Design'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)]/70 backdrop-blur-xl border-t border-[var(--color-border)]">
        <div className="flex gap-3">
          <button
            onClick={onContact}
            className="w-1/2 bg-[var(--color-surface)] text-[var(--color-primary-accent)] border border-[var(--color-primary-accent)] text-center font-bold py-4 px-6 rounded-xl transition-transform duration-300 hover:scale-105"
          >
            {t('productDetailButton')}
          </button>
          {onBuy && (
            <button
              onClick={onBuy}
              className="w-1/2 bg-[var(--color-primary-accent)] text-white text-center font-bold py-4 px-6 rounded-xl transition-transform duration-300 hover:scale-105"
            >
              {language !== 'en' ? '立即下單' : 'Buy now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
