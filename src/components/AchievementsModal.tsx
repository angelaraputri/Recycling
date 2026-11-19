import React from 'react';
import { Award, CheckCircle2, Flame, Lock, Shield, Sprout, Star, Trophy, Wand2, X } from 'lucide-react';
import { ACHIEVEMENTS, UI_COPY, getText } from '../data/recyclingData';
import { AchievementIconKey, AchievementProgress, Language } from '../types/game';

interface AchievementsModalProps {
  open: boolean;
  lang: Language;
  progress: AchievementProgress;
  onClose: () => void;
}

function renderBadgeIcon(icon: AchievementIconKey, unlocked: boolean) {
  const cls = `w-6 h-6 ${unlocked ? 'text-white' : 'text-slate-400'}`;
  switch (icon) {
    case 'sprout':
      return <Sprout className={cls} aria-hidden="true" />;
    case 'shield':
      return <Shield className={cls} aria-hidden="true" />;
    case 'flame':
      return <Flame className={cls} aria-hidden="true" />;
    case 'wand':
      return <Wand2 className={cls} aria-hidden="true" />;
    case 'star':
      return <Star className={cls} aria-hidden="true" />;
    case 'trophy':
      return <Trophy className={cls} aria-hidden="true" />;
  }
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  open,
  lang,
  progress,
  onClose,
}) => {
  if (!open) return null;

  const unlockedCount = ACHIEVEMENTS.filter(
    (badge) => badge.getCurrent(progress) >= badge.target
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tabular-nums">
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>
                {lang === 'id' ? 'Koleksi Lencana' : 'Badge Collection'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {unlockedCount} / {ACHIEVEMENTS.length}{' '}
                {lang === 'id' ? 'Terbuka' : 'Unlocked'}
              </span>
            </div>
            <h2
              id="achievements-modal-title"
              className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900"
            >
              {getText(UI_COPY.achievementsTitle, lang)}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {lang === 'id'
                ? 'Kumpulkan poin, kombo, dan selesaikan sulap daur ulang untuk membuka semua lencana Kuro!'
                : 'Earn points, build streaks, and complete recycle magic to unlock every Kuro badge!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'id' ? 'Tutup lencana' : 'Close achievements'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ACHIEVEMENTS.map((badge) => {
            const current = Math.min(badge.target, badge.getCurrent(progress));
            const unlocked = current >= badge.target;
            const pct = Math.round((current / badge.target) * 100);

            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-4 transition-colors ${
                  unlocked
                    ? 'bg-emerald-50/55 border-emerald-200'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: unlocked ? badge.accentHex : '#E2E8F0',
                    }}
                  >
                    {renderBadgeIcon(badge.icon, unlocked)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`font-display font-bold text-sm sm:text-base truncate ${
                          unlocked ? 'text-slate-900' : 'text-slate-600'
                        }`}
                      >
                        {getText(badge.title, lang)}
                      </h3>
                      {unlocked ? (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 shrink-0"
                          aria-label={lang === 'id' ? 'Terbuka' : 'Unlocked'}
                        />
                      ) : (
                        <Lock
                          className="w-4 h-4 text-slate-400 shrink-0"
                          aria-label={lang === 'id' ? 'Terkunci' : 'Locked'}
                        />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-600 leading-snug">
                      {getText(badge.description, lang)}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: unlocked ? badge.accentHex : '#94A3B8',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                        {current}/{badge.target}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
          >
            {lang === 'id' ? 'Kembali Bermain' : 'Back to Game'}
          </button>
        </div>
      </div>
    </div>
  );
};
