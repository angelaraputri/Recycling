import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Fish, Heart, Sparkles } from 'lucide-react';
import { UI_COPY, getText } from '../data/recyclingData';
import { KuroMessage, KuroWardrobeConfig, Language } from '../types/game';

interface KuroGuideCardProps {
  message: KuroMessage;
  lang: Language;
  collapsed: boolean;
  wardrobe?: KuroWardrobeConfig;
  ownedTreatsCount?: number;
  hidden?: boolean;
  onToggleCollapse: () => void;
  onAskTip: () => void;
  onPatKuro?: () => void;
  onFeedKuro?: () => void;
}

type IdleFace = 'normal' | 'wink' | 'sleepy' | 'curious' | 'playful';
const IDLE_FACES: IdleFace[] = ['curious', 'wink', 'playful', 'sleepy', 'normal'];

export const KuroAvatarSvg: React.FC<{
  mood: KuroMessage['mood'];
  wardrobe?: KuroWardrobeConfig;
}> = ({ mood, wardrobe }) => {
  const [idleFaceIdx, setIdleFaceIdx] = useState(0);

  useEffect(() => {
    if (mood !== 'idle') return;
    const id = window.setInterval(() => {
      setIdleFaceIdx((i) => (i + 1) % IDLE_FACES.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [mood]);

  const idleFace: IdleFace = mood === 'idle' ? IDLE_FACES[idleFaceIdx] : 'normal';
  const isSad = mood === 'sad';
  const isPurring = mood === 'purring';
  const isHappy = mood === 'happy' || isPurring || (mood === 'idle' && idleFace === 'playful');
  const isWink = mood === 'idle' && idleFace === 'wink';
  const isSleepy = mood === 'idle' && idleFace === 'sleepy';
  const isCurious = mood === 'hint' || (mood === 'idle' && idleFace === 'curious');

  const outfitColor =
    wardrobe?.outfit === 'eco_vest'
      ? '#16A34A'
      : wardrobe?.outfit === 'hoodie'
      ? '#0284C7'
      : wardrobe?.outfit === 'cape'
      ? '#DC2626'
      : wardrobe?.outfit === 'overalls'
      ? '#EAB308'
      : null;

  return (
    <svg
      viewBox="0 0 80 80"
      className="w-12 h-12 shrink-0"
      aria-hidden="true"
    >
      {/* Warm circular meadow sky backdrop */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill={isSad || isPurring ? '#FFE4E6' : '#DCFCE7'}
        stroke={isSad || isPurring ? '#E11D48' : '#16A34A'}
        strokeWidth="2.5"
      />
      {/* Outfit shoulder tint if equipped */}
      {outfitColor && (
        <path d="M18 68 Q40 54 62 68 A36 36 0 0 1 18 68 Z" fill={outfitColor} />
      )}
      {/* Pointed Kitten Ears (drooped when sad) */}
      {isSad ? (
        <>
          <polygon points="18,36 12,21 33,26" fill="#18181B" />
          <polygon points="62,36 68,21 47,26" fill="#18181B" />
          <polygon points="20,33 16,23 30,27" fill="#FDA4AF" />
          <polygon points="60,33 64,23 50,27" fill="#FDA4AF" />
        </>
      ) : (
        <>
          <polygon points="18,34 22,12 36,24" fill="#18181B" />
          <polygon points="62,34 58,12 44,24" fill="#18181B" />
          <polygon points="21,30 23,17 32,25" fill="#FDA4AF" />
          <polygon points="59,30 57,17 48,25" fill="#FDA4AF" />
        </>
      )}
      {/* Kitten Head */}
      <ellipse cx="40" cy="42" rx="22" ry="19" fill="#18181B" />
      {/* Soft Charcoal Cheeks */}
      <ellipse cx="33" cy="46" rx="6" ry="4.5" fill="#27272A" />
      <ellipse cx="47" cy="46" rx="6" ry="4.5" fill="#27272A" />
      {/* Rosy Blush when happy / purring / playful / sleepy */}
      {(isHappy || isWink || isSleepy) && (
        <>
          <ellipse cx="24" cy="45" rx="3.4" ry="2" fill="#FB7185" opacity="0.7" />
          <ellipse cx="56" cy="45" rx="3.4" ry="2" fill="#FB7185" opacity="0.7" />
        </>
      )}
      {/* Expressive Amber Eyes */}
      {isHappy ? (
        <>
          <path d="M26 39 Q30 34 34 39" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 39 Q50 34 54 39" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : isSleepy ? (
        <>
          <path d="M25.5 39.5 Q30 42 34.5 39.5" fill="none" stroke="#FBBF24" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M45.5 39.5 Q50 42 54.5 39.5" fill="none" stroke="#FBBF24" strokeWidth="2.8" strokeLinecap="round" />
        </>
      ) : isWink ? (
        <>
          <path d="M26 39 Q30 35 34 39" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="50" cy="39" rx="4.6" ry="5.2" fill="#FBBF24" />
          <ellipse cx="50" cy="39.5" rx="2.6" ry="3.4" fill="#09090B" />
          <circle cx="51.5" cy="37.5" r="1.4" fill="#FFFFFF" />
        </>
      ) : (
        <>
          <ellipse cx="30" cy={isSad ? 40 : 39} rx="4.6" ry={isSad ? 4.4 : 5.2} fill="#FBBF24" />
          <ellipse cx="50" cy={isSad ? 40 : 39} rx="4.6" ry={isSad ? 4.4 : 5.2} fill="#FBBF24" />
          <ellipse cx="30" cy={isSad ? 40.5 : 39.5} rx="2.6" ry="3.1" fill="#09090B" />
          <ellipse cx="50" cy={isSad ? 40.5 : 39.5} rx="2.6" ry="3.1" fill="#09090B" />
          <circle cx="31.5" cy={isSad ? 38.5 : 37.5} r="1.4" fill="#FFFFFF" />
          <circle cx="51.5" cy={isSad ? 38.5 : 37.5} r="1.4" fill="#FFFFFF" />
        </>
      )}
      {/* Sad worried eyebrows + glistening tears OR curious eyebrow */}
      {isSad && (
        <>
          <line x1="25" y1="35" x2="34" y2="32.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="55" y1="35" x2="46" y2="32.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="26.5" cy="45.5" rx="1.6" ry="2.5" fill="#38BDF8" />
          <ellipse cx="53.5" cy="45.5" rx="1.6" ry="2.5" fill="#38BDF8" />
        </>
      )}
      {isCurious && !isSad && (
        <path d="M25.5 32.5 Q30 30.5 34 32.5" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
      )}
      {/* Smart Glasses accessory */}
      {wardrobe?.accessory === 'glasses' && (
        <g stroke="#38BDF8" strokeWidth="2.2" fill="none">
          <circle cx="30" cy="39" r="7" />
          <circle cx="50" cy="39" r="7" />
          <line x1="37" y1="39" x2="43" y2="39" />
        </g>
      )}
      {/* Tiny Pink Nose & Expression Mouth */}
      <polygon points="37.5,45 42.5,45 40,48" fill="#FB7185" />
      {isSad ? (
        <path d="M35.5 52.5 Q40 48.5 44.5 52.5" fill="none" stroke="#E2E8F0" strokeWidth="1.8" strokeLinecap="round" />
      ) : isHappy ? (
        <>
          <path d="M35.5 49.5 Q40 54 44.5 49.5" fill="none" stroke="#E2E8F0" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="40" cy="52" rx="2" ry="1.4" fill="#FB7185" />
        </>
      ) : (
        <path d="M35.5 50 Q38 52.2 40 50 Q42 52.2 44.5 50" fill="none" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
      )}
      {/* Whiskers */}
      <line x1="14" y1="43" x2="25" y2="45" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="48" x2="25" y2="48" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="66" y1="43" x2="55" y2="45" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="66" y1="48" x2="55" y2="48" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
      {/* Hats */}
      {wardrobe?.hat === 'leaf_beret' && (
        <g>
          <ellipse cx="42" cy="22" rx="15" ry="6" fill="#22C55E" transform="rotate(-10 42 22)" />
          <path d="M42 16 Q46 10 50 13" stroke="#15803D" strokeWidth="2" fill="none" />
        </g>
      )}
      {wardrobe?.hat === 'sun_hat' && (
        <g>
          <ellipse cx="40" cy="24" rx="24" ry="5" fill="#FCD34D" />
          <path d="M27 23 L30 14 L50 14 L53 23 Z" fill="#F59E0B" />
        </g>
      )}
      {wardrobe?.hat === 'crown' && (
        <polygon points="28,24 31,13 36,19 40,11 44,19 49,13 52,24" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      )}
      {wardrobe?.hat === 'cap' && (
        <g>
          <path d="M24 25 A16 12 0 0 1 56 25 Z" fill="#F97316" />
          <ellipse cx="46" cy="25" rx="12" ry="3" fill="#F8FAFC" />
        </g>
      )}
      {/* Neck accessories */}
      {wardrobe?.accessory === 'scarf' ? (
        <path d="M23 58 Q40 65 57 58" fill="none" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" />
      ) : wardrobe?.accessory === 'bowtie' ? (
        <g fill="#F43F5E">
          <polygon points="32,57 40,61 32,65" />
          <polygon points="48,57 40,61 48,65" />
          <circle cx="40" cy="61" r="2.5" fill="#BE123C" />
        </g>
      ) : (
        <>
          <path d="M24 58 Q40 65 56 58" fill="none" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
          <circle cx="40" cy="63" r="4" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
        </>
      )}
      {/* Heart accent when purring */}
      {isPurring && (
        <path
          d="M64 18 C64 15.5, 67.5 14, 69 16.5 C70.5 14, 74 15.5, 74 18 C74 21.5, 69 24.5, 69 24.5 C69 24.5, 64 21.5, 64 18 Z"
          fill="#FB7185"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
      )}
    </svg>
  );
};

export const KuroGuideCard: React.FC<KuroGuideCardProps> = ({
  message,
  lang,
  collapsed,
  wardrobe,
  ownedTreatsCount = 0,
  hidden = false,
  onToggleCollapse,
  onAskTip,
  onPatKuro,
  onFeedKuro,
}) => {
  if (hidden) return null;

  const toneBorder =
    message.mood === 'sad'
      ? 'border-rose-300'
      : message.mood === 'purring'
      ? 'border-rose-300'
      : message.tone === 'success'
      ? 'border-emerald-300'
      : message.tone === 'hint'
      ? 'border-amber-300'
      : 'border-slate-200';

  return (
    <aside
      aria-live="polite"
      className={`fixed top-16 left-3 sm:left-5 z-20 max-w-[min(410px,calc(100vw-24px))] rounded-2xl bg-white/95 border ${toneBorder} shadow-lg transition-transform duration-200`}
    >
      <div className="p-3 sm:p-3.5 flex items-start gap-3">
        <button
          type="button"
          onClick={onAskTip}
          title={lang === 'id' ? 'Klik Kuro untuk tips!' : 'Click Kuro for a tip!'}
          className="shrink-0 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <KuroAvatarSvg mood={message.mood} wardrobe={wardrobe} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">
              {getText(UI_COPY.kuroName, lang)}
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              {onPatKuro && (
                <button
                  type="button"
                  onClick={onPatKuro}
                  title={lang === 'id' ? 'Elus Kuro!' : 'Pat Kuro!'}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" aria-hidden="true" />
                  <span>{getText(UI_COPY.patButton, lang)}</span>
                </button>
              )}
              {onFeedKuro && (
                <button
                  type="button"
                  onClick={onFeedKuro}
                  title={
                    ownedTreatsCount > 0
                      ? lang === 'id'
                        ? 'Beri camilan untuk Kuro!'
                        : 'Feed Kuro a treat!'
                      : lang === 'id'
                      ? 'Beli camilan di Toko!'
                      : 'Buy snacks in the Shop!'
                  }
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer tabular-nums"
                >
                  <Fish className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{getText(UI_COPY.feedButton, lang)}</span>
                  {ownedTreatsCount > 0 && (
                    <span className="font-bold text-amber-800">({ownedTreatsCount})</span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onAskTip}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{lang === 'id' ? 'Tip' : 'Tip'}</span>
              </button>
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand Kuro guide' : 'Minimize Kuro guide'}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                {collapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {!collapsed && (
            <p className="mt-1 text-xs sm:text-sm leading-snug text-slate-700">
              {message.text}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
