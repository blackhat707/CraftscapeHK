import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Product } from '../../types/types';
import Spinner from '../../components/Spinner';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductManagement: React.FC = () => {
    const { language, t } = useLanguage();
    const [isCreating, setIsCreating] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPrice, setFormPrice] = useState<string>('');
    const [formImage, setFormImage] = useState('');
    const [formCategory, setFormCategory] = useState('');

    const convexProducts = useQuery(api.data.getProductsForCurrentArtisan);
    const createProduct = useMutation(api.data.createArtisanProduct);

    const isLoading = convexProducts === undefined;

    const products: Product[] =
        convexProducts?.map((product) => ({
            id: product.productId,
            name: product.name,
            price: product.price,
            priceDisplay: product.priceDisplay,
            priceSubDisplay: product.priceSubDisplay ?? undefined,
            image: product.image,
            artisan: product.artisan,
            full_description: product.full_description,
            category: product.category ?? undefined,
        })) ?? [];

    const handleCreate = async () => {
        if (!formName || !formDescription || !formPrice || !formImage) return;
        setIsCreating(true);
        try {
            await createProduct({
                name: formName,
                description: formDescription,
                price: Number(formPrice),
                image: formImage,
                category: formCategory || undefined,
            });
            // Clear form
            setFormName('');
            setFormDescription('');
            setFormPrice('');
            setFormImage('');
            setFormCategory('');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg)] overflow-y-auto">
            <header className="p-6 pt-10 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{t('artisanProductsTitle')}</h1>
                    <p className="text-[17px] text-[var(--color-text-secondary)]">{t('artisanProductsDesc')}</p>
                </div>
                <button 
                    onClick={handleCreate}
                    disabled={isCreating || !formName || !formDescription || !formPrice || !formImage}
                    className="bg-[var(--color-primary-accent)] text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </header>

            {/* Simple inline form for new product creation */}
            <div className="px-6 space-y-3">
                <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t('artisanProductsFormName') ?? 'Product name'}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"
                />
                <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={t('artisanProductsFormDescription') ?? 'Description'}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"
                    rows={3}
                />
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder={t('artisanProductsFormPrice') ?? 'Price (HKD)'}
                        className="w-1/2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"
                    />
                    <input
                        type="text"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder={t('artisanProductsFormCategory') ?? 'Category (optional)'}
                        className="w-1/2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"
                    />
                </div>
                <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder={t('artisanProductsFormImage') ?? 'Image URL'}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[var(--color-text-primary)] mb-2"
                />
            </div>

            <div className="flex-grow p-6 space-y-4 pb-24">
                {isLoading ? <Spinner text={t('spinnerProducts')} /> : (
                    products.map(product => (
                        <div key={product.id} className="bg-[var(--color-surface)] p-3 rounded-2xl flex items-center space-x-4 border border-[var(--color-border)] ios-shadow">
                            <img src={product.image} alt={product.name[language]} className="w-20 h-20 object-cover rounded-xl" />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-[var(--color-text-primary)]">{product.name[language]}</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">{product.priceDisplay[language]}</p>
                            </div>
                            <button className="text-sm font-semibold text-[var(--color-primary-accent)] bg-[var(--color-primary-accent)]/10 px-4 py-2 rounded-full">
                                {t('artisanProductsEdit')}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductManagement;
