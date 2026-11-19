import React from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { BIN_DEFINITIONS, UI_COPY, getText } from '../data/recyclingData';
import { GameMode, Language, MagicChoice, WasteItemDefinition } from '../types/game';
import { InspectSelection } from './EcoWorld3D';

interface MagicQuizOverlayProps {
  mode: GameMode;
  lang: Language;
  magicItem: WasteItemDefinition;
  magicTransformed: boolean;
  magicWrongId: string | null;
  inspectSelection: InspectSelection | null;
  selectedItem: WasteItemDefinition | null;
  sortRoundComplete: boolean;
  conveyorGameOver: boolean;
  score: number;
  stars: number;
  level: number;
  onMagicAnswer: (choice: MagicChoice) => void;
  onMagicNext: () => void;
  onNextSortWave: () => void;
  onRestartConveyor: () => void;
  onCloseInspect: () => void;
}

export const MagicQuizOverlay: React.FC<MagicQuizOverlayProps> = ({
  mode,
  lang,
  magicItem,
  magicTransformed,
  magicWrongId,
  inspectSelection,
  selectedItem,
  sortRoundComplete,
  conveyorGameOver,
  score,
  stars,
  level,
  onMagicAnswer,
  onMagicNext,
  onNextSortWave,
  onRestartConveyor,
  onCloseInspect,
}) => {
  // 1. Tap-to-toss helper bar (when an item is clicked in sort or conveyor mode)
  if ((mode === 'sort' || mode === 'conveyor') && selectedItem && !sortRoundComplete && !conveyorGameOver) {
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-slate-900/95 text-white text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">
        {getText(selectedItem.name, lang)} — {getText(UI_COPY.tapHintSelected, lang)}
      </div>
    );
  }

  // 2. Round Complete Banner (Mode 1: Pilah 3D)
  if (mode === 'sort' && sortRoundComplete) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-emerald-200 shadow-2xl p-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Trophy className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
            {getText(UI_COPY.roundCompleteTitle, lang)}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {lang === 'id'
              ? `Semua sampah di Level ${level} sudah dipilah dengan rapi!`
              : `Every waste item in Level ${level} has been sorted cleanly!`}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm font-semibold text-slate-700 tabular-nums">
            <span>
              {getText(UI_COPY.scoreLabel, lang)}: <strong className="text-slate-900">{score}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              {getText(UI_COPY.starsLabel, lang)}: <strong className="text-amber-600">{stars}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onNextSortWave}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <span>{getText(UI_COPY.nextWave, lang)}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Conveyor Game Over / Replay Banner (Mode 2)
  if (mode === 'conveyor' && conveyorGameOver) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-sky-200 shadow-2xl p-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Sparkles className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
            {getText(UI_COPY.conveyorOverTitle, lang)}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {lang === 'id'
              ? 'Kerja bagus! Ayo coba tangkap dan pilah lebih banyak sampah lagi!'
              : 'Great effort! Ready to catch and sort even more recycling items?'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm font-semibold text-slate-700 tabular-nums">
            <span>
              {getText(UI_COPY.scoreLabel, lang)}: <strong className="text-slate-900">{score}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              {getText(UI_COPY.starsLabel, lang)}: <strong className="text-amber-600">{stars}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onRestartConveyor}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{getText(UI_COPY.playAgain, lang)}</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Mode 3: Sulap Daur Ulang Quiz Card (Positioned neatly on the right so pedestal is unobstructed)
  if (mode === 'magic') {
    const binDef = BIN_DEFINITIONS[magicItem.category];
    return (
      <section
        aria-label={lang === 'id' ? 'Kuis Sulap Daur Ulang' : 'Recycle Magic Quiz'}
        className="fixed right-3 sm:right-5 bottom-24 sm:top-20 sm:bottom-auto z-20 w-[min(370px,calc(100vw-24px))] rounded-2xl bg-white/95 border border-slate-200 shadow-xl p-4 sm:p-5"
      >
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>{getText(binDef.shortName, lang)}</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-700">
            {magicTransformed
              ? getText(magicItem.treasureName, lang)
              : getText(magicItem.name, lang)}
          </span>
        </div>

        <h2 className="mt-1.5 font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {magicTransformed
            ? `${getText(magicItem.name, lang)} → ${getText(magicItem.treasureName, lang)}`
            : getText(magicItem.magicQuestion, lang)}
        </h2>

        {!magicTransformed ? (
          <div className="mt-3 flex flex-col gap-2">
            {magicItem.magicChoices.map((choice) => {
              const isWrong = magicWrongId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => onMagicAnswer(choice)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isWrong
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300 text-slate-800'
                  }`}
                >
                  {getText(choice.label, lang)}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-snug">{getText(magicItem.fact, lang)}</p>
            </div>
            <button
              type="button"
              onClick={onMagicNext}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>{getText(UI_COPY.nextQuestion, lang)}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    );
  }

  // 5. Mode 4: Explore 3D Inspector Card
  if (mode === 'explore' && inspectSelection) {
    const binDef = BIN_DEFINITIONS[inspectSelection.category];
    const item = inspectSelection.item;

    return (
      <section
        aria-label={lang === 'id' ? 'Ensiklopedia Daur Ulang' : 'Recycling Encyclopedia'}
        className="fixed right-3 sm:right-5 bottom-24 sm:top-20 sm:bottom-auto z-20 w-[min(360px,calc(100vw-24px))] rounded-2xl bg-white/95 border border-slate-200 shadow-xl p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              {getText(binDef.name, lang)}
            </div>
            <h2 className="mt-0.5 font-display text-lg font-bold text-slate-900">
              {item ? getText(item.name, lang) : getText(binDef.name, lang)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCloseInspect}
            aria-label="Close"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {item ? getText(item.fact, lang) : getText(binDef.description, lang)}
        </p>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
          <div>
            <span className="font-semibold text-slate-800">
              {lang === 'id' ? 'Contoh: ' : 'Examples: '}
            </span>
            {getText(binDef.examples, lang)}
          </div>
          <div>
            <span className="font-semibold text-emerald-700">
              {lang === 'id' ? 'Hasil Daur Ulang: ' : 'Recycled Into: '}
            </span>
            {item ? getText(item.treasureName, lang) : getText(binDef.treasure, lang)}
          </div>
        </div>
      </section>
    );
  }

  return null;
};
