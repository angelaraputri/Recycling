export type Language = 'id' | 'en';

export type WasteCategory = 'organic' | 'paper' | 'plastic' | 'metal_glass';

export type GameMode = 'sort' | 'conveyor' | 'magic' | 'explore';

export type KuroMood = 'idle' | 'happy' | 'sad' | 'hint' | 'talking' | 'purring';

export interface LocalizedText {
  id: string;
  en: string;
}

export interface BinDefinition {
  category: WasteCategory;
  name: LocalizedText;
  shortName: LocalizedText;
  colorHex: string;
  accentHex: string;
  description: LocalizedText;
  examples: LocalizedText;
  treasure: LocalizedText;
}

export interface MagicChoice {
  id: string;
  label: LocalizedText;
  isCorrect: boolean;
}

export interface WasteItemDefinition {
  id: string;
  category: WasteCategory;
  name: LocalizedText;
  fact: LocalizedText;
  hint: LocalizedText;
  treasureName: LocalizedText;
  magicQuestion: LocalizedText;
  magicChoices: MagicChoice[];
  treasureColorHex: string;
}

export interface KuroMessage {
  text: string;
  mood: KuroMood;
  tone: 'neutral' | 'success' | 'hint';
}

export type AchievementIconKey = 'sprout' | 'shield' | 'flame' | 'wand' | 'star' | 'trophy';

export interface AchievementProgress {
  score: number;
  stars: number;
  level: number;
  bestStreak: number;
  totalSorted: number;
  magicSolved: number;
}

export interface AchievementDefinition {
  id: string;
  icon: AchievementIconKey;
  accentHex: string;
  title: LocalizedText;
  description: LocalizedText;
  target: number;
  getCurrent: (progress: AchievementProgress) => number;
}

export interface DailyMissionProgress {
  dateKey: string;
  sortedTotal: number;
  sortedOrganic: number;
  sortedPaper: number;
  sortedPlastic: number;
  sortedMetalGlass: number;
  magicSolved: number;
  bestStreak: number;
  claimedIds: string[];
}

export interface DailyMissionDefinition {
  id: string;
  accentHex: string;
  title: LocalizedText;
  description: LocalizedText;
  target: number;
  rewardScore: number;
  rewardStars: number;
  getCurrent: (progress: DailyMissionProgress) => number;
}

export type KuroOutfitId = 'none' | 'eco_vest' | 'hoodie' | 'cape' | 'overalls';
export type KuroHatId = 'none' | 'leaf_beret' | 'sun_hat' | 'crown' | 'cap';
export type KuroAccessoryId = 'collar_bell' | 'glasses' | 'bowtie' | 'scarf';

export interface KuroWardrobeConfig {
  outfit: KuroOutfitId;
  hat: KuroHatId;
  accessory: KuroAccessoryId;
}

export interface WardrobeItemOption<T extends string = string> {
  id: T;
  costStars: number;
  swatchHex: string;
  name: LocalizedText;
  description: LocalizedText;
}

export interface OwnedWardrobeItems {
  outfits: KuroOutfitId[];
  hats: KuroHatId[];
  accessories: KuroAccessoryId[];
}

export type KuroTreatId = 'fish_biscuit' | 'salmon_sushi' | 'catnip_milk' | 'golden_tuna';

export interface TreatItemDefinition {
  id: KuroTreatId;
  costStars: number;
  bonusScore: number;
  accentHex: string;
  name: LocalizedText;
  description: LocalizedText;
}

export type TimeOfDayId = 'morning' | 'afternoon' | 'sunset' | 'night';
export type ParkBackgroundId = 'meadow' | 'beach' | 'autumn' | 'cherry';

export interface SceneOption<T extends string = string> {
  id: T;
  swatchHex: string;
  secondaryHex: string;
  name: LocalizedText;
}
