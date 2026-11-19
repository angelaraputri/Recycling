import {
  AchievementDefinition,
  BinDefinition,
  DailyMissionDefinition,
  GameMode,
  KuroAccessoryId,
  KuroHatId,
  KuroOutfitId,
  Language,
  ParkBackgroundId,
  SceneOption,
  TimeOfDayId,
  TreatItemDefinition,
  WardrobeItemOption,
  WasteCategory,
  WasteItemDefinition,
} from '../types/game';

export const BIN_DEFINITIONS: Record<WasteCategory, BinDefinition> = {
  organic: {
    category: 'organic',
    name: { id: 'Sampah Organik', en: 'Organic Waste' },
    shortName: { id: 'Organik', en: 'Organic' },
    colorHex: '#16A34A',
    accentHex: '#DCFCE7',
    description: {
      id: 'Sampah alami dari tumbuhan dan sisa makanan yang mudah membusuk.',
      en: 'Natural waste from plants and food scraps that breaks down easily.',
    },
    examples: {
      id: 'Kulit pisang, sisa apel, daun kering',
      en: 'Banana peels, apple cores, dry leaves',
    },
    treasure: {
      id: 'Pupuk kompos subur untuk menyiram tanaman!',
      en: 'Rich compost soil to help plants grow!',
    },
  },
  paper: {
    category: 'paper',
    name: { id: 'Kertas & Kardus', en: 'Paper & Cardboard' },
    shortName: { id: 'Kertas', en: 'Paper' },
    colorHex: '#0284C7',
    accentHex: '#E0F2FE',
    description: {
      id: 'Semua jenis kertas bersih dan kardus bekas yang bisa diolah lagi.',
      en: 'Clean paper and cardboard boxes that can be pulped into new paper.',
    },
    examples: {
      id: 'Kardus paket, koran bekas, kotak susu',
      en: 'Cardboard boxes, newspapers, milk cartons',
    },
    treasure: {
      id: 'Buku gambar baru dan kerajinan kertas!',
      en: 'Fresh sketchbooks and paper crafts!',
    },
  },
  plastic: {
    category: 'plastic',
    name: { id: 'Plastik', en: 'Plastic' },
    shortName: { id: 'Plastik', en: 'Plastic' },
    colorHex: '#EAB308',
    accentHex: '#FEF9C3',
    description: {
      id: 'Wadah dan botol plastik yang tidak boleh dibuang sembarangan.',
      en: 'Plastic bottles, cups, and bags that can be melted and remolded.',
    },
    examples: {
      id: 'Botol minum, gelas plastik, kantong plastik',
      en: 'Water bottles, plastic cups, shopping bags',
    },
    treasure: {
      id: 'Tas sekolah keren, pot bunga, dan serat baju!',
      en: 'Sturdy school bags, flower pots, and fleece fabric!',
    },
  },
  metal_glass: {
    category: 'metal_glass',
    name: { id: 'Logam & Kaca', en: 'Metal & Glass' },
    shortName: { id: 'Logam & Kaca', en: 'Metal & Glass' },
    colorHex: '#DC2626',
    accentHex: '#FEE2E2',
    description: {
      id: 'Benda keras dari kaleng logam dan botol kaca yang awet didaur ulang.',
      en: 'Sturdy metal cans and glass bottles that can be recycled endlessly.',
    },
    examples: {
      id: 'Kaleng minuman, botol kaca, stoples kaleng',
      en: 'Soda cans, glass bottles, tin jars',
    },
    treasure: {
      id: 'Sepeda mini, kaleng baru, dan botol kaca berkilau!',
      en: 'Bicycle frames, new cans, and sparkling glass jars!',
    },
  },
};

export const BIN_ORDER: WasteCategory[] = ['organic', 'paper', 'plastic', 'metal_glass'];

export const WASTE_ITEMS: WasteItemDefinition[] = [
  {
    id: 'banana_peel',
    category: 'organic',
    name: { id: 'Kulit Pisang', en: 'Banana Peel' },
    fact: {
      id: 'Kulit pisang mudah terurai dan berubah menjadi kompos penyubur bunga!',
      en: 'Banana peels break down quickly and turn into yummy compost for flowers!',
    },
    hint: {
      id: 'Kulit pisang berasal dari buah alami. Masukkan ke tong Hijau (Organik) ya!',
      en: 'Banana peels come from fruit. Drop it in the Green (Organic) bin!',
    },
    treasureName: { id: 'Pot Bunga Kompos', en: 'Compost Flower Pot' },
    magicQuestion: {
      id: 'Jika kulit pisang didaur ulang dengan tanah, ia berubah menjadi apa?',
      en: 'When banana peels are recycled with soil, what do they become?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Pupuk kompos untuk bunga', en: 'Compost soil for flowers' }, isCorrect: true },
      { id: 'b', label: { id: 'Botol kaca bening', en: 'Clear glass bottle' }, isCorrect: false },
      { id: 'c', label: { id: 'Sendok logam', en: 'Metal spoon' }, isCorrect: false },
    ],
    treasureColorHex: '#EC4899',
  },
  {
    id: 'apple_core',
    category: 'organic',
    name: { id: 'Sisa Apel', en: 'Apple Core' },
    fact: {
      id: 'Sisa buah apel membantu cacing tanah membuat pupuk alami yang kaya nutrisi.',
      en: 'Apple cores help earthworms make rich natural fertilizer for gardens.',
    },
    hint: {
      id: 'Sisa buah apel termasuk sampah basah alami. Pilih tong Hijau (Organik)!',
      en: 'Apple cores are natural food scraps. Choose the Green (Organic) bin!',
    },
    treasureName: { id: 'Pohon Apel Kecil', en: 'Young Sapling Tree' },
    magicQuestion: {
      id: 'Sisa apel yang dikomposkan paling berguna untuk apa ya?',
      en: 'What is composted apple waste best used for?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Menyuburkan bibit pohon', en: 'Nourishing young trees' }, isCorrect: true },
      { id: 'b', label: { id: 'Membuat ban sepeda', en: 'Making bicycle tires' }, isCorrect: false },
      { id: 'c', label: { id: 'Membuat kaleng minuman', en: 'Making soda cans' }, isCorrect: false },
    ],
    treasureColorHex: '#22C55E',
  },
  {
    id: 'dry_leaf',
    category: 'organic',
    name: { id: 'Daun Kering', en: 'Dry Leaves' },
    fact: {
      id: 'Daun kering yang dikumpulkan bisa menjadi mulsa dan kompos taman sekolah!',
      en: 'Collected dry leaves make cozy garden mulch and rich compost!',
    },
    hint: {
      id: 'Daun berasal dari pohon. Yuk masukkan ke tong Hijau (Organik)!',
      en: 'Leaves come from trees. Put them into the Green (Organic) bin!',
    },
    treasureName: { id: 'Taman Subur', en: 'Blooming Garden' },
    magicQuestion: {
      id: 'Tumpukan daun kering di taman sebaiknya diolah menjadi apa?',
      en: 'What should piles of dry garden leaves be turned into?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Kompos penyubur taman', en: 'Garden-boosting compost' }, isCorrect: true },
      { id: 'b', label: { id: 'Kantong plastik', en: 'Plastic bags' }, isCorrect: false },
      { id: 'c', label: { id: 'Paku besi', en: 'Iron nails' }, isCorrect: false },
    ],
    treasureColorHex: '#10B981',
  },
  {
    id: 'cardboard_box',
    category: 'paper',
    name: { id: 'Kardus Bekas', en: 'Cardboard Box' },
    fact: {
      id: 'Kardus bekas bisa digiling menjadi bubur kertas dan dibentuk jadi buku tulis baru!',
      en: 'Cardboard boxes are pulped to make brand-new notebooks and boxes!',
    },
    hint: {
      id: 'Kardus terbuat dari serat kertas tebal. Masukkan ke tong Biru (Kertas)!',
      en: 'Cardboard is thick paper fiber. Drop it in the Blue (Paper) bin!',
    },
    treasureName: { id: 'Rumah Kucing Kardus', en: 'Cardboard Cat House' },
    magicQuestion: {
      id: 'Kardus bekas yang didaur ulang bisa disulap menjadi apa?',
      en: 'Recycled cardboard can be transformed into what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Buku gambar & kotak baru', en: 'Sketchbooks & new boxes' }, isCorrect: true },
      { id: 'b', label: { id: 'Botol minum plastik', en: 'Plastic water bottles' }, isCorrect: false },
      { id: 'c', label: { id: 'Gelas kaca', en: 'Glass tumblers' }, isCorrect: false },
    ],
    treasureColorHex: '#F59E0B',
  },
  {
    id: 'newspaper',
    category: 'paper',
    name: { id: 'Koran Bekas', en: 'Old Newspaper' },
    fact: {
      id: 'Mendaur ulang koran bekas menyelamatkan banyak pohon di hutan agar tetap rimbun!',
      en: 'Recycling newspapers saves lots of forest trees so birds keep their homes!',
    },
    hint: {
      id: 'Koran itu lembaran kertas. Ayo masukkan ke tong Biru (Kertas)!',
      en: 'Newspapers are paper sheets. Put it in the Blue (Paper) bin!',
    },
    treasureName: { id: 'Buku Tulis Sekolah', en: 'School Notebook' },
    magicQuestion: {
      id: 'Mengapa mendaur ulang koran bekas itu hebat bagi bumi?',
      en: 'Why is recycling old newspapers awesome for Earth?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Menyelamatkan pohon & jadi buku baru', en: 'Saves trees & makes new books' }, isCorrect: true },
      { id: 'b', label: { id: 'Menghasilkan bensin', en: 'Produces gasoline' }, isCorrect: false },
      { id: 'c', label: { id: 'Berubah menjadi batu bata', en: 'Turns into stone bricks' }, isCorrect: false },
    ],
    treasureColorHex: '#38BDF8',
  },
  {
    id: 'milk_carton',
    category: 'paper',
    name: { id: 'Kotak Susu', en: 'Milk Carton' },
    fact: {
      id: 'Kotak susu karton yang dibilas bersih bisa didaur ulang menjadi tisu dan kardus!',
      en: 'Rinsed paper milk cartons can be recycled into tissues and cardboard!',
    },
    hint: {
      id: 'Kotak susu terbuat dari karton kertas. Cocoknya ke tong Biru (Kertas)!',
      en: 'Milk cartons are made of paperboard. They belong in the Blue (Paper) bin!',
    },
    treasureName: { id: 'Kotak Pensil Kertas', en: 'Recycled Pencil Box' },
    magicQuestion: {
      id: 'Setelah dibilas, kotak susu karton bisa diolah menjadi apa?',
      en: 'After rinsing, paper milk cartons can be turned into what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Kertas tisu & kotak pensil', en: 'Paper tissues & pencil boxes' }, isCorrect: true },
      { id: 'b', label: { id: 'Kaca jendela', en: 'Window glass' }, isCorrect: false },
      { id: 'c', label: { id: 'Tutup kaleng besi', en: 'Iron tin lids' }, isCorrect: false },
    ],
    treasureColorHex: '#60A5FA',
  },
  {
    id: 'plastic_bottle',
    category: 'plastic',
    name: { id: 'Botol Plastik', en: 'Plastic Bottle' },
    fact: {
      id: 'Botol plastik PET bisa dilelehkan jadi benang untuk tas ransel dan jaket hangat!',
      en: 'Plastic bottles can be melted into cozy yarn for backpacks and jackets!',
    },
    hint: {
      id: 'Botol minum bening ini bahan plastik. Masukkan ke tong Kuning (Plastik)!',
      en: 'This water bottle is plastic. Drop it in the Yellow (Plastic) bin!',
    },
    treasureName: { id: 'Tas Ransel Eco', en: 'Eco Backpack' },
    magicQuestion: {
      id: 'Botol plastik bekas bisa dilelehkan dan diubah menjadi benda apa?',
      en: 'Melted plastic bottles can be spun and crafted into what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Tas sekolah & serat kain', en: 'School bags & fabric yarn' }, isCorrect: true },
      { id: 'b', label: { id: 'Pupuk daun', en: 'Leaf fertilizer' }, isCorrect: false },
      { id: 'c', label: { id: 'Kertas koran', en: 'Newspaper sheets' }, isCorrect: false },
    ],
    treasureColorHex: '#F97316',
  },
  {
    id: 'plastic_cup',
    category: 'plastic',
    name: { id: 'Gelas Plastik', en: 'Plastic Cup' },
    fact: {
      id: 'Gelas minuman plastik yang dipilah rapi bisa dicacah menjadi pot tanaman warna-warni!',
      en: 'Sorted plastic cups can be shredded and remolded into colorful plant pots!',
    },
    hint: {
      id: 'Gelas es buah ini berbahan plastik. Masukkan ke tong Kuning (Plastik)!',
      en: 'This drink cup is made of plastic. Put it in the Yellow (Plastic) bin!',
    },
    treasureName: { id: 'Pot Tanaman Ceria', en: 'Colorful Planter' },
    magicQuestion: {
      id: 'Gelas plastik yang dicacah bersih cocok diubah menjadi apa?',
      en: 'Clean shredded plastic cups are great for making what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Pot tanaman & penggaris plastik', en: 'Plant pots & plastic rulers' }, isCorrect: true },
      { id: 'b', label: { id: 'Kulit buah kompos', en: 'Fruit compost' }, isCorrect: false },
      { id: 'c', label: { id: 'Roda besi kereta', en: 'Steel train wheels' }, isCorrect: false },
    ],
    treasureColorHex: '#FACC15',
  },
  {
    id: 'plastic_bag',
    category: 'plastic',
    name: { id: 'Kantong Plastik', en: 'Plastic Bag' },
    fact: {
      id: 'Kantong plastik butuh ratusan tahun untuk terurai, jadi harus dikumpulkan untuk didaur ulang!',
      en: 'Plastic bags take hundreds of years to break down, so recycling them keeps rivers clean!',
    },
    hint: {
      id: 'Kantong belanja ini berbahan plastik. Yuk ke tong Kuning (Plastik)!',
      en: 'This shopping bag is plastic. Drop it in the Yellow (Plastic) bin!',
    },
    treasureName: { id: 'Bangku Taman Eco', en: 'Eco Park Bench' },
    magicQuestion: {
      id: 'Kantong plastik daur ulang sering dipadatkan menjadi bahan apa?',
      en: 'Recycled plastic bags are pressed together to make what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Papan bangku taman tahan air', en: 'Waterproof park bench planks' }, isCorrect: true },
      { id: 'b', label: { id: 'Daun kompos', en: 'Leaf compost' }, isCorrect: false },
      { id: 'c', label: { id: 'Botol kaca sirup', en: 'Glass syrup bottles' }, isCorrect: false },
    ],
    treasureColorHex: '#FB923C',
  },
  {
    id: 'soda_can',
    category: 'metal_glass',
    name: { id: 'Kaleng Minuman', en: 'Soda Can' },
    fact: {
      id: 'Kaleng aluminium bisa didaur ulang berkali-kali tanpa kehilangan kekuatannya!',
      en: 'Aluminum cans can be recycled over and over without losing strength!',
    },
    hint: {
      id: 'Kaleng ini terbuat dari logam aluminium. Masukkan ke tong Merah (Logam & Kaca)!',
      en: 'This can is made of aluminum metal. Drop it in the Red (Metal & Glass) bin!',
    },
    treasureName: { id: 'Sepeda Mini Eco', en: 'Mini Eco Bicycle' },
    magicQuestion: {
      id: 'Ratusan kaleng aluminium bekas bisa dilebur menjadi benda keren apa?',
      en: 'Recycled aluminum cans can be melted down to build what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Rangka sepeda & kaleng baru', en: 'Bicycle frames & new cans' }, isCorrect: true },
      { id: 'b', label: { id: 'Buku cerita bergambar', en: 'Picture storybooks' }, isCorrect: false },
      { id: 'c', label: { id: 'Kompos sayuran', en: 'Vegetable compost' }, isCorrect: false },
    ],
    treasureColorHex: '#EF4444',
  },
  {
    id: 'glass_bottle',
    category: 'metal_glass',
    name: { id: 'Botol Kaca', en: 'Glass Bottle' },
    fact: {
      id: 'Kaca bisa dilebur di tungku panas dan dicetak lagi menjadi botol baru yang berkilau!',
      en: 'Glass melts in hot furnaces and turns into brand-new sparkling bottles!',
    },
    hint: {
      id: 'Hati-hati benda kaca! Masukkan ke tong Merah (Logam & Kaca)!',
      en: 'Careful, it is glass! Place it in the Red (Metal & Glass) bin!',
    },
    treasureName: { id: 'Lampu Hias Kaca', en: 'Sparkling Glass Lamp' },
    magicQuestion: {
      id: 'Botol kaca bekas yang dilebur ulang dapat dibuat menjadi apa?',
      en: 'Melted recycled glass bottles can be shaped into what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Stoples kaca & lampu hias', en: 'Glass jars & decorative lamps' }, isCorrect: true },
      { id: 'b', label: { id: 'Kertas lipat origami', en: 'Origami paper' }, isCorrect: false },
      { id: 'c', label: { id: 'Kantong belanja plastik', en: 'Plastic shopping bags' }, isCorrect: false },
    ],
    treasureColorHex: '#2DD4BF',
  },
  {
    id: 'tin_jar',
    category: 'metal_glass',
    name: { id: 'Kaleng Biskuit', en: 'Tin Biscuit Jar' },
    fact: {
      id: 'Kaleng logam bekas menghemat banyak energi tambang saat didaur ulang kembali!',
      en: 'Recycling metal tins saves huge amounts of energy compared to mining new metal!',
    },
    hint: {
      id: 'Stoples kaleng ini terbuat dari logam. Ayo ke tong Merah (Logam & Kaca)!',
      en: 'This tin jar is made of metal. Put it in the Red (Metal & Glass) bin!',
    },
    treasureName: { id: 'Mobil Mainan Logam', en: 'Recycled Metal Toy Car' },
    magicQuestion: {
      id: 'Kaleng biskuit logam yang didaur ulang bisa diolah menjadi apa?',
      en: 'Recycled metal biscuit tins can be turned into what?',
    },
    magicChoices: [
      { id: 'a', label: { id: 'Mainan logam & bagian sepeda', en: 'Metal toys & bike parts' }, isCorrect: true },
      { id: 'b', label: { id: 'Pupuk kompos basah', en: 'Wet compost' }, isCorrect: false },
      { id: 'c', label: { id: 'Koran harian', en: 'Daily newspapers' }, isCorrect: false },
    ],
    treasureColorHex: '#F43F5E',
  },
];

export const UI_COPY = {
  brand: 'Kuro EcoPark',
  modes: {
    sort: { id: 'Pilah 3D', en: '3D Sort' },
    conveyor: { id: 'Ban Berjalan', en: 'Conveyor' },
    magic: { id: 'Sulap Daur', en: 'Recycle Magic' },
    explore: { id: 'Belajar 3D', en: '3D Explore' },
  } as Record<GameMode, { id: string; en: string }>,
  helpButton: { id: 'Panduan', en: 'Guide' },
  scoreLabel: { id: 'Skor', en: 'Score' },
  starsLabel: { id: 'Bintang', en: 'Stars' },
  levelLabel: { id: 'Level', en: 'Level' },
  streakLabel: { id: 'Kombo', en: 'Combo' },
  livesLabel: { id: 'Nyawa Eco', en: 'Eco Hearts' },
  zoomIn: { id: 'Perbesar', en: 'Zoom In' },
  zoomOut: { id: 'Perkecil', en: 'Zoom Out' },
  resetView: { id: 'Atur Kamera', en: 'Reset View' },
  hideHud: { id: 'Sembunyikan Panel', en: 'Hide Controls' },
  showHud: { id: 'Tampilkan Panel', en: 'Show Controls' },
  kuroName: { id: 'Kuro si Kucing Hitam', en: 'Kuro the Black Kitten' },
  kuroGreeting: {
    sort: {
      id: 'Meow! Aku Kuro! Seret sampah 3D ke tong warna yang cocok ya, atau klik benda lalu klik tongnya!',
      en: 'Meow! I am Kuro! Drag each 3D item into its matching bin, or tap an item then tap a bin!',
    },
    conveyor: {
      id: 'Meow! Sampahnya meluncur di ban berjalan! Cepat seret ke tong sebelum jatuh ke ujung kanan!',
      en: 'Meow! Trash is riding the conveyor belt! Grab and drop it into the right bin before it reaches the end!',
    },
    magic: {
      id: 'Meow! Ayo tebak benda ini bisa disulap jadi apa setelah didaur ulang! Lihat keajaiban 3D-nya!',
      en: 'Meow! Guess what cool treasure this item turns into when recycled, and watch the 3D magic!',
    },
    explore: {
      id: 'Meow! Putar & perbesar taman 3D ini sesukamu! Klik tong sampah atau benda apa saja untuk belajar!',
      en: 'Meow! Orbit and zoom around the 3D park! Click any bin or waste item to learn how recycling works!',
    },
  } as Record<GameMode, { id: string; en: string }>,
  nextWave: { id: 'Lanjut Level Berikutnya', en: 'Play Next Level' },
  playAgain: { id: 'Main Lagi', en: 'Play Again' },
  nextQuestion: { id: 'Benda Berikutnya', en: 'Next Item' },
  roundCompleteTitle: { id: 'Hore! Kamu Pahlawan Daur Ulang!', en: 'Hooray! Recycling Hero!' },
  conveyorOverTitle: { id: 'Wah, Ban Berjalan Penuh!', en: 'Conveyor Belt Full!' },
  tapHintSelected: {
    id: 'Sekarang klik tong sampah warna yang tepat!',
    en: 'Now click the matching colorful recycling bin!',
  },
  exploreInstruction: {
    id: 'Klik salah satu benda atau tong sampah 3D di taman untuk melihat penjelasannya.',
    en: 'Click any 3D item or recycling bin in the park to inspect and learn about it.',
  },
  achievementsTitle: { id: 'Lencana Prestasi', en: 'Achievements' },
  badgesLabel: { id: 'Lencana', en: 'Badges' },
  dailyMissionsTitle: { id: 'Misi Harian Kuro', en: "Kuro's Daily Missions" },
  missionsLabel: { id: 'Misi', en: 'Missions' },
  ambienceLabel: { id: 'Suara Taman', en: 'Park Audio' },
  wardrobeButton: { id: 'Lemari Kuro', en: 'Closet' },
  wardrobeTitle: { id: 'Lemari Pakaian Kuro', en: "Kuro's Wardrobe" },
  outfitTab: { id: 'Pakaian', en: 'Outfits' },
  hatTab: { id: 'Topi', en: 'Hats' },
  accessoryTab: { id: 'Aksesori', en: 'Accessories' },
  randomizeLabel: { id: 'Acak Gaya', en: 'Randomize' },
  doneLabel: { id: 'Selesai', en: 'Done' },
  shopLabel: { id: 'Toko', en: 'Shop' },
  shopTitle: { id: 'Toko Pasar Kuro', en: "Kuro's Market Shop" },
  shopSnacksTab: { id: 'Camilan', en: 'Snacks' },
  shopFashionTab: { id: 'Pakaian & Aksesori', en: 'Clothes & Gear' },
  patButton: { id: 'Elus', en: 'Pat' },
  feedButton: { id: 'Beri Makan', en: 'Feed' },
  buyLabel: { id: 'Beli', en: 'Buy' },
  wearLabel: { id: 'Pakai', en: 'Wear' },
  wearingLabel: { id: 'Dipakai', en: 'Wearing' },
  feedLabel: { id: 'Beri Makan', en: 'Feed Kuro' },
  ownedLabel: { id: 'Dimiliki', en: 'Owned' },
  affectionLabel: { id: 'Sayang Kuro', en: 'Kuro Love' },
  sceneLabel: { id: 'Suasana', en: 'Scene' },
  sceneTitle: { id: 'Latar & Waktu Taman', en: 'Park Background & Time' },
  timeOfDayLabel: { id: 'Waktu Hari', en: 'Time of Day' },
  backgroundLabel: { id: 'Latar Taman', en: 'Park Background' },
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'eco_starter',
    icon: 'sprout',
    accentHex: '#16A34A',
    title: { id: 'Sahabat Bumi Pemula', en: 'Eco Starter' },
    description: {
      id: 'Berhasil memilah 1 benda sampah dengan tepat.',
      en: 'Successfully sort your very first waste item.',
    },
    target: 1,
    getCurrent: (p) => p.totalSorted,
  },
  {
    id: 'eco_warrior',
    icon: 'shield',
    accentHex: '#0284C7',
    title: { id: 'Eco-Warrior', en: 'Eco-Warrior' },
    description: {
      id: 'Kumpulkan 500 poin dari memilah sampah dan sulap daur ulang.',
      en: 'Reach 500 total points across sorting and recycle magic.',
    },
    target: 500,
    getCurrent: (p) => p.score,
  },
  {
    id: 'recycling_pro',
    icon: 'flame',
    accentHex: '#EA580C',
    title: { id: 'Recycling Pro', en: 'Recycling Pro' },
    description: {
      id: 'Raih kombo 10 kali benar berturut-turut tanpa salah.',
      en: 'Reach a streak of 10 correct sorts in a row.',
    },
    target: 10,
    getCurrent: (p) => p.bestStreak,
  },
  {
    id: 'recycle_wizard',
    icon: 'wand',
    accentHex: '#7C3AED',
    title: { id: 'Pesulap Daur Ulang', en: 'Recycle Wizard' },
    description: {
      id: 'Selesaikan 3 kuis sulap transformasi daur ulang.',
      en: 'Complete 3 Recycle Magic transformations.',
    },
    target: 3,
    getCurrent: (p) => p.magicSolved,
  },
  {
    id: 'kuro_best_friend',
    icon: 'star',
    accentHex: '#EAB308',
    title: { id: 'Sahabat Setia Kuro', en: "Kuro's Best Friend" },
    description: {
      id: 'Kumpulkan 10 bintang bersinar bersama Kuro.',
      en: 'Collect 10 shining stars together with Kuro.',
    },
    target: 10,
    getCurrent: (p) => p.stars,
  },
  {
    id: 'park_hero',
    icon: 'trophy',
    accentHex: '#DC2626',
    title: { id: 'Pahlawan Taman 3D', en: 'EcoPark Hero' },
    description: {
      id: 'Pilah 20 benda sampah dengan benar untuk menjaga taman tetap bersih.',
      en: 'Sort 20 waste items accurately to keep the park spotless.',
    },
    target: 20,
    getCurrent: (p) => p.totalSorted,
  },
];

export const DAILY_MISSION_POOL: DailyMissionDefinition[] = [
  {
    id: 'daily_sort_10',
    accentHex: '#16A34A',
    title: { id: 'Pilah 10 Sampah', en: 'Sort 10 Items' },
    description: {
      id: 'Pilah 10 benda sampah ke tong yang benar hari ini.',
      en: 'Sort 10 waste items into the right bins today.',
    },
    target: 10,
    rewardScore: 150,
    rewardStars: 2,
    getCurrent: (p) => p.sortedTotal,
  },
  {
    id: 'daily_organic_3',
    accentHex: '#22C55E',
    title: { id: 'Sahabat Kompos', en: 'Compost Helper' },
    description: {
      id: 'Masukkan 3 sampah organik ke tong Hijau hari ini.',
      en: 'Place 3 organic items into the Green bin today.',
    },
    target: 3,
    rewardScore: 100,
    rewardStars: 1,
    getCurrent: (p) => p.sortedOrganic,
  },
  {
    id: 'daily_plastic_3',
    accentHex: '#EAB308',
    title: { id: 'Pahlawan Plastik', en: 'Plastic Buster' },
    description: {
      id: 'Masukkan 3 sampah plastik ke tong Kuning hari ini.',
      en: 'Place 3 plastic items into the Yellow bin today.',
    },
    target: 3,
    rewardScore: 100,
    rewardStars: 1,
    getCurrent: (p) => p.sortedPlastic,
  },
  {
    id: 'daily_paper_3',
    accentHex: '#0284C7',
    title: { id: 'Penyelamat Pohon', en: 'Paper Saver' },
    description: {
      id: 'Masukkan 3 sampah kertas ke tong Biru hari ini.',
      en: 'Place 3 paper items into the Blue bin today.',
    },
    target: 3,
    rewardScore: 100,
    rewardStars: 1,
    getCurrent: (p) => p.sortedPaper,
  },
  {
    id: 'daily_magic_2',
    accentHex: '#7C3AED',
    title: { id: 'Sulap Daur Ulang', en: 'Recycle Magic' },
    description: {
      id: 'Selesaikan 2 kuis sulap daur ulang hari ini.',
      en: 'Complete 2 Recycle Magic quizzes today.',
    },
    target: 2,
    rewardScore: 120,
    rewardStars: 2,
    getCurrent: (p) => p.magicSolved,
  },
  {
    id: 'daily_streak_5',
    accentHex: '#EA580C',
    title: { id: 'Kombo 5 Kali', en: '5x Eco Streak' },
    description: {
      id: 'Raih 5 jawaban benar berturut-turut hari ini.',
      en: 'Achieve a 5-answer streak in a row today.',
    },
    target: 5,
    rewardScore: 120,
    rewardStars: 2,
    getCurrent: (p) => p.bestStreak,
  },
];

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodaysMissions(dateKey: string): DailyMissionDefinition[] {
  // Always include 'Sort 10 items' as the signature daily anchor, plus 2 rotating daily goals
  const anchor = DAILY_MISSION_POOL[0];
  const rotating = DAILY_MISSION_POOL.slice(1);
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed = (seed * 31 + dateKey.charCodeAt(i)) % 10000;
  }
  const idxA = seed % rotating.length;
  const idxB = (idxA + 2) % rotating.length;
  return [anchor, rotating[idxA], rotating[idxB]];
}

export const WARDROBE_OUTFITS: WardrobeItemOption<KuroOutfitId>[] = [
  {
    id: 'none',
    costStars: 0,
    swatchHex: '#27272A',
    name: { id: 'Bulu Alami', en: 'Natural Fur' },
    description: { id: 'Tampilan kucing hitam klasik Kuro.', en: "Kuro's classic sleek black fur." },
  },
  {
    id: 'eco_vest',
    costStars: 2,
    swatchHex: '#16A34A',
    name: { id: 'Rompi Eco', en: 'Eco Vest' },
    description: { id: 'Rompi hijau penjaga kebersihan taman.', en: 'Green ranger vest for park patrols.' },
  },
  {
    id: 'hoodie',
    costStars: 3,
    swatchHex: '#0284C7',
    name: { id: 'Hoodie Biru', en: 'Sky Hoodie' },
    description: { id: 'Jaket hangat biru langit yang nyaman.', en: 'Cozy sky-blue sweater hoodie.' },
  },
  {
    id: 'overalls',
    costStars: 3,
    swatchHex: '#EAB308',
    name: { id: 'Baju Kodok', en: 'Sunny Overalls' },
    description: { id: 'Baju kodok kuning ceria berkantong.', en: 'Cheerful yellow overalls with pocket.' },
  },
  {
    id: 'cape',
    costStars: 5,
    swatchHex: '#DC2626',
    name: { id: 'Jubah Pahlawan', en: 'Hero Cape' },
    description: { id: 'Jubah merah pahlawan daur ulang!', en: 'Red cape for recycling superheroes!' },
  },
];

export const WARDROBE_HATS: WardrobeItemOption<KuroHatId>[] = [
  {
    id: 'none',
    costStars: 0,
    swatchHex: '#CBD5E1',
    name: { id: 'Tanpa Topi', en: 'No Hat' },
    description: { id: 'Biarkan telinga runcing Kuro terlihat.', en: "Show off Kuro's cute pointed ears." },
  },
  {
    id: 'leaf_beret',
    costStars: 2,
    swatchHex: '#22C55E',
    name: { id: 'Baret Daun', en: 'Leaf Beret' },
    description: { id: 'Topi baret hijau dengan tunas daun.', en: 'Artist beret with a tiny green sprout.' },
  },
  {
    id: 'cap',
    costStars: 3,
    swatchHex: '#F97316',
    name: { id: 'Topi Olahraga', en: 'Sporty Cap' },
    description: { id: 'Topi oranye keren siap beraksi.', en: 'Cool orange cap ready for action.' },
  },
  {
    id: 'sun_hat',
    costStars: 4,
    swatchHex: '#F59E0B',
    name: { id: 'Topi Taman', en: 'Garden Hat' },
    description: { id: 'Topi jerami lebar peneduh matahari.', en: 'Wide straw hat for sunny park days.' },
  },
  {
    id: 'crown',
    costStars: 6,
    swatchHex: '#FACC15',
    name: { id: 'Mahkota Eco', en: 'Eco Crown' },
    description: { id: 'Mahkota emas juara daur ulang.', en: 'Golden crown for recycling champions.' },
  },
];

export const WARDROBE_ACCESSORIES: WardrobeItemOption<KuroAccessoryId>[] = [
  {
    id: 'collar_bell',
    costStars: 0,
    swatchHex: '#10B981',
    name: { id: 'Kalung Lonceng', en: 'Bell Collar' },
    description: { id: 'Kalung hijau khas Kuro berlonceng emas.', en: 'Signature green collar with gold bell.' },
  },
  {
    id: 'bowtie',
    costStars: 2,
    swatchHex: '#F43F5E',
    name: { id: 'Dasi Kupu-kupu', en: 'Party Bowtie' },
    description: { id: 'Dasi kupu-kupu merah yang rapi.', en: 'Dapper coral-red bowtie.' },
  },
  {
    id: 'scarf',
    costStars: 3,
    swatchHex: '#FB923C',
    name: { id: 'Syal Hangat', en: 'Cozy Scarf' },
    description: { id: 'Syal lembut berstrip oranye ceria.', en: 'Soft striped scarf for breezy days.' },
  },
  {
    id: 'glasses',
    costStars: 4,
    swatchHex: '#38BDF8',
    name: { id: 'Kacamata Pintar', en: 'Smart Glasses' },
    description: { id: 'Kacamata bulat agar tampak makin pintar!', en: 'Round glasses for extra clever looks!' },
  },
];

export const TREAT_ITEMS: TreatItemDefinition[] = [
  {
    id: 'fish_biscuit',
    costStars: 2,
    bonusScore: 40,
    accentHex: '#F59E0B',
    name: { id: 'Biskuit Ikan Renyah', en: 'Crunchy Fish Biscuit' },
    description: {
      id: 'Camilan renyah berbentuk ikan kesukaan Kuro. (+40 Skor saat dimakan)',
      en: "Kuro's favorite fish-shaped crunchy snack. (+40 Score when fed)",
    },
  },
  {
    id: 'salmon_sushi',
    costStars: 4,
    bonusScore: 80,
    accentHex: '#FB7185',
    name: { id: 'Sushi Salmon Mini', en: 'Mini Salmon Sushi' },
    description: {
      id: 'Potongan salmon segar yang bikin Kuro mendengkur senang! (+80 Skor)',
      en: 'Fresh salmon bite that makes Kuro purr with joy! (+80 Score)',
    },
  },
  {
    id: 'catnip_milk',
    costStars: 6,
    bonusScore: 120,
    accentHex: '#38BDF8',
    name: { id: 'Susu Hangat Catnip', en: 'Warm Catnip Milk' },
    description: {
      id: 'Semangkuk susu hangat lezat untuk kucing penjaga taman. (+120 Skor)',
      en: 'Cozy bowl of warm milk for the park-guardian kitten. (+120 Score)',
    },
  },
  {
    id: 'golden_tuna',
    costStars: 8,
    bonusScore: 200,
    accentHex: '#FACC15',
    name: { id: 'Tuna Emas Spesial', en: 'Golden Tuna Feast' },
    description: {
      id: 'Hidangan ikan tuna istimewa dengan taburan hati bersinar! (+200 Skor)',
      en: 'Deluxe golden tuna platter with sparkling heart confetti! (+200 Score)',
    },
  },
];

export const TIME_OF_DAY_OPTIONS: SceneOption<TimeOfDayId>[] = [
  {
    id: 'morning',
    swatchHex: '#BFE8FF',
    secondaryHex: '#FEF08A',
    name: { id: 'Pagi Cerah', en: 'Bright Morning' },
  },
  {
    id: 'afternoon',
    swatchHex: '#7DD3FC',
    secondaryHex: '#FDE047',
    name: { id: 'Siang Terang', en: 'Sunny Noon' },
  },
  {
    id: 'sunset',
    swatchHex: '#FB923C',
    secondaryHex: '#FDE68A',
    name: { id: 'Sore Senja', en: 'Golden Sunset' },
  },
  {
    id: 'night',
    swatchHex: '#0F172A',
    secondaryHex: '#38BDF8',
    name: { id: 'Malam Bintang', en: 'Starry Night' },
  },
];

export const PARK_BACKGROUND_OPTIONS: SceneOption<ParkBackgroundId>[] = [
  {
    id: 'meadow',
    swatchHex: '#22C55E',
    secondaryHex: '#86EFAC',
    name: { id: 'Taman Hijau', en: 'Eco Meadow' },
  },
  {
    id: 'beach',
    swatchHex: '#FACC15',
    secondaryHex: '#06B6D4',
    name: { id: 'Pantai Ceria', en: 'Sunny Beach' },
  },
  {
    id: 'autumn',
    swatchHex: '#EA580C',
    secondaryHex: '#F59E0B',
    name: { id: 'Hutan Musim Gugur', en: 'Autumn Woods' },
  },
  {
    id: 'cherry',
    swatchHex: '#F472B6',
    secondaryHex: '#FBCFE8',
    name: { id: 'Taman Sakura', en: 'Sakura Park' },
  },
];

export function getText(text: { id: string; en: string }, lang: Language): string {
  return text[lang];
}
