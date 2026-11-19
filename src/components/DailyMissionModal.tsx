import React from 'react';
import { CalendarCheck, CheckCircle2, Gift, Sparkles, Target, X } from 'lucide-react';
import { UI_COPY, getText } from '../data/recyclingData';
import { DailyMissionDefinition, DailyMissionProgress, Language } from '../types/game';

interface DailyMissionModalProps {
  open: boolean;
  lang: Language;
  missions: DailyMissionDefinition[];
  progress: DailyMissionProgress;
  onClaimMission: (mission: DailyMissionDefinition) => void;
  onClose: () => void;
}

export const DailyMissionModal: React.FC<DailyMissionModalProps> = ({
  open,
  lang,
  missions,
  progress,
  onClaimMission,
  onClose,
}) => {
  if (!open) return null;

  const completedCount = missions.filter(
    (m) => m.getCurrent(progress) >= m.target
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-mission-modal-title"
    >
      <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 tabular-nums">
              <CalendarCheck className="w-4 h-4" aria-hidden="true" />
              <span>{progress.dateKey}</span>
              <span aria-hidden="true">·</span>
              <span>
                {completedCount} / {missions.length}{' '}
                {lang === 'id' ? 'Selesai' : 'Completed'}
              </span>
            </div>
            <h2
              id="daily-mission-modal-title"
              className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900"
            >
              {getText(UI_COPY.dailyMissionsTitle, lang)}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {lang === 'id'
                ? 'Selesaikan target kecil hari ini untuk mendapatkan bonus poin dan bintang!'
                : 'Complete today’s small eco-goals to claim bonus points and stars!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'id' ? 'Tutup misi harian' : 'Close daily missions'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {missions.map((mission) => {
            const current = Math.min(mission.target, mission.getCurrent(progress));
            const isComplete = current >= mission.target;
            const isClaimed = progress.claimedIds.includes(mission.id);
            const pct = Math.round((current / mission.target) * 100);

            return (
              <div
                key={mission.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isClaimed
                    ? 'bg-emerald-50/55 border-emerald-200'
                    : isComplete
                    ? 'bg-sky-50/70 border-sky-300'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: mission.accentHex }}
                    >
                      <Target className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                        {getText(mission.title, lang)}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-snug">
                        {getText(mission.description, lang)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-amber-700 tabular-nums">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          +{mission.rewardScore} {getText(UI_COPY.scoreLabel, lang)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          +{mission.rewardStars} {getText(UI_COPY.starsLabel, lang)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action / Status */}
                  <div className="shrink-0">
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>{lang === 'id' ? 'Diklaim' : 'Claimed'}</span>
                      </span>
                    ) : isComplete ? (
                      <button
                        type="button"
                        onClick={() => onClaimMission(mission)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Gift className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{lang === 'id' ? 'Klaim Hadiah' : 'Claim'}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 tabular-nums">
                        {current}/{mission.target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: mission.accentHex,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold cursor-pointer"
          >
            {lang === 'id' ? 'Kembali Bermain' : 'Back to Game'}
          </button>
        </div>
      </div>
    </div>
  );
};
