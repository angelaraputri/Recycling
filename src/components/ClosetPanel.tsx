import React, { useState } from 'react';
import { Check, Lock, Shuffle, Star, X } from 'lucide-react';
import {
  UI_COPY,
  WARDROBE_ACCESSORIES,
  WARDROBE_HATS,
  WARDROBE_OUTFITS,
  getText,
} from '../data/recyclingData';
import {
  KuroAccessoryId,
  KuroHatId,
  KuroOutfitId,
  KuroWardrobeConfig,
  Language,
  OwnedWardrobeItems,
} from '../types/game';

interface ClosetPanelProps {
  open: boolean;
  lang: Language;
  config: KuroWardrobeConfig;
  ownedWardrobe: OwnedWardrobeItems;
  onChangeConfig: (next: KuroWardrobeConfig) => void;
  onRandomize: () => void;
  onOpenShopFashion: () => void;
  onClose: () => void;
}

export type WardrobeTab = 'outfit' | 'hat' | 'accessory';

export const WardrobePreviewSvg: React.FC<{ id: string; tab: WardrobeTab }> = ({ id, tab }) => {
  if (tab === 'outfit') {
    switch (id as KuroOutfitId) {
      case 'none':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <circle cx="32" cy="34" r="18" fill="#1B1C20" />
            <polygon points="17,24 20,10 29,20" fill="#1B1C20" />
            <polygon points="47,24 44,10 35,20" fill="#1B1C20" />
            <polygon points="19,22 21,14 27,20" fill="#FB7185" />
            <polygon points="45,22 43,14 37,20" fill="#FB7185" />
            <circle cx="25" cy="33" r="3" fill="#FBBF24" />
            <circle cx="39" cy="33" r="3" fill="#FBBF24" />
            <polygon points="30,38 34,38 32,41" fill="#FB7185" />
          </svg>
        );
      case 'eco_vest':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <path d="M16 18 L24 14 L32 22 L40 14 L48 18 L46 50 L18 50 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M32 22 L32 50" stroke="#14532D" strokeWidth="2" />
            <circle cx="40" cy="30" r="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.2" />
            <rect x="21" y="36" width="8" height="7" rx="1.5" fill="#22C55E" />
          </svg>
        );
      case 'hoodie':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <path d="M21 15 Q32 8 43 15 L52 28 L46 34 L44 50 L20 50 L18 34 L12 28 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.8" strokeLinejoin="round" />
            <ellipse cx="32" cy="18" rx="9" ry="5" fill="#0369A1" />
            <rect x="24" y="34" width="16" height="10" rx="3" fill="#38BDF8" />
            <line x1="29" y1="22" x2="29" y2="30" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="35" y1="22" x2="35" y2="30" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case 'cape':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <path d="M22 18 L42 18 L52 50 Q32 55 12 50 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M25 22 L20 48" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <path d="M39 22 L44 48" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="18" r="4.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.4" />
          </svg>
        );
      case 'overalls':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <rect x="22" y="13" width="5" height="14" rx="2" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.4" />
            <rect x="37" y="13" width="5" height="14" rx="2" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.4" />
            <path d="M20 25 L44 25 L46 51 L35 51 L35 41 L29 41 L29 51 L18 51 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="24.5" cy="27" r="2.2" fill="#1E293B" />
            <circle cx="39.5" cy="27" r="2.2" fill="#1E293B" />
            <rect x="26" y="32" width="12" height="7" rx="1.5" fill="#FEF08A" />
          </svg>
        );
    }
  }

  if (tab === 'hat') {
    switch (id as KuroHatId) {
      case 'none':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <polygon points="16,44 21,16 31,34" fill="#1B1C20" />
            <polygon points="48,44 43,16 33,34" fill="#1B1C20" />
            <polygon points="19,40 22,22 29,35" fill="#FB7185" />
            <polygon points="45,40 42,22 35,35" fill="#FB7185" />
            <path d="M18 44 Q32 38 46 44" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" fill="none" />
          </svg>
        );
      case 'leaf_beret':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <ellipse cx="32" cy="37" rx="20" ry="10" fill="#22C55E" stroke="#15803D" strokeWidth="1.8" transform="rotate(-10 32 37)" />
            <path d="M31 27 L31 18" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="38" cy="20" rx="7" ry="3.5" fill="#4ADE80" stroke="#15803D" strokeWidth="1.4" transform="rotate(-20 38 20)" />
          </svg>
        );
      case 'sun_hat':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <ellipse cx="32" cy="40" rx="25" ry="7" fill="#FCD34D" stroke="#D97706" strokeWidth="1.8" />
            <path d="M19 38 L22 22 L42 22 L45 38 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.8" strokeLinejoin="round" />
            <rect x="20.5" y="33" width="23" height="4.5" rx="1.5" fill="#16A34A" />
          </svg>
        );
      case 'crown':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <polygon points="14,44 17,22 26,32 32,16 38,32 47,22 50,44" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="32" cy="36" r="4" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
            <circle cx="22" cy="38" r="2.5" fill="#38BDF8" />
            <circle cx="42" cy="38" r="2.5" fill="#FB7185" />
          </svg>
        );
      case 'cap':
        return (
          <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
            <path d="M14 38 A18 16 0 0 1 48 38 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1.8" />
            <ellipse cx="42" cy="39" rx="15" ry="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.6" />
            <circle cx="31" cy="21" r="2.2" fill="#EA580C" />
          </svg>
        );
    }
  }

  switch (id as KuroAccessoryId) {
    case 'collar_bell':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
          <path d="M13 24 Q32 36 51 24" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="37" r="7.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.8" />
          <circle cx="32" cy="39" r="1.8" fill="#92400E" />
        </svg>
      );
    case 'glasses':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
          <circle cx="20" cy="32" r="10" fill="#E0F2FE" fillOpacity="0.8" stroke="#0284C7" strokeWidth="3" />
          <circle cx="44" cy="32" r="10" fill="#E0F2FE" fillOpacity="0.8" stroke="#0284C7" strokeWidth="3" />
          <line x1="30" y1="32" x2="34" y2="32" stroke="#0284C7" strokeWidth="3" />
          <line x1="16" y1="28" x2="20" y2="25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="28" x2="44" y2="25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'bowtie':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
          <polygon points="12,20 32,32 12,44" fill="#F43F5E" stroke="#BE123C" strokeWidth="1.8" strokeLinejoin="round" />
          <polygon points="52,20 32,32 52,44" fill="#F43F5E" stroke="#BE123C" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="32" cy="32" r="5.5" fill="#E11D48" stroke="#9F1239" strokeWidth="1.5" />
        </svg>
      );
    case 'scarf':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
          <path d="M14 25 Q32 34 50 25" stroke="#FB923C" strokeWidth="9" strokeLinecap="round" fill="none" />
          <rect x="33" y="27" width="11" height="22" rx="3" fill="#FB923C" stroke="#EA580C" strokeWidth="1.6" />
          <rect x="33" y="38" width="11" height="5" fill="#FEF08A" />
        </svg>
      );
    default:
      return null;
  }
};

export const ClosetPanel: React.FC<ClosetPanelProps> = ({
  open,
  lang,
  config,
  ownedWardrobe,
  onChangeConfig,
  onRandomize,
  onOpenShopFashion,
  onClose,
}) => {
  const [tab, setTab] = useState<WardrobeTab>('outfit');

  if (!open) return null;

  const tabs: { id: WardrobeTab; label: string }[] = [
    { id: 'outfit', label: getText(UI_COPY.outfitTab, lang) },
    { id: 'hat', label: getText(UI_COPY.hatTab, lang) },
    { id: 'accessory', label: getText(UI_COPY.accessoryTab, lang) },
  ];

  const items =
    tab === 'outfit'
      ? WARDROBE_OUTFITS
      : tab === 'hat'
      ? WARDROBE_HATS
      : WARDROBE_ACCESSORIES;

  const selectedId =
    tab === 'outfit'
      ? config.outfit
      : tab === 'hat'
      ? config.hat
      : config.accessory;

  const isOwned = (id: string) => {
    if (tab === 'outfit') return ownedWardrobe.outfits.includes(id as KuroOutfitId);
    if (tab === 'hat') return ownedWardrobe.hats.includes(id as KuroHatId);
    return ownedWardrobe.accessories.includes(id as KuroAccessoryId);
  };

  const handleSelect = (id: string) => {
    if (!isOwned(id)) {
      onOpenShopFashion();
      return;
    }
    if (tab === 'outfit') {
      onChangeConfig({ ...config, outfit: id as KuroOutfitId });
    } else if (tab === 'hat') {
      onChangeConfig({ ...config, hat: id as KuroHatId });
    } else {
      onChangeConfig({ ...config, accessory: id as KuroAccessoryId });
    }
  };

  return (
    <aside
      aria-label={getText(UI_COPY.wardrobeTitle, lang)}
      className="fixed right-3 sm:right-5 top-16 z-30 w-[min(365px,calc(100vw-24px))] max-h-[calc(100vh-175px)] flex flex-col rounded-2xl bg-white/95 border border-amber-200 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-amber-50/70">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
            {getText(UI_COPY.wardrobeTitle, lang)}
          </h2>
          <p className="text-xs text-slate-600">
            {lang === 'id'
              ? 'Putar Kuro di lemari untuk melihat semua sisi!'
              : 'Drag Kuro in the closet to spin and admire!'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={getText(UI_COPY.doneLabel, lang)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Image Preview Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const owned = isOwned(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              title={
                owned
                  ? getText(item.name, lang)
                  : lang === 'id'
                  ? `Buka di Toko (${item.costStars} Bintang)`
                  : `Buy in Shop (${item.costStars} Stars)`
              }
              className={`relative rounded-xl border p-3 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/85 border-emerald-400 shadow-sm'
                  : owned
                  ? 'bg-slate-50/60 hover:bg-white border-slate-200'
                  : 'bg-slate-100/80 hover:bg-amber-50/70 border-slate-200/80 opacity-85'
              }`}
            >
              {isSelected ? (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3" aria-hidden="true" />
                </span>
              ) : (
                !owned && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>{item.costStars}</span>
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                  </span>
                )
              )}
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-center">
                <WardrobePreviewSvg id={item.id} tab={tab} />
              </div>
              <div className="font-display text-xs font-bold text-slate-900 leading-tight">
                {getText(item.name, lang)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onRandomize}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Shuffle className="w-4 h-4" aria-hidden="true" />
          <span>{getText(UI_COPY.randomizeLabel, lang)}</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
        >
          {getText(UI_COPY.doneLabel, lang)}
        </button>
      </div>
    </aside>
  );
};
