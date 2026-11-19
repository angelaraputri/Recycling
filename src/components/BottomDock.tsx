import React from 'react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  Heart,
  RotateCcw,
  Store,
  SunMoon,
  Target,
  Trees,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { UI_COPY, getText } from '../data/recyclingData';
import { GameMode, Language } from '../types/game';

interface BottomDockProps {
  mode: GameMode;
  lang: Language;
  score: number;
  stars: number;
  level: number;
  streak: number;
  lives: number;
  muted: boolean;
  ambienceEnabled: boolean;
  collapsed: boolean;
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  dailyCompletedCount: number;
  dailyTotalCount: number;
  dailyClaimableCount: number;
  ownedTreatsCount: number;
  onToggleCollapse: () => void;
  onToggleMute: () => void;
  onToggleAmbience: () => void;
  onChangeLang: (lang: Language) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onOpenAchievements: () => void;
  onOpenDailyMissions: () => void;
  onOpenShop: () => void;
  onOpenSceneModal: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  mode,
  lang,
  score,
  stars,
  level,
  streak,
  lives,
  muted,
  ambienceEnabled,
  collapsed,
  unlockedBadgesCount,
  totalBadgesCount,
  dailyCompletedCount,
  dailyTotalCount,
  dailyClaimableCount,
  ownedTreatsCount,
  onToggleCollapse,
  onToggleMute,
  onToggleAmbience,
  onChangeLang,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onOpenAchievements,
  onOpenDailyMissions,
  onOpenShop,
  onOpenSceneModal,
}) => {
  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[min(1080px,calc(100vw-24px))] transition-transform duration-200 ${
        collapsed ? 'translate-y-[calc(100%-34px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Drawer Handle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white/95 hover:bg-slate-50 border border-b-0 border-slate-200 rounded-t-xl shadow-sm cursor-pointer whitespace-nowrap"
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{getText(UI_COPY.showHud, lang)}</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{getText(UI_COPY.hideHud, lang)}</span>
          </>
        )}
      </button>

      {/* Main Unified Control Dock */}
      <div className="w-full rounded-2xl bg-white/95 border border-slate-200 shadow-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        {/* Clean Unboxed Tabular Stats */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium tabular-nums">
          <span>
            {getText(UI_COPY.scoreLabel, lang)}{' '}
            <strong className="font-bold text-slate-900">{score}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            {getText(UI_COPY.starsLabel, lang)}{' '}
            <strong className="font-bold text-amber-600">{stars}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            {getText(UI_COPY.levelLabel, lang)}{' '}
            <strong className="font-bold text-emerald-700">{level}</strong>
          </span>
          {streak > 1 && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-bold text-sky-700">
                {getText(UI_COPY.streakLabel, lang)} {streak}x
              </span>
            </>
          )}
          {mode === 'conveyor' && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1" aria-label={getText(UI_COPY.livesLabel, lang)}>
                {[0, 1, 2].map((i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                    }`}
                  />
                ))}
              </span>
            </>
          )}
        </div>

        {/* Camera Zoom, Daily Missions, Badges, Audio, and Language Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Kuro Marketplace Shop Trigger (Snacks + Clothes & Accessories) */}
          <button
            type="button"
            onClick={onOpenShop}
            title={getText(UI_COPY.shopTitle, lang)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <Store className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{getText(UI_COPY.shopLabel, lang)}</span>
            {ownedTreatsCount > 0 && (
              <span className="font-bold text-rose-900">({ownedTreatsCount})</span>
            )}
          </button>

          {/* Park Background & Time of Day Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSceneModal}
            title={getText(UI_COPY.sceneTitle, lang)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SunMoon className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{getText(UI_COPY.sceneLabel, lang)}</span>
          </button>

          {/* Daily Missions Modal Trigger */}
          <button
            type="button"
            onClick={onOpenDailyMissions}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              dailyClaimableCount > 0
                ? 'text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border-emerald-300'
                : 'text-sky-800 bg-sky-50 hover:bg-sky-100 border-sky-200'
            }`}
          >
            <Target
              className={`w-4 h-4 shrink-0 ${
                dailyClaimableCount > 0 ? 'text-emerald-700' : 'text-sky-600'
              }`}
              aria-hidden="true"
            />
            <span>{getText(UI_COPY.missionsLabel, lang)}</span>
            <span className="font-bold">
              {dailyClaimableCount > 0
                ? lang === 'id'
                  ? `Klaim (${dailyClaimableCount})`
                  : `Claim (${dailyClaimableCount})`
                : `${dailyCompletedCount}/${dailyTotalCount}`}
            </span>
          </button>

          {/* Achievements Modal Trigger */}
          <button
            type="button"
            onClick={onOpenAchievements}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <Award className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>{getText(UI_COPY.badgesLabel, lang)}</span>
            <span className="font-bold text-amber-900">
              {unlockedBadgesCount}/{totalBadgesCount}
            </span>
          </button>

          {/* 3D Camera Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={onZoomOut}
              title={getText(UI_COPY.zoomOut, lang)}
              aria-label={getText(UI_COPY.zoomOut, lang)}
              className="p-1.5 text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onZoomIn}
              title={getText(UI_COPY.zoomIn, lang)}
              aria-label={getText(UI_COPY.zoomIn, lang)}
              className="p-1.5 text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onResetCamera}
              title={getText(UI_COPY.resetView, lang)}
              aria-label={getText(UI_COPY.resetView, lang)}
              className="p-1.5 text-slate-700 hover:bg-white hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Park Ambience Toggle */}
          <button
            type="button"
            onClick={onToggleAmbience}
            aria-pressed={ambienceEnabled && !muted}
            aria-label={getText(UI_COPY.ambienceLabel, lang)}
            title={
              ambienceEnabled
                ? lang === 'id'
                  ? 'Matikan Suara Taman (Angin & Burung)'
                  : 'Turn Off Park Ambience (Wind & Birds)'
                : lang === 'id'
                ? 'Nyalakan Suara Taman (Angin & Burung)'
                : 'Turn On Park Ambience (Wind & Birds)'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              ambienceEnabled && !muted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
            }`}
          >
            <Trees className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">{getText(UI_COPY.ambienceLabel, lang)}</span>
          </button>

          {/* Sound Effects Master Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Switcher (ID | EN) */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-lg" role="group" aria-label="Language">
            <button
              type="button"
              onClick={() => onChangeLang('id')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                lang === 'id'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
