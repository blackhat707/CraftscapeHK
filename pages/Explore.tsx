import React, { useState, useEffect } from 'react';
import { getCrafts } from '../services/apiService';
import type { Craft } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from '../components/Spinner';
import ExploreCarousel from '../components/ExploreCarousel';


interface ExploreProps {
  onShowDetails: (craft: Craft) => void;
}

const Explore: React.FC<ExploreProps> = ({ onShowDetails }) => {
    const [crafts, setCrafts] = useState<Craft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getCrafts();
                setCrafts(data);
            } catch (error) {
                console.error('Error fetching crafts:', error);
                setCrafts([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
        <div className="w-full min-h-[100svh] bg-[var(--color-bg)] relative overflow-hidden">
            {/* Museum-style Header */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[var(--color-bg)] to-transparent px-4 py-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {t('navExplore')}
                </h1>
            </div>

            {/* Carousel Container */}
            <div className="relative w-full h-[100svh] flex items-center justify-center px-4 pt-20 pb-24">
                <ExploreCarousel 
                    crafts={crafts} 
                    onCardTap={onShowDetails}
                />
            </div>
        </div>
    );
};

export default Explore;
