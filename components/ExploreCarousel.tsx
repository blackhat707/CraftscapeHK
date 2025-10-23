import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import type { Craft } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExploreCarouselProps {
  crafts: Craft[];
  onCardTap: (craft: Craft) => void;
}

const ExploreCarousel: React.FC<ExploreCarouselProps> = ({ crafts, onCardTap }) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const SWIPE_THRESHOLD = 120;
  const CARD_GAP = 240;

  const boundedIndex = useCallback((next: number) => {
    if (next < 0) return 0;
    if (next > crafts.length - 1) return crafts.length - 1;
    return next;
  }, [crafts.length]);

  const handleNavigate = useCallback((direction: 1 | -1) => {
    setCurrentIndex(prev => boundedIndex(prev + direction));
  }, [boundedIndex]);

  const handleDragEnd = useCallback((_evt: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && currentIndex < crafts.length - 1) {
      handleNavigate(1);
    } else if (info.offset.x > SWIPE_THRESHOLD && currentIndex > 0) {
      handleNavigate(-1);
    }
  }, [SWIPE_THRESHOLD, crafts.length, currentIndex, handleNavigate]);

  const handleCardTap = useCallback((craft: Craft) => {
    onCardTap(craft);
  }, [onCardTap]);

  const cardPositions = useMemo(() => crafts.map((_craft, index) => index - currentIndex), [crafts, currentIndex]);

  const visibleCards = useMemo(() => {
    const items: { craft: Craft; index: number; position: number }[] = [];
    cardPositions.forEach((position, index) => {
      if (Math.abs(position) <= 1) {
        items.push({ craft: crafts[index], index, position });
      }
    });
    return items;
  }, [cardPositions, crafts]);

  const activeCraft = crafts[currentIndex];

  if (crafts.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[20px]">
      {activeCraft && (
        <>
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center scale-110"
            style={{
              backgroundImage: `url(${activeCraft.images[0]})`,
              filter: 'blur(40px) saturate(120%)',
              transform: 'scale(1.1)'
            }}
          />
          <div className="absolute inset-0 -z-10 bg-[var(--color-bg)]/70 backdrop-blur-[60px]" />
        </>
      )}
      <div className="absolute top-6 right-6 z-20 text-right">
        <p className="text-xs tracking-wide text-[var(--color-text-secondary)] uppercase">{language === 'zh' ? '館藏' : 'Collection'}</p>
        <p className="text-base font-medium text-[var(--color-text-primary)]">{currentIndex + 1} / {crafts.length}</p>
      </div>

      <div className="relative w-full flex items-center justify-center overflow-visible" style={{ height: '72vh' }}>
        <AnimatePresence initial={false}>
          {visibleCards.map(({ craft, index, position }) => {
            const isActive = position === 0;

            return (
              <motion.div
                key={craft.id}
                className="absolute"
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                initial={{ opacity: 0, scale: isActive ? 1.05 : 0.88, x: position * CARD_GAP }}
                animate={{
                  x: position * CARD_GAP,
                  scale: isActive ? 1.08 : 0.88,
                  opacity: isActive ? 1 : 0.7,
                  zIndex: 10 - Math.abs(position)
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: [0.45, 0.05, 0.55, 0.95] }}
                drag={isActive ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={isActive ? handleDragEnd : undefined}
                onClick={isActive ? () => handleCardTap(craft) : undefined}
              >
                <div className="w-[88vw] max-w-[360px] h-[68vh] max-h-[600px] rounded-[18px] overflow-hidden bg-[var(--color-surface)] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                  <div className="relative w-full h-full">
                    <img
                      src={craft.images[0]}
                      alt={craft.name[language]}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 pr-20">
                      <p className="text-sm font-semibold tracking-[0.3em] text-white/70 uppercase mb-3">
                        {craft.artisan[language]}
                      </p>
                      <h2 className="text-[2.3rem] font-bold text-white leading-[1.1]">
                        {craft.name[language]}
                      </h2>
                      {craft.short_description && (
                        <p className="mt-4 text-sm text-white/75 leading-relaxed line-clamp-3">
                          {craft.short_description[language]}
                        </p>
                      )}
                    </div>
                    <motion.button
                      type="button"
                      className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-[#E85C4A] text-white flex items-center justify-center shadow-lg shadow-black/30"
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCardTap(craft);
                      }}
                      aria-label={language === 'zh' ? '探索工藝詳情' : 'View craft details'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExploreCarousel;
