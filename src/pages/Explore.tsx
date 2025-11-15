import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Craft } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from '../components/Spinner';
import ExploreCarousel from '../components/ExploreCarousel';


interface ExploreProps {
  onShowDetails: (craft: Craft) => void;
}

const Explore: React.FC<ExploreProps> = ({ onShowDetails }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { t, language } = useLanguage();
    
    // Use Convex query to fetch crafts
    const convexCrafts = useQuery(api.data.getCrafts);
    const isLoading = convexCrafts === undefined;
    
    // Map Convex data to frontend types
    const crafts = convexCrafts?.map(craft => ({
        id: craft.craftId,
        name: craft.name,
        artisan: craft.artisan,
        short_description: craft.short_description,
        full_description: craft.full_description,
        images: craft.images,
        history: craft.history,
        story: craft.story,
        category: craft.category,
    })) ?? [];

    if (isLoading) {
        return <Spinner text={t('spinnerExplore')} />;
    }

    if (crafts.length === 0) {
        return (
            <div className="w-full min-h-[100svh] bg-[var(--color-bg)] flex items-center justify-center">
                <div className="text-center text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-8 rounded-2xl ios-shadow">
                    <h3 className="text-lg font-semibold mb-2">{t('exploreEmptyTitle')}</h3>
                    <p className="text-sm">{t('exploreEmptyDesc')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)] overflow-hidden" style={{ touchAction: 'pan-y' }}>
            {/* Museum-style Header */}
            <header className="p-6 pb-2 sticky top-0 bg-[var(--color-bg)]/80 backdrop-blur-md z-10">
                <div className="flex items-baseline justify-between gap-4">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {t('navExplore')}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs tracking-wide text-[var(--color-text-secondary)] uppercase">
                            {language !== 'en' ? '館藏' : 'Collection'}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {activeIndex + 1} / {crafts.length}
                        </span>
                    </div>
                </div>
            </header>

            {/* Carousel Container */}
            <div className="flex-grow relative flex items-center justify-center px-4 pb-24" style={{ touchAction: 'none' }}>
                <ExploreCarousel 
                    crafts={crafts} 
                    onCardTap={onShowDetails}
                    onActiveIndexChange={setActiveIndex}
                />
            </div>
        </div>
    );
};

export default Explore;
