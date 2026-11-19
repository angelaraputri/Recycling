import React from 'react';
import {
  Check,
  Flower2,
  Leaf,
  Moon,
  Sun,
  SunMoon,
  Sunrise,
  Sunset,
  Trees,
  Waves,
  X,
} from 'lucide-react';
import {
  PARK_BACKGROUND_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  UI_COPY,
  getText,
} from '../data/recyclingData';
import { Language, ParkBackgroundId, TimeOfDayId } from '../types/game';

interface SceneSettingsModalProps {
  open: boolean;
  lang: Language;
  timeOfDay: TimeOfDayId;
  parkBackground: ParkBackgroundId;
  onChangeTimeOfDay: (tod: TimeOfDayId) => void;
  onChangeParkBackground: (bg: ParkBackgroundId) => void;
  onClose: () => void;
}

const TIME_ICONS: Record<TimeOfDayId, React.ReactNode> = {
  morning: <Sunrise className="w-5 h-5 text-amber-600" aria-hidden="true" />,
  afternoon: <Sun className="w-5 h-5 text-sky-600" aria-hidden="true" />,
  sunset: <Sunset className="w-5 h-5 text-orange-600" aria-hidden="true" />,
  night: <Moon className="w-5 h-5 text-indigo-600" aria-hidden="true" />,
};

const BG_ICONS: Record<ParkBackgroundId, React.ReactNode> = {
  meadow: <Trees className="w-5 h-5 text-emerald-700" aria-hidden="true" />,
  beach: <Waves className="w-5 h-5 text-cyan-700" aria-hidden="true" />,
  autumn: <Leaf className="w-5 h-5 text-orange-700" aria-hidden="true" />,
  cherry: <Flower2 className="w-5 h-5 text-pink-600" aria-hidden="true" />,
};

export const SceneSettingsModal: React.FC<SceneSettingsModalProps> = ({
  open,
  lang,
  timeOfDay,
  parkBackground,
  onChangeTimeOfDay,
  onChangeParkBackground,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scene-settings-title"
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="scene-settings-title"
              className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2"
            >
              <SunMoon className="w-6 h-6 text-sky-600 shrink-0" aria-hidden="true" />
              <span>{getText(UI_COPY.sceneTitle, lang)}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {lang === 'id'
                ? 'Ubah latar taman 3D dan waktu hari sesuai suasana bermainmu!'
                : 'Customize the 3D park background and time of day to match your mood!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'id' ? 'Tutup pilihan suasana' : 'Close scene settings'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time of Day Section */}
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {getText(UI_COPY.timeOfDayLabel, lang)}
          </h3>
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TIME_OF_DAY_OPTIONS.map((opt) => {
              const active = timeOfDay === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeTimeOfDay(opt.id)}
                  className={`relative rounded-xl border p-3 flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    active
                      ? 'bg-sky-50 border-sky-400 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" aria-hidden="true" />
                    </span>
                  )}
                  <div
                    className="w-11 h-11 rounded-xl border border-slate-200/80 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${opt.swatchHex} 0%, ${opt.secondaryHex} 100%)`,
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/85 flex items-center justify-center shadow-2xs">
                      {TIME_ICONS[opt.id]}
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-slate-900">
                    {getText(opt.name, lang)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Park Background Section */}
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {getText(UI_COPY.backgroundLabel, lang)}
          </h3>
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PARK_BACKGROUND_OPTIONS.map((opt) => {
              const active = parkBackground === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeParkBackground(opt.id)}
                  className={`relative rounded-xl border p-3 flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" aria-hidden="true" />
                    </span>
                  )}
                  <div
                    className="w-11 h-11 rounded-xl border border-slate-200/80 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${opt.swatchHex} 0%, ${opt.secondaryHex} 100%)`,
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/85 flex items-center justify-center shadow-2xs">
                      {BG_ICONS[opt.id]}
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-slate-900">
                    {getText(opt.name, lang)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex justify-end">
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
