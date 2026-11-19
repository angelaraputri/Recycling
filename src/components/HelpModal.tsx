import React from 'react';
import { X } from 'lucide-react';
import { BIN_DEFINITIONS, BIN_ORDER, getText } from '../data/recyclingData';
import { Language } from '../types/game';

interface HelpModalProps {
  open: boolean;
  lang: Language;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, lang, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="help-modal-title" className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'id'
                ? 'Panduan Bermain Taman Daur Ulang Kuro'
                : "Kuro's EcoPark Play Guide"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {lang === 'id'
                ? 'Ayo kenali 4 warna tong sampah dan cara bermain di ruang 3D!'
                : 'Learn the 4 colorful recycling bins and how to play in 3D space!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'id' ? 'Tutup panduan' : 'Close guide'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Bins Overview */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BIN_ORDER.map((cat) => {
            const bin = BIN_DEFINITIONS[cat];
            return (
              <div
                key={cat}
                className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/70"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: bin.colorHex }}
                    aria-hidden="true"
                  />
                  <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base">
                    {getText(bin.name, lang)}
                  </h3>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-snug">
                  {getText(bin.description, lang)}
                </p>
                <p className="mt-1.5 text-xs font-medium text-slate-500">
                  {getText(bin.examples, lang)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Controls & Modes */}
        <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-slate-800 space-y-2">
          <h3 className="font-display font-bold text-emerald-900 text-sm sm:text-base">
            {lang === 'id' ? 'Cara Menggerakkan Benda & Kamera 3D' : '3D Controls & Tips'}
          </h3>
          <p>
            {lang === 'id'
              ? '• Seret & Lepas: Tekan dan seret benda sampah 3D langsung ke atas tong warna yang cocok, atau klik benda lalu klik tongnya.'
              : '• Drag & Drop: Grab any 3D waste item and drop it onto the matching bin, or tap an item then tap a bin.'}
          </p>
          <p>
            {lang === 'id'
              ? '• Putar & Perbesar: Geser latar taman untuk memutar kamera 3D, gunakan roda mouse atau tombol + / - di bawah untuk zoom dekat ke Kuro dan tong sampah.'
              : '• Orbit & Zoom: Drag the park ground to rotate the 3D view, or scroll / use the + and - buttons below to zoom in close.'}
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
          >
            {lang === 'id' ? 'Ayo Bermain!' : "Let's Play!"}
          </button>
        </div>
      </div>
    </div>
  );
};
