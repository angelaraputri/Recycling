import React, { useEffect, useState } from 'react';
import { Check, Heart, Sparkles, Star, Store, X } from 'lucide-react';
import {
  TREAT_ITEMS,
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
  KuroTreatId,
  KuroWardrobeConfig,
  Language,
  OwnedWardrobeItems,
  TreatItemDefinition,
} from '../types/game';
import { WardrobePreviewSvg, WardrobeTab } from './ClosetPanel';

export type ShopTab = 'snacks' | 'fashion';

interface TreatShopModalProps {
  open: boolean;
  initialTab?: ShopTab;
  lang: Language;
  stars: number;
  affection: number;
  inventory: Record<KuroTreatId, number>;
  wardrobeConfig: KuroWardrobeConfig;
  ownedWardrobe: OwnedWardrobeItems;
  onBuyTreat: (treat: TreatItemDefinition) => void;
  onFeedTreat: (treat: TreatItemDefinition) => void;
  onBuyWardrobeItem: (category: WardrobeTab, id: string, costStars: number) => void;
  onEquipWardrobeItem: (category: WardrobeTab, id: string) => void;
  onClose: () => void;
}

const TreatIconSvg: React.FC<{ id: KuroTreatId }> = ({ id }) => {
  if (id === 'fish_biscuit') {
    return (
      <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" aria-hidden="true">
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#FEF3C7" />
        <ellipse cx="22" cy="24" rx="12" ry="7.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <polygon points="33,24 41,17 41,31" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="15" cy="22.5" r="1.8" fill="#78350F" />
        <path d="M21 20 Q23 24 21 28" stroke="#FDE68A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'salmon_sushi') {
    return (
      <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" aria-hidden="true">
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#FFE4E6" />
        <rect x="11" y="21" width="26" height="13" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M10 22 Q24 12 38 22 Q36 27 12 27 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1.4" />
        <rect x="21" y="18" width="6" height="16" rx="1" fill="#1E293B" />
        <line x1="15" y1="20" x2="18" y2="23" stroke="#FECDD3" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="30" y1="20" x2="33" y2="23" stroke="#FECDD3" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'catnip_milk') {
    return (
      <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" aria-hidden="true">
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#E0F2FE" />
        <path d="M10 23 L14 36 L34 36 L38 23 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="24" cy="23" rx="14" ry="4.2" fill="#FFFFFF" stroke="#0369A1" strokeWidth="1.5" />
        <ellipse cx="24" cy="23.5" rx="11" ry="2.6" fill="#F8FAFC" />
        <path d="M19 16 Q21 12 19 9" stroke="#38BDF8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M27 16 Q29 12 27 9" stroke="#22C55E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#FEF9C3" />
      <ellipse cx="24" cy="31" rx="16" ry="6.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
      <ellipse cx="22" cy="25" rx="10" ry="6.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
      <polygon points="31,25 38,19 38,31" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="17" cy="23.5" r="1.6" fill="#78350F" />
      <polygon points="24,10 25.5,14 29.5,14 26.2,16.5 27.5,20.5 24,18 20.5,20.5 21.8,16.5 18.5,14 22.5,14" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    </svg>
  );
};

export const TreatShopModal: React.FC<TreatShopModalProps> = ({
  open,
  initialTab = 'snacks',
  lang,
  stars,
  affection,
  inventory,
  wardrobeConfig,
  ownedWardrobe,
  onBuyTreat,
  onFeedTreat,
  onBuyWardrobeItem,
  onEquipWardrobeItem,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>(initialTab);
  const [fashionCategory, setFashionCategory] = useState<WardrobeTab>('outfit');

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  if (!open) return null;

  const fashionList =
    fashionCategory === 'outfit'
      ? WARDROBE_OUTFITS.filter((i) => i.costStars > 0)
      : fashionCategory === 'hat'
      ? WARDROBE_HATS.filter((i) => i.costStars > 0)
      : WARDROBE_ACCESSORIES.filter((i) => i.costStars > 0);

  const isFashionOwned = (cat: WardrobeTab, id: string) => {
    if (cat === 'outfit') return ownedWardrobe.outfits.includes(id as KuroOutfitId);
    if (cat === 'hat') return ownedWardrobe.hats.includes(id as KuroHatId);
    return ownedWardrobe.accessories.includes(id as KuroAccessoryId);
  };

  const isFashionEquipped = (cat: WardrobeTab, id: string) => {
    if (cat === 'outfit') return wardrobeConfig.outfit === id;
    if (cat === 'hat') return wardrobeConfig.hat === id;
    return wardrobeConfig.accessory === id;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="treat-shop-title"
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tabular-nums">
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                <span>
                  {getText(UI_COPY.starsLabel, lang)}: <strong className="text-slate-900">{stars}</strong>
                </span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" aria-hidden="true" />
                <span>
                  {getText(UI_COPY.affectionLabel, lang)}:{' '}
                  <strong className="text-slate-900">{affection}</strong>
                </span>
              </span>
            </div>
            <h2
              id="treat-shop-title"
              className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2"
            >
              <Store className="w-6 h-6 text-amber-600 shrink-0" aria-hidden="true" />
              <span>{getText(UI_COPY.shopTitle, lang)}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {lang === 'id'
                ? 'Tukar bintangmu untuk membeli camilan lezat atau pakaian & aksesori keren untuk Kuro!'
                : 'Spend stars to buy yummy snacks or stylish clothes & accessories for Kuro!'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'id' ? 'Tutup toko' : 'Close shop'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Marketplace Section Tabs: Snacks vs Clothes & Gear */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('snacks')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'snacks'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {getText(UI_COPY.shopSnacksTab, lang)}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fashion')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'fashion'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {getText(UI_COPY.shopFashionTab, lang)}
          </button>
        </div>

        {activeTab === 'snacks' ? (
          /* Snacks Grid */
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {TREAT_ITEMS.map((treat) => {
              const owned = inventory[treat.id] ?? 0;
              const canAfford = stars >= treat.costStars;

              return (
                <div
                  key={treat.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <TreatIconSvg id={treat.id} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {getText(treat.name, lang)}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {getText(treat.description, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs tabular-nums">
                    <span className="font-semibold text-slate-700">
                      {getText(UI_COPY.ownedLabel, lang)}:{' '}
                      <strong className="text-slate-900">{owned}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyTreat(treat)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>{getText(UI_COPY.buyLabel, lang)}</span>
                        <span>· {treat.costStars}</span>
                        <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      </button>

                      {owned > 0 && (
                        <button
                          type="button"
                          onClick={() => onFeedTreat(treat)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{getText(UI_COPY.feedLabel, lang)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clothes & Accessories Marketplace */
          <div className="mt-4">
            {/* Sub-tabs: Outfits / Hats / Accessories */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-amber-50/80 border border-amber-100 rounded-xl">
              {(['outfit', 'hat', 'accessory'] as WardrobeTab[]).map((sub) => {
                const label =
                  sub === 'outfit'
                    ? getText(UI_COPY.outfitTab, lang)
                    : sub === 'hat'
                    ? getText(UI_COPY.hatTab, lang)
                    : getText(UI_COPY.accessoryTab, lang);
                const active = fashionCategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setFashionCategory(sub)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {fashionList.map((item) => {
                const owned = isFashionOwned(fashionCategory, item.id);
                const equipped = isFashionEquipped(fashionCategory, item.id);
                const canAfford = stars >= item.costStars;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 ${
                      equipped
                        ? 'bg-emerald-50/75 border-emerald-300'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-center shrink-0">
                        <WardrobePreviewSvg id={item.id} tab={fashionCategory} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-bold text-slate-900 leading-tight">
                          {getText(item.name, lang)}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {owned ? getText(UI_COPY.ownedLabel, lang) : `${item.costStars} ★`}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {owned ? (
                        <button
                          type="button"
                          onClick={() => onEquipWardrobeItem(fashionCategory, item.id)}
                          disabled={equipped}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                            equipped
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-pointer'
                          }`}
                        >
                          {equipped && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                          <span>
                            {equipped
                              ? getText(UI_COPY.wearingLabel, lang)
                              : getText(UI_COPY.wearLabel, lang)}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuyWardrobeItem(fashionCategory, item.id, item.costStars)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap tabular-nums ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <span>{getText(UI_COPY.buyLabel, lang)}</span>
                          <span>· {item.costStars}</span>
                          <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Kembali ke Taman' : 'Back to EcoPark'}
          </button>
        </div>
      </div>
    </div>
  );
};
