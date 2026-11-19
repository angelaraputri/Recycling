import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award } from 'lucide-react';
import { AchievementsModal } from './components/AchievementsModal';
import { BottomDock } from './components/BottomDock';
import { ClosetPanel, WardrobeTab } from './components/ClosetPanel';
import { DailyMissionModal } from './components/DailyMissionModal';
import { EcoWorld3D, InspectSelection } from './components/EcoWorld3D';
import { HelpModal } from './components/HelpModal';
import { KuroGuideCard } from './components/KuroGuideCard';
import { MagicQuizOverlay } from './components/MagicQuizOverlay';
import { SceneSettingsModal } from './components/SceneSettingsModal';
import { TopBar } from './components/TopBar';
import { ShopTab, TreatShopModal } from './components/TreatShopModal';
import {
  ACHIEVEMENTS,
  BIN_DEFINITIONS,
  PARK_BACKGROUND_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  TREAT_ITEMS,
  UI_COPY,
  WARDROBE_ACCESSORIES,
  WARDROBE_HATS,
  WARDROBE_OUTFITS,
  WASTE_ITEMS,
  getText,
  getTodayDateKey,
  getTodaysMissions,
} from './data/recyclingData';
import {
  AchievementDefinition,
  AchievementProgress,
  DailyMissionDefinition,
  DailyMissionProgress,
  GameMode,
  KuroAccessoryId,
  KuroHatId,
  KuroMessage,
  KuroOutfitId,
  KuroTreatId,
  KuroWardrobeConfig,
  Language,
  MagicChoice,
  OwnedWardrobeItems,
  ParkBackgroundId,
  TimeOfDayId,
  TreatItemDefinition,
  WasteCategory,
  WasteItemDefinition,
} from './types/game';
import { soundFx } from './utils/sound';

function pickWaveItems(level: number): WasteItemDefinition[] {
  const count = Math.min(6, 3 + level);
  const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function loadDailyProgress(dateKey: string): DailyMissionProgress {
  const empty: DailyMissionProgress = {
    dateKey,
    sortedTotal: 0,
    sortedOrganic: 0,
    sortedPaper: 0,
    sortedPlastic: 0,
    sortedMetalGlass: 0,
    magicSolved: 0,
    bestStreak: 0,
    claimedIds: [],
  };
  try {
    const raw = window.localStorage.getItem(`kuro_daily_${dateKey}`);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<DailyMissionProgress>;
    return { ...empty, ...parsed, dateKey };
  } catch {
    return empty;
  }
}

const DEFAULT_WARDROBE: KuroWardrobeConfig = {
  outfit: 'none',
  hat: 'none',
  accessory: 'collar_bell',
};

const DEFAULT_OWNED_WARDROBE: OwnedWardrobeItems = {
  outfits: ['none'],
  hats: ['none'],
  accessories: ['collar_bell'],
};

function loadOwnedWardrobe(): OwnedWardrobeItems {
  try {
    const raw = window.localStorage.getItem('kuro_owned_wardrobe_v1');
    if (!raw) return DEFAULT_OWNED_WARDROBE;
    const parsed = JSON.parse(raw) as Partial<OwnedWardrobeItems>;
    const outfits = Array.from(
      new Set<KuroOutfitId>([
        'none',
        ...(Array.isArray(parsed.outfits)
          ? parsed.outfits.filter((id) => WARDROBE_OUTFITS.some((o) => o.id === id))
          : []),
      ])
    );
    const hats = Array.from(
      new Set<KuroHatId>([
        'none',
        ...(Array.isArray(parsed.hats)
          ? parsed.hats.filter((id) => WARDROBE_HATS.some((h) => h.id === id))
          : []),
      ])
    );
    const accessories = Array.from(
      new Set<KuroAccessoryId>([
        'collar_bell',
        ...(Array.isArray(parsed.accessories)
          ? parsed.accessories.filter((id) => WARDROBE_ACCESSORIES.some((a) => a.id === id))
          : []),
      ])
    );
    return { outfits, hats, accessories };
  } catch {
    return DEFAULT_OWNED_WARDROBE;
  }
}

function loadWardrobeConfig(owned: OwnedWardrobeItems): KuroWardrobeConfig {
  try {
    const raw = window.localStorage.getItem('kuro_wardrobe_v1');
    if (!raw) return DEFAULT_WARDROBE;
    const parsed = JSON.parse(raw) as Partial<KuroWardrobeConfig>;
    const outfit =
      parsed.outfit && owned.outfits.includes(parsed.outfit)
        ? parsed.outfit
        : DEFAULT_WARDROBE.outfit;
    const hat =
      parsed.hat && owned.hats.includes(parsed.hat) ? parsed.hat : DEFAULT_WARDROBE.hat;
    const accessory =
      parsed.accessory && owned.accessories.includes(parsed.accessory)
        ? parsed.accessory
        : DEFAULT_WARDROBE.accessory;
    return { outfit, hat, accessory };
  } catch {
    return DEFAULT_WARDROBE;
  }
}

const DEFAULT_TREAT_INVENTORY: Record<KuroTreatId, number> = {
  fish_biscuit: 1,
  salmon_sushi: 0,
  catnip_milk: 0,
  golden_tuna: 0,
};

function loadPetState(): {
  inventory: Record<KuroTreatId, number>;
  affection: number;
} {
  try {
    const raw = window.localStorage.getItem('kuro_pet_v1');
    if (!raw) return { inventory: { ...DEFAULT_TREAT_INVENTORY }, affection: 0 };
    const parsed = JSON.parse(raw) as {
      inventory?: Partial<Record<KuroTreatId, number>>;
      affection?: number;
    };
    return {
      inventory: {
        fish_biscuit: Math.max(0, Number(parsed.inventory?.fish_biscuit ?? 1)),
        salmon_sushi: Math.max(0, Number(parsed.inventory?.salmon_sushi ?? 0)),
        catnip_milk: Math.max(0, Number(parsed.inventory?.catnip_milk ?? 0)),
        golden_tuna: Math.max(0, Number(parsed.inventory?.golden_tuna ?? 0)),
      },
      affection: Math.max(0, Number(parsed.affection ?? 0)),
    };
  } catch {
    return { inventory: { ...DEFAULT_TREAT_INVENTORY }, affection: 0 };
  }
}

function loadSceneConfig(): { timeOfDay: TimeOfDayId; parkBackground: ParkBackgroundId } {
  try {
    const raw = window.localStorage.getItem('kuro_scene_v1');
    if (!raw) return { timeOfDay: 'morning', parkBackground: 'meadow' };
    const parsed = JSON.parse(raw) as {
      timeOfDay?: TimeOfDayId;
      parkBackground?: ParkBackgroundId;
    };
    const todValid = TIME_OF_DAY_OPTIONS.some((t) => t.id === parsed.timeOfDay);
    const bgValid = PARK_BACKGROUND_OPTIONS.some((b) => b.id === parsed.parkBackground);
    return {
      timeOfDay: todValid && parsed.timeOfDay ? parsed.timeOfDay : 'morning',
      parkBackground: bgValid && parsed.parkBackground ? parsed.parkBackground : 'meadow',
    };
  } catch {
    return { timeOfDay: 'morning', parkBackground: 'meadow' };
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>('id');
  const [mode, setMode] = useState<GameMode>('sort');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(4);
  const [lifetimeStars, setLifetimeStars] = useState(4);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  // Mode 1: Sort state
  const [waveItems, setWaveItems] = useState<WasteItemDefinition[]>(() => pickWaveItems(1));
  const [waveRemaining, setWaveRemaining] = useState<number>(() => 4);
  const [waveKey, setWaveKey] = useState(1);
  const [sortRoundComplete, setSortRoundComplete] = useState(false);

  // Mode 2: Conveyor state
  const [conveyorGameOver, setConveyorGameOver] = useState(false);

  // Mode 3: Magic Transform Quiz state
  const [magicIndex, setMagicIndex] = useState(0);
  const [magicTransformed, setMagicTransformed] = useState(false);
  const [magicWrongId, setMagicWrongId] = useState<string | null>(null);

  // Mode 4: Explore state
  const [inspectSelection, setInspectSelection] = useState<InspectSelection | null>(null);

  // Shared UI & Mascot state
  const [selectedItem, setSelectedItem] = useState<WasteItemDefinition | null>(null);
  const [kuroMessage, setKuroMessage] = useState<KuroMessage>({
    text: getText(UI_COPY.kuroGreeting.sort, 'id'),
    mood: 'idle',
    tone: 'neutral',
  });
  const [kuroReactionNonce, setKuroReactionNonce] = useState(0);
  const [kuroPatNonce, setKuroPatNonce] = useState(0);
  const [kuroTreatSignal, setKuroTreatSignal] = useState<{ colorHex: string; nonce: number } | null>(
    null
  );
  const [kuroCollapsed, setKuroCollapsed] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ambienceEnabled, setAmbienceEnabled] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<ShopTab>('snacks');
  const [sceneModalOpen, setSceneModalOpen] = useState(false);

  const [ownedWardrobe, setOwnedWardrobe] = useState<OwnedWardrobeItems>(() => loadOwnedWardrobe());
  const [wardrobeConfig, setWardrobeConfig] = useState<KuroWardrobeConfig>(() =>
    loadWardrobeConfig(loadOwnedWardrobe())
  );

  const initialPet = useMemo(() => loadPetState(), []);
  const [treatInventory, setTreatInventory] = useState<Record<KuroTreatId, number>>(
    initialPet.inventory
  );
  const [kuroAffection, setKuroAffection] = useState<number>(initialPet.affection);

  const initialScene = useMemo(() => loadSceneConfig(), []);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayId>(initialScene.timeOfDay);
  const [parkBackground, setParkBackground] = useState<ParkBackgroundId>(initialScene.parkBackground);

  const [bestStreak, setBestStreak] = useState(0);
  const [totalSorted, setTotalSorted] = useState(0);
  const [magicSolved, setMagicSolved] = useState(0);
  const [recentBadge, setRecentBadge] = useState<AchievementDefinition | null>(null);
  const seenBadgesRef = useRef<Set<string>>(new Set());
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const todaysMissions = useMemo(() => getTodaysMissions(todayDateKey), [todayDateKey]);
  const [dailyProgress, setDailyProgress] = useState<DailyMissionProgress>(() =>
    loadDailyProgress(getTodayDateKey())
  );
  const [zoomSignal, setZoomSignal] = useState<{ delta: number; nonce: number } | null>(null);
  const [resetCamNonce, setResetCamNonce] = useState(0);

  const magicItem = useMemo(() => WASTE_ITEMS[magicIndex % WASTE_ITEMS.length], [magicIndex]);

  const ownedTreatsCount = useMemo(
    () =>
      Object.values(treatInventory).reduce((sum, count) => sum + Math.max(0, count), 0),
    [treatInventory]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        `kuro_daily_${dailyProgress.dateKey}`,
        JSON.stringify(dailyProgress)
      );
    } catch {
      // ignore
    }
  }, [dailyProgress]);

  useEffect(() => {
    try {
      window.localStorage.setItem('kuro_wardrobe_v1', JSON.stringify(wardrobeConfig));
    } catch {
      // ignore
    }
  }, [wardrobeConfig]);

  useEffect(() => {
    try {
      window.localStorage.setItem('kuro_owned_wardrobe_v1', JSON.stringify(ownedWardrobe));
    } catch {
      // ignore
    }
  }, [ownedWardrobe]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'kuro_pet_v1',
        JSON.stringify({ inventory: treatInventory, affection: kuroAffection })
      );
    } catch {
      // ignore
    }
  }, [treatInventory, kuroAffection]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'kuro_scene_v1',
        JSON.stringify({ timeOfDay, parkBackground })
      );
    } catch {
      // ignore
    }
  }, [timeOfDay, parkBackground]);

  useEffect(() => {
    const unlock = () => {
      soundFx.unlockAndStartAmbience();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Automatically relax Kuro's active reaction mood back to 'idle'
  useEffect(() => {
    if (kuroMessage.mood === 'idle') return;
    const delay =
      kuroMessage.mood === 'sad' ? 6000 : kuroMessage.mood === 'purring' ? 4200 : 4500;
    const timer = window.setTimeout(() => {
      setKuroMessage((prev) =>
        prev.mood === 'idle' ? prev : { ...prev, mood: 'idle' }
      );
    }, delay);
    return () => window.clearTimeout(timer);
  }, [kuroMessage.mood, kuroReactionNonce, kuroPatNonce]);

  const dailyCompletedCount = useMemo(
    () =>
      todaysMissions.filter((m) => m.getCurrent(dailyProgress) >= m.target).length,
    [todaysMissions, dailyProgress]
  );

  const dailyClaimableCount = useMemo(
    () =>
      todaysMissions.filter(
        (m) =>
          m.getCurrent(dailyProgress) >= m.target &&
          !dailyProgress.claimedIds.includes(m.id)
      ).length,
    [todaysMissions, dailyProgress]
  );

  const achievementProgress: AchievementProgress = useMemo(
    () => ({
      score,
      stars: lifetimeStars,
      level,
      bestStreak,
      totalSorted,
      magicSolved,
    }),
    [score, lifetimeStars, level, bestStreak, totalSorted, magicSolved]
  );

  const unlockedBadgesCount = useMemo(
    () =>
      ACHIEVEMENTS.filter((b) => b.getCurrent(achievementProgress) >= b.target).length,
    [achievementProgress]
  );

  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENTS.find(
      (b) =>
        b.getCurrent(achievementProgress) >= b.target &&
        !seenBadgesRef.current.has(b.id)
    );
    if (newlyUnlocked) {
      ACHIEVEMENTS.forEach((b) => {
        if (b.getCurrent(achievementProgress) >= b.target) {
          seenBadgesRef.current.add(b.id);
        }
      });
      setRecentBadge(newlyUnlocked);
      soundFx.playLevelUp();
      const timer = window.setTimeout(() => setRecentBadge(null), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [achievementProgress]);

  const awardStars = useCallback((delta: number) => {
    setStars((st) => st + delta);
    setLifetimeStars((lt) => lt + delta);
  }, []);

  const handleSelectMode = useCallback(
    (nextMode: GameMode) => {
      setWardrobeOpen(false);
      setMode(nextMode);
      setSelectedItem(null);
      setSortRoundComplete(false);
      setConveyorGameOver(false);
      setInspectSelection(null);
      if (nextMode === 'conveyor') {
        setLives(3);
      }
      if (nextMode === 'magic') {
        setMagicTransformed(false);
        setMagicWrongId(null);
      }
      setKuroMessage({
        text: getText(UI_COPY.kuroGreeting[nextMode], lang),
        mood: 'talking',
        tone: 'neutral',
      });
    },
    [lang]
  );

  const handleChangeLang = useCallback(
    (nextLang: Language) => {
      setLang(nextLang);
      setKuroMessage({
        text: getText(UI_COPY.kuroGreeting[mode], nextLang),
        mood: 'talking',
        tone: 'neutral',
      });
    },
    [mode]
  );

  const handleSortResult = useCallback(
    (item: WasteItemDefinition, correct: boolean, _targetBin: WasteCategory) => {
      if (correct) {
        setTotalSorted((t) => t + 1);
        setStreak((prev) => {
          const nextStreak = prev + 1;
          setBestStreak((b) => Math.max(b, nextStreak));
          setScore((s) => s + 100 + Math.min(nextStreak - 1, 5) * 20);
          setDailyProgress((dp) => ({
            ...dp,
            sortedTotal: dp.sortedTotal + 1,
            sortedOrganic: dp.sortedOrganic + (item.category === 'organic' ? 1 : 0),
            sortedPaper: dp.sortedPaper + (item.category === 'paper' ? 1 : 0),
            sortedPlastic: dp.sortedPlastic + (item.category === 'plastic' ? 1 : 0),
            sortedMetalGlass: dp.sortedMetalGlass + (item.category === 'metal_glass' ? 1 : 0),
            bestStreak: Math.max(dp.bestStreak, nextStreak),
          }));
          return nextStreak;
        });
        awardStars(1);
        setKuroMessage({
          text: `${lang === 'id' ? 'Hore! ' : 'Awesome! '}${getText(item.fact, lang)}`,
          mood: 'happy',
          tone: 'success',
        });
        setKuroReactionNonce((n) => n + 1);

        if (mode === 'sort') {
          setWaveRemaining((rem) => {
            const nextRem = rem - 1;
            if (nextRem <= 0) {
              setSortRoundComplete(true);
              soundFx.playLevelUp();
            }
            return nextRem;
          });
        }
      } else {
        setStreak(0);
        setKuroMessage({
          text: `${lang === 'id' ? 'Yah, belum tepat... ' : 'Aww, not quite... '}${getText(item.hint, lang)}`,
          mood: 'sad',
          tone: 'hint',
        });
        setKuroReactionNonce((n) => n + 1);
      }
    },
    [lang, mode, awardStars]
  );

  const handleConveyorMiss = useCallback(
    (item: WasteItemDefinition) => {
      soundFx.playWrong();
      setStreak(0);
      setLives((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setConveyorGameOver(true);
        }
        return next;
      });
      setKuroMessage({
        text:
          lang === 'id'
            ? `Yah, ${getText(item.name, lang)} terlewat! Ayo tangkap benda berikutnya!`
            : `Oops, ${getText(item.name, lang)} slipped past! Let's catch the next one!`,
        mood: 'sad',
        tone: 'hint',
      });
      setKuroReactionNonce((n) => n + 1);
    },
    [lang]
  );

  const handleNextSortWave = useCallback(() => {
    const nextLevel = level + 1;
    const nextItems = pickWaveItems(nextLevel);
    setLevel(nextLevel);
    setWaveItems(nextItems);
    setWaveRemaining(nextItems.length);
    setWaveKey((k) => k + 1);
    setSortRoundComplete(false);
    setKuroMessage({
      text:
        lang === 'id'
          ? `Level ${nextLevel}! Ayo pilah ${nextItems.length} sampah ini bersama Kuro!`
          : `Level ${nextLevel}! Let's sort these ${nextItems.length} items together!`,
      mood: 'happy',
      tone: 'neutral',
    });
  }, [level, lang]);

  const handleRestartConveyor = useCallback(() => {
    setLives(3);
    setStreak(0);
    setConveyorGameOver(false);
    setWaveKey((k) => k + 1);
    setKuroMessage({
      text: getText(UI_COPY.kuroGreeting.conveyor, lang),
      mood: 'happy',
      tone: 'neutral',
    });
  }, [lang]);

  const handleMagicAnswer = useCallback(
    (choice: MagicChoice) => {
      if (magicTransformed) return;
      if (choice.isCorrect) {
        soundFx.playMagic();
        setMagicTransformed(true);
        setMagicWrongId(null);
        setScore((s) => s + 150);
        awardStars(2);
        setMagicSolved((m) => m + 1);
        setStreak((k) => {
          const next = k + 1;
          setBestStreak((b) => Math.max(b, next));
          setDailyProgress((dp) => ({
            ...dp,
            magicSolved: dp.magicSolved + 1,
            bestStreak: Math.max(dp.bestStreak, next),
          }));
          return next;
        });
        setKuroMessage({
          text:
            lang === 'id'
              ? `Abrakadabra! ${getText(magicItem.name, lang)} berubah jadi ${getText(magicItem.treasureName, lang)}!`
              : `Abracadabra! ${getText(magicItem.name, lang)} turned into ${getText(magicItem.treasureName, lang)}!`,
          mood: 'happy',
          tone: 'success',
        });
        setKuroReactionNonce((n) => n + 1);
      } else {
        soundFx.playWrong();
        setMagicWrongId(choice.id);
        setStreak(0);
        setKuroMessage({
          text: `${lang === 'id' ? 'Yah, kurang tepat... ' : 'Aww, not quite... '}${getText(magicItem.hint, lang)}`,
          mood: 'sad',
          tone: 'hint',
        });
        setKuroReactionNonce((n) => n + 1);
      }
    },
    [magicTransformed, magicItem, lang, awardStars]
  );

  const handleMagicNext = useCallback(() => {
    setMagicIndex((i) => (i + 1) % WASTE_ITEMS.length);
    setMagicTransformed(false);
    setMagicWrongId(null);
    setKuroMessage({
      text: getText(UI_COPY.kuroGreeting.magic, lang),
      mood: 'talking',
      tone: 'neutral',
    });
  }, [lang]);

  const handleInspectSelect = useCallback(
    (selection: InspectSelection) => {
      setInspectSelection(selection);
      const binDef = BIN_DEFINITIONS[selection.category];
      setKuroMessage({
        text: selection.item
          ? `${getText(selection.item.name, lang)}: ${getText(selection.item.fact, lang)}`
          : `${getText(binDef.name, lang)}: ${getText(binDef.description, lang)}`,
        mood: 'talking',
        tone: 'neutral',
      });
    },
    [lang]
  );

  const handleAskKuroTip = useCallback(() => {
    soundFx.playMeow();
    const randomItem = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
    const bin = BIN_DEFINITIONS[randomItem.category];
    setKuroMessage({
      text:
        lang === 'id'
          ? `Meow! Tahukah kamu? ${getText(randomItem.name, lang)} masuk ke tong ${getText(bin.shortName, lang)}. ${getText(randomItem.fact, lang)}`
          : `Meow! Fun fact: ${getText(randomItem.name, lang)} goes into ${getText(bin.shortName, lang)}. ${getText(randomItem.fact, lang)}`,
      mood: 'happy',
      tone: 'neutral',
    });
    setKuroReactionNonce((n) => n + 1);
  }, [lang]);

  const handlePatKuro = useCallback(() => {
    soundFx.playPurr();
    setKuroAffection((a) => a + 1);
    setKuroPatNonce((n) => n + 1);
    setKuroMessage({
      text:
        lang === 'id'
          ? 'Purrrr~ Enak sekali dielus! Kuro makin sayang padamu!'
          : 'Purrrr~ That feels so cozy! Kuro loves your pats!',
      mood: 'purring',
      tone: 'success',
    });
  }, [lang]);

  const handleBuyTreat = useCallback(
    (treat: TreatItemDefinition) => {
      if (stars < treat.costStars) return;
      soundFx.playBuy();
      setStars((st) => st - treat.costStars);
      setTreatInventory((inv) => ({
        ...inv,
        [treat.id]: (inv[treat.id] ?? 0) + 1,
      }));
    },
    [stars]
  );

  const handleFeedTreat = useCallback(
    (treat: TreatItemDefinition) => {
      if ((treatInventory[treat.id] ?? 0) <= 0) return;
      soundFx.playEatTreat();
      setTreatInventory((inv) => ({
        ...inv,
        [treat.id]: Math.max(0, (inv[treat.id] ?? 0) - 1),
      }));
      setScore((s) => s + treat.bonusScore);
      setKuroAffection((a) => a + 1);
      setShopOpen(false);
      setKuroTreatSignal((prev) => ({
        colorHex: treat.accentHex,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
      setKuroMessage({
        text:
          lang === 'id'
            ? `Nyam nyam! ${getText(treat.name, lang)} lezat sekali! +${treat.bonusScore} skor untukmu!`
            : `Yum yum! The ${getText(treat.name, lang)} was delicious! +${treat.bonusScore} bonus score!`,
        mood: 'happy',
        tone: 'success',
      });
      setKuroReactionNonce((n) => n + 1);
    },
    [treatInventory, lang]
  );

  const handleFeedQuick = useCallback(() => {
    const availableTreat = TREAT_ITEMS.find((t) => (treatInventory[t.id] ?? 0) > 0);
    if (availableTreat) {
      handleFeedTreat(availableTreat);
    } else {
      setShopTab('snacks');
      setShopOpen(true);
      setKuroMessage({
        text:
          lang === 'id'
            ? 'Meow~ Camilannya habis! Yuk beli camilan baru untuk Kuro di Toko!'
            : 'Meow~ Out of snacks! Let us buy a tasty treat in the Shop!',
        mood: 'hint',
        tone: 'hint',
      });
    }
  }, [treatInventory, handleFeedTreat, lang]);

  const handleBuyWardrobeItem = useCallback(
    (category: WardrobeTab, id: string, costStars: number) => {
      if (stars < costStars) return;
      soundFx.playBuy();
      setStars((st) => st - costStars);
      setOwnedWardrobe((prev) => {
        if (category === 'outfit') {
          return {
            ...prev,
            outfits: Array.from(new Set([...prev.outfits, id as KuroOutfitId])),
          };
        }
        if (category === 'hat') {
          return {
            ...prev,
            hats: Array.from(new Set([...prev.hats, id as KuroHatId])),
          };
        }
        return {
          ...prev,
          accessories: Array.from(new Set([...prev.accessories, id as KuroAccessoryId])),
        };
      });
      // Immediately put the new item on Kuro
      setWardrobeConfig((prev) => {
        if (category === 'outfit') return { ...prev, outfit: id as KuroOutfitId };
        if (category === 'hat') return { ...prev, hat: id as KuroHatId };
        return { ...prev, accessory: id as KuroAccessoryId };
      });
    },
    [stars]
  );

  const handleEquipWardrobeItem = useCallback((category: WardrobeTab, id: string) => {
    soundFx.playPickup();
    setWardrobeConfig((prev) => {
      if (category === 'outfit') return { ...prev, outfit: id as KuroOutfitId };
      if (category === 'hat') return { ...prev, hat: id as KuroHatId };
      return { ...prev, accessory: id as KuroAccessoryId };
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundFx.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleAmbience = useCallback(() => {
    setAmbienceEnabled((prev) => {
      const next = !prev;
      soundFx.setAmbienceEnabled(next);
      return next;
    });
  }, []);

  const handleClaimMission = useCallback(
    (mission: DailyMissionDefinition) => {
      if (dailyProgress.claimedIds.includes(mission.id)) return;
      if (mission.getCurrent(dailyProgress) < mission.target) return;
      soundFx.playLevelUp();
      setScore((s) => s + mission.rewardScore);
      awardStars(mission.rewardStars);
      setDailyProgress((dp) => ({
        ...dp,
        claimedIds: [...dp.claimedIds, mission.id],
      }));
      setKuroMessage({
        text:
          lang === 'id'
            ? `Hore! Misi "${getText(mission.title, lang)}" selesai! +${mission.rewardScore} skor dan +${mission.rewardStars} bintang!`
            : `Hooray! Daily mission "${getText(mission.title, lang)}" claimed! +${mission.rewardScore} score and +${mission.rewardStars} stars!`,
        mood: 'happy',
        tone: 'success',
      });
      setKuroReactionNonce((n) => n + 1);
    },
    [dailyProgress, lang, awardStars]
  );

  const handleChangeWardrobe = useCallback((next: KuroWardrobeConfig) => {
    soundFx.playPickup();
    setWardrobeConfig(next);
  }, []);

  const handleRandomizeWardrobe = useCallback(() => {
    soundFx.playMagic();
    const outfits = ownedWardrobe.outfits;
    const hats = ownedWardrobe.hats;
    const accessories = ownedWardrobe.accessories;
    const outfit = outfits[Math.floor(Math.random() * outfits.length)];
    const hat = hats[Math.floor(Math.random() * hats.length)];
    const accessory = accessories[Math.floor(Math.random() * accessories.length)];
    setWardrobeConfig({ outfit, hat, accessory });
  }, [ownedWardrobe]);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Interactive 3D EcoPark Canvas */}
      <EcoWorld3D
        mode={mode}
        lang={lang}
        waveItems={waveItems}
        waveKey={waveKey}
        conveyorRunning={
          !conveyorGameOver &&
          !helpOpen &&
          !achievementsOpen &&
          !missionsOpen &&
          !wardrobeOpen &&
          !shopOpen &&
          !sceneModalOpen
        }
        conveyorSpeed={1.25 + Math.min(level - 1, 5) * 0.16}
        magicItem={magicItem}
        magicTransformed={magicTransformed}
        kuroMood={kuroMessage.mood}
        kuroReactionNonce={kuroReactionNonce}
        kuroPatNonce={kuroPatNonce}
        kuroTreatSignal={kuroTreatSignal}
        wardrobeOpen={wardrobeOpen}
        wardrobeConfig={wardrobeConfig}
        timeOfDay={timeOfDay}
        parkBackground={parkBackground}
        zoomSignal={zoomSignal}
        resetCamNonce={resetCamNonce}
        onSortResult={handleSortResult}
        onConveyorMiss={handleConveyorMiss}
        onKuroClick={handleAskKuroTip}
        onKuroPat={handlePatKuro}
        onInspectSelect={handleInspectSelect}
        onSelectedItemChange={setSelectedItem}
      />

      {/* Top Navigation Bar */}
      <TopBar
        mode={mode}
        lang={lang}
        wardrobeOpen={wardrobeOpen}
        onSelectMode={handleSelectMode}
        onOpenHelp={() => {
          setWardrobeOpen(false);
          setHelpOpen(true);
        }}
        onToggleWardrobe={() => {
          setWardrobeOpen((o) => {
            const next = !o;
            if (next) {
              setKuroMessage((prev) => ({ ...prev, mood: 'idle' }));
            }
            return next;
          });
        }}
      />

      {/* Kuro Mascot Guide Bubble */}
      <KuroGuideCard
        message={kuroMessage}
        lang={lang}
        collapsed={kuroCollapsed}
        wardrobe={wardrobeConfig}
        ownedTreatsCount={ownedTreatsCount}
        hidden={wardrobeOpen}
        onToggleCollapse={() => setKuroCollapsed((c) => !c)}
        onAskTip={handleAskKuroTip}
        onPatKuro={handlePatKuro}
        onFeedKuro={handleFeedQuick}
      />

      {/* Kuro 3D Wardrobe / Closet Customizer */}
      <ClosetPanel
        open={wardrobeOpen}
        lang={lang}
        config={wardrobeConfig}
        ownedWardrobe={ownedWardrobe}
        onChangeConfig={handleChangeWardrobe}
        onRandomize={handleRandomizeWardrobe}
        onOpenShopFashion={() => {
          setShopTab('fashion');
          setShopOpen(true);
        }}
        onClose={() => setWardrobeOpen(false)}
      />

      {/* Mode-Specific Interactive Overlays (Quiz, Inspector, Celebrations) */}
      {!wardrobeOpen && (
        <MagicQuizOverlay
          mode={mode}
          lang={lang}
          magicItem={magicItem}
          magicTransformed={magicTransformed}
          magicWrongId={magicWrongId}
          inspectSelection={inspectSelection}
          selectedItem={selectedItem}
          sortRoundComplete={sortRoundComplete}
          conveyorGameOver={conveyorGameOver}
          score={score}
          stars={stars}
          level={level}
          onMagicAnswer={handleMagicAnswer}
          onMagicNext={handleMagicNext}
          onNextSortWave={handleNextSortWave}
          onRestartConveyor={handleRestartConveyor}
          onCloseInspect={() => setInspectSelection(null)}
        />
      )}

      {/* Newly Unlocked Achievement Toast */}
      {recentBadge && (
        <button
          type="button"
          onClick={() => {
            setRecentBadge(null);
            setAchievementsOpen(true);
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl border border-emerald-500 text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
          <span>
            {lang === 'id' ? 'Lencana Terbuka: ' : 'Badge Unlocked: '}
            <strong>{getText(recentBadge.title, lang)}</strong>
          </span>
        </button>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <BottomDock
        mode={mode}
        lang={lang}
        score={score}
        stars={stars}
        level={level}
        streak={streak}
        lives={lives}
        muted={muted}
        ambienceEnabled={ambienceEnabled}
        collapsed={dockCollapsed}
        unlockedBadgesCount={unlockedBadgesCount}
        totalBadgesCount={ACHIEVEMENTS.length}
        dailyCompletedCount={dailyCompletedCount}
        dailyTotalCount={todaysMissions.length}
        dailyClaimableCount={dailyClaimableCount}
        ownedTreatsCount={ownedTreatsCount}
        onToggleCollapse={() => setDockCollapsed((c) => !c)}
        onToggleMute={handleToggleMute}
        onToggleAmbience={handleToggleAmbience}
        onChangeLang={handleChangeLang}
        onZoomIn={() => setZoomSignal((prev) => ({ delta: -2.0, nonce: (prev?.nonce ?? 0) + 1 }))}
        onZoomOut={() => setZoomSignal((prev) => ({ delta: 2.0, nonce: (prev?.nonce ?? 0) + 1 }))}
        onResetCamera={() => setResetCamNonce((n) => n + 1)}
        onOpenAchievements={() => setAchievementsOpen(true)}
        onOpenDailyMissions={() => setMissionsOpen(true)}
        onOpenShop={() => {
          setShopTab('snacks');
          setShopOpen(true);
        }}
        onOpenSceneModal={() => setSceneModalOpen(true)}
      />

      {/* Help / Bin Guide Modal */}
      <HelpModal open={helpOpen} lang={lang} onClose={() => setHelpOpen(false)} />

      {/* Achievements Badges Modal */}
      <AchievementsModal
        open={achievementsOpen}
        lang={lang}
        progress={achievementProgress}
        onClose={() => setAchievementsOpen(false)}
      />

      {/* Daily Missions Modal */}
      <DailyMissionModal
        open={missionsOpen}
        lang={lang}
        missions={todaysMissions}
        progress={dailyProgress}
        onClaimMission={handleClaimMission}
        onClose={() => setMissionsOpen(false)}
      />

      {/* Kuro Market Shop Modal (Snacks + Clothes & Accessories) */}
      <TreatShopModal
        open={shopOpen}
        initialTab={shopTab}
        lang={lang}
        stars={stars}
        affection={kuroAffection}
        inventory={treatInventory}
        wardrobeConfig={wardrobeConfig}
        ownedWardrobe={ownedWardrobe}
        onBuyTreat={handleBuyTreat}
        onFeedTreat={handleFeedTreat}
        onBuyWardrobeItem={handleBuyWardrobeItem}
        onEquipWardrobeItem={handleEquipWardrobeItem}
        onClose={() => setShopOpen(false)}
      />

      {/* Park Background & Time of Day Selector Modal */}
      <SceneSettingsModal
        open={sceneModalOpen}
        lang={lang}
        timeOfDay={timeOfDay}
        parkBackground={parkBackground}
        onChangeTimeOfDay={(tod) => {
          soundFx.playPickup();
          setTimeOfDay(tod);
        }}
        onChangeParkBackground={(bg) => {
          soundFx.playPickup();
          setParkBackground(bg);
        }}
        onClose={() => setSceneModalOpen(false)}
      />
    </main>
  );
}
