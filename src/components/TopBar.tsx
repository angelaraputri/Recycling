import React from 'react';
import { UI_COPY, getText } from '../data/recyclingData';
import { GameMode, Language } from '../types/game';

interface TopBarProps {
  mode: GameMode;
  lang: Language;
  wardrobeOpen: boolean;
  onSelectMode: (mode: GameMode) => void;
  onOpenHelp: () => void;
  onToggleWardrobe: () => void;
}

const MODE_ORDER: GameMode[] = ['sort', 'conveyor', 'magic', 'explore'];

export const WardrobeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Standing two-door wardrobe closet icon */}
    <rect x="4" y="3" width="16" height="16" rx="2" />
    <line x1="12" y1="3" x2="12" y2="15" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="9.5" y1="8.5" x2="9.5" y2="10.5" />
    <line x1="14.5" y1="8.5" x2="14.5" y2="10.5" />
    <line x1="7" y1="19" x2="7" y2="21" />
    <line x1="17" y1="19" x2="17" y2="21" />
  </svg>
);

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  lang,
  wardrobeOpen,
  onSelectMode,
  onOpenHelp,
  onToggleWardrobe,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 border-b border-slate-200/90 shadow-sm">
      <div className="mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 h-14 max-w-[1600px]">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectMode('sort');
          }}
          className="font-display text-lg md:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
        >
          {UI_COPY.brand}
        </a>

        {/* Zone 2: 5 Clean Single-Line Navigation Links */}
        <nav
          aria-label={lang === 'id' ? 'Mode Permainan' : 'Game Modes'}
          className="flex items-center gap-4 md:gap-7 overflow-x-auto no-scrollbar py-1"
        >
          {MODE_ORDER.map((m) => {
            const active = !wardrobeOpen && mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMode(m)}
                className={`relative py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600 rounded ${
                  active
                    ? 'text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {getText(UI_COPY.modes[m], lang)}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-emerald-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onOpenHelp}
            className="relative py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
          >
            {getText(UI_COPY.helpButton, lang)}
          </button>
        </nav>

        {/* Zone 3: Top-Right Wardrobe Action Button with Wardrobe Icon */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleWardrobe}
            aria-pressed={wardrobeOpen}
            title={getText(UI_COPY.wardrobeTitle, lang)}
            className={`inline-flex items-center gap-2 px-3.5 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
              wardrobeOpen
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]'
            }`}
          >
            <WardrobeIcon className="w-4 h-4 shrink-0" />
            <span>{getText(UI_COPY.wardrobeButton, lang)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
