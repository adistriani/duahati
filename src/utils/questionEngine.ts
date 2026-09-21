import { Language } from '../context/LanguageContext';
import { BaseQuestion, ThisOrThatItem, GetToKnowItem, HowWellItem, ChaosItem, QuestionCategory } from '../types';

// ============================================================================
// PERSISTENT DEDUPLICATION & SEEN QUESTION TRACKER
// ============================================================================

const SEEN_STORAGE_KEY = 'aboutus_seen_questions_v2';
const MAX_SEEN_PER_DECK = 1500;

interface SeenRegistry {
  [deckId: string]: {
    ids: string[];
    signatures: string[];
  };
}

function getStoredRegistry(): SeenRegistry {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredRegistry(reg: SeenRegistry): void {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(reg));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Normalizes text to extract its semantic fingerprint.
 * Strips punctuation, common filler phrases, extra spaces, and lowercase.
 */
export function normalizeSemanticSignature(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”‘’]/g, '')
    // Indonesian filler words
    .replace(/\b(menurut kamu|menurutmu|menurut anda|apa yang|apakah|bagaimana|kapan|mengapa|kenapa|kalau|jika|bila|tentang|dalam|kita|aku|kamu|yang|dan|atau|ini|itu|ada|nggak|bisa|paling)\b/gi, '')
    // English filler words
    .replace(/\b(what is|what are|what do you|how do you|when did|if you could|would you rather|do you think|tell me|about|between|with|your|the|and|or|for|is|are|in|on|to|a|an)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates similarity coefficient (Jaccard on word tokens)
 */
export function calculateSemanticSimilarity(textA: string, textB: string): number {
  const sigA = normalizeSemanticSignature(textA);
  const sigB = normalizeSemanticSignature(textB);
  if (!sigA || !sigB) return 0;
  if (sigA === sigB) return 1.0;

  const setA = new Set(sigA.split(' ').filter(Boolean));
  const setB = new Set(sigB.split(' ').filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach((word) => {
    if (setB.has(word)) intersection++;
  });

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Checks if a question ID or semantic signature has already been seen in a deck.
 */
export function isQuestionSeen(deckId: string, questionId: string, questionText?: string): boolean {
  const reg = getStoredRegistry();
  const deckData = reg[deckId];
  if (!deckData) return false;

  if (deckData.ids.includes(questionId)) return true;

  if (questionText) {
    const signature = normalizeSemanticSignature(questionText);
    if (!signature) return false;
    if (deckData.signatures.includes(signature)) return true;

    // Check similarity threshold > 0.78
    for (const pastSig of deckData.signatures) {
      if (calculateSemanticSimilarity(pastSig, signature) >= 0.78) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Marks a question as seen for a specific deck.
 */
export function markQuestionSeen(deckId: string, questionId: string, questionText?: string): void {
  const reg = getStoredRegistry();
  if (!reg[deckId]) {
    reg[deckId] = { ids: [], signatures: [] };
  }

  const deckData = reg[deckId];
  if (!deckData.ids.includes(questionId)) {
    deckData.ids.push(questionId);
  }

  if (questionText) {
    const signature = normalizeSemanticSignature(questionText);
    if (signature && !deckData.signatures.includes(signature)) {
      deckData.signatures.push(signature);
    }
  }

  // Trim to avoid memory bloat
  if (deckData.ids.length > MAX_SEEN_PER_DECK) {
    deckData.ids = deckData.ids.slice(-MAX_SEEN_PER_DECK);
  }
  if (deckData.signatures.length > MAX_SEEN_PER_DECK) {
    deckData.signatures = deckData.signatures.slice(-MAX_SEEN_PER_DECK);
  }

  saveStoredRegistry(reg);
}

/**
 * Clears seen history for a deck or all decks
 */
export function clearSeenHistory(deckId?: string): void {
  if (deckId) {
    const reg = getStoredRegistry();
    delete reg[deckId];
    saveStoredRegistry(reg);
  } else {
    localStorage.removeItem(SEEN_STORAGE_KEY);
  }
}

// ============================================================================
// MASSIVE COMBINATORIAL PROCEDURAL ENGINE (ENDLESS NON-REPEATING STREAMS)
// ============================================================================

// Helper random choice from array
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------------------------------------------------
// 1. DEEP TALK & VULNERABILITY GENERATOR
// -------------------------------------------------------------
const DEEP_TALK_TOPIC_ANGLES = [
  {
    theme: 'Emotional Anchor',
    diff: { id: '🌙 Mendalam', en: '🌙 Deep & vulnerable' },
    id: [
      'Ketika kamu merasa lelah menghadapi ekspektasi orang lain, cara apa dari aku yang paling membuatmu merasa aman untuk berhenti berpura-pura kuat?',
      'Pernahkah ada hari di mana kamu merasa sangat sendirian di tengah keramaian, dan apa yang bisa aku lakukan saat hari seperti itu datang lagi?',
      'Bagian dari masa lalumu mana yang dulunya paling sulit kamu ceritakan, tapi kini terasa lebih tenang karena aku menerimanya?',
      'Saat kamu merasa tidak percaya diri dengan dirimu sendiri, kata-kata atau perlakuan seperti apa yang paling kamu butuhkan dari aku?',
      'Apakah ada ketakutan tersembunyi tentang masa depan yang jarang kamu ucapkan dengan suara keras karena takut terdengar cengeng?',
      'Dalam situasi apa kamu merasa paling sulit mengutarakan kekecewaan, dan bagaimana aku bisa membantumu merasa lebih nyaman untuk terbuka?'
    ],
    en: [
      'When you feel exhausted by other people’s expectations, how can I best make you feel safe enough to drop your armor?',
      'Have you ever felt completely alone in a crowded room, and what can I do when a day like that happens again?',
      'Which part of your past was once hardest to share, but now feels lighter because I embraced it?',
      'When your self-confidence dips, what words or quiet gestures from me ground you best?',
      'Is there a hidden fear about our future you rarely voice because you worry about sounding fragile?',
      'In what moments is it hardest for you to speak up about disappointment, and how can I create safer space for you?'
    ],
    subtext: {
      id: 'Ceritakan dengan jujur tanpa takut dihakimi.',
      en: 'Share openly without fear of judgment.'
    }
  },
  {
    theme: 'Childhood & Growing Up',
    diff: { id: '💭 Personal', en: '💭 Personal & open' },
    id: [
      'Kebiasaan atau nilai dari rumah masa kecilmu apa yang sangat ingin kamu bawa ke rumah masa depan kita, dan mana yang ingin kamu hindari?',
      'Bagaimana cara orang tuamu dulu menyelesaikan pertengkaran, dan seberapa besar hal itu memengaruhi caramu menghadapi perbedaan pendapat denganku sekarang?',
      'Momen masa kecil apa yang paling membentuk caramu memandang arti kasih sayang dan perhatian?',
      'Pernahkah kamu merasa kurang didengarkan saat kecil, dan bagaimana hal itu membentuk kebutuhanmu saat kita mengobrol hari ini?',
      'Jika kamu bisa memeluk dirimu saat berusia 12 tahun, apa hal menenangkan tentang hubungan kita yang ingin kamu bisikkan padanya?'
    ],
    en: [
      'What family habit or tradition from your childhood home do you want to keep for our future, and which do you want to leave behind?',
      'How did your parents navigate disagreements, and how does that shape the way you handle friction with me today?',
      'What childhood memory most strongly shaped your definition of love and genuine care?',
      'Did you ever feel unheard as a child, and how does that affect your communication needs with me now?',
      'If you could hug your 12-year-old self, what reassuring truth about our love would you whisper to them?'
    ],
    subtext: {
      id: 'Mengenal akar masa lalu untuk saling menyayangi lebih utuh.',
      en: 'Understanding our roots to love each other more completely.'
    }
  },
  {
    theme: 'Philosophy, Meaning & Quiet Life',
    diff: { id: '✨ Masa depan', en: '✨ Big conversation' },
    id: [
      'Bila kita harus merangkum arti "kehidupan yang damai dan bermakna" dalam 3 hal sederhana, hal apa saja yang paling berharga bagi kita?',
      'Bagaimana caramu menjaga agar ambisi pribadi tidak pernah mengorbankan keintiman dan kehangatan hubungan kita?',
      'Jika kita diuji dengan masa sulit di mana hidup terasa sangat sempit, komitmen apa yang ingin kita sepakati untuk saling menjaga?',
      'Apakah menurutmu kebahagiaan sejati lebih banyak datang dari pencapaian besar bersama atau rutinitas kecil setiap pagi?'
    ],
    en: [
      'If we had to define a peaceful, meaningful life in three simple pillars, what would matter most to us?',
      'How do you protect our quiet emotional intimacy from being consumed by career ambitions or daily stress?',
      'If life ever tests us with difficult seasons, what fundamental promise do you want us to hold onto?',
      'Do you believe deep lasting joy comes more from grand shared milestones or from quiet morning rituals?'
    ],
    subtext: {
      id: 'Menyelaraskan kompas hidup dan makna keberadaan berdua.',
      en: 'Aligning our inner compass and shared values.'
    }
  },
  {
    theme: 'Mutual Gratitude & Unspoken Feelings',
    diff: { id: '🌱 Santai', en: '🌱 Warm & reflective' },
    id: [
      'Hal sederhana apa dari caraku memperlakukanmu yang paling membuatmu merasa diistimewakan setiap harinya?',
      'Kapan momen terakhir di mana kamu menatapku dan diam-diam merasa sangat beruntung kita bisa saling menemukan?',
      'Sifat atau kebiasaan apa dari diriku yang paling sering membantumu menjadi versi diri yang lebih tenang dan sabar?'
    ],
    en: [
      'What simple everyday gesture from me makes you feel truly cherished?',
      'When was the last time you looked at me and secretly felt profound gratitude that we found each other?',
      'What personality trait of mine most helps you become a more peaceful, grounded person?'
    ],
    subtext: {
      id: 'Apresiasi tulus yang sering kali terlewat dalam kesibukan.',
      en: 'Honest appreciation often left unsaid during busy days.'
    }
  }
];

export function generateUnlimitedDeepTalk(seenIds: Set<string>, lang: Language = 'id', p1 = 'Kamu', p2 = 'Pasangan'): BaseQuestion {
  const angle = pickRandom(DEEP_TALK_TOPIC_ANGLES);
  const qList = angle[lang] || angle.id;

  // Find a question not yet seen
  for (let i = 0; i < qList.length; i++) {
    const text = qList[i];
    const candidateId = `dt-gen-${normalizeSemanticSignature(text).slice(0, 16)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('deep-talk', candidateId, text)) {
      return {
        id: candidateId,
        category: 'Deep Talk',
        difficulty: angle.diff[lang] || angle.diff.id,
        text,
        subtext: angle.subtext[lang] || angle.subtext.id
      };
    }
  }

  // Dynamic combinatorial generator if pool exhausted
  const subjectsId = [
    'keberanian untuk jujur tentang rasa takut terbesar kita',
    'cara kita menyikapi masa-masa sulit saat energi kita sama-sama habis',
    'arti penerimaan tanpa syarat saat salah satu dari kita sedang gagal',
    'impian masa tua yang ingin kita bangun dengan tenang tanpa terburu-buru',
    'perasaan terdalam saat kita saling memaafkan setelah berselisih paham',
    'kebiasaan manis yang ingin kita pertahankan hingga puluhan tahun mendatang',
    'rahasia kecil tentang caramu memandang arti kenyamanan bersamaku'
  ];
  const subjectsEn = [
    'the courage to be vulnerable about our deepest uncertainties',
    'how we care for each other when both of our emotional batteries are drained',
    'the meaning of unconditional acceptance when one of us falls short',
    'the quiet lifelong dreams we want to build without rushing',
    'the tenderness we feel when forgiving each other after a disagreement',
    'the sweet daily rituals we want to fiercely protect decades from now',
    'the subtle ways you define emotional safety and comfort with me'
  ];

  const idx = Math.floor(Math.random() * subjectsId.length);
  const textId = `Menurutmu, bagaimana ${subjectsId[idx]} bisa semakin memperkuat ikatan batin antara ${p1} & ${p2}?`;
  const textEn = `In your eyes, how does exploring ${subjectsEn[idx]} deepen the quiet bond between ${p1} & ${p2}?`;
  const text = lang === 'id' ? textId : textEn;
  const genId = `dt-comb-${Date.now()}-${idx}`;

  return {
    id: genId,
    category: 'Deep Talk',
    difficulty: lang === 'id' ? '🌙 Mendalam' : '🌙 Deep & vulnerable',
    text,
    subtext: lang === 'id' ? 'Luangkan waktu untuk menjawab dari lubuk hati terdalam.' : 'Take your time to answer from the heart.'
  };
}

// -------------------------------------------------------------
// 2. THIS OR THAT COMBINATORIAL GENERATOR
// -------------------------------------------------------------
const THIS_OR_THAT_CATEGORIES: {
  category: QuestionCategory;
  items: Array<{
    optA: { id: string; en: string; icon: string };
    optB: { id: string; en: string; icon: string };
    followUp: { id: string; en: string };
  }>;
}[] = [
  {
    category: 'Light',
    items: [
      {
        optA: { id: 'Sarapan pagi tenang dengan roti & kopi seduh', en: 'Quiet morning coffee & warm pastries', icon: '☕' },
        optB: { id: 'Makan malam larut dengan mie instan & obrolan random', en: 'Late night ramen & hilarious banter', icon: '🍜' },
        followUp: { id: 'Kapan obrolan makan malam paling seru yang pernah kita lewati?', en: 'When was our most memorable late-night conversation?' }
      },
      {
        optA: { id: 'Piknik santai di taman beralaskan karpet & buku', en: 'Sunny park picnic with blankets and books', icon: '🧺' },
        optB: { id: 'Keliling toko buku tua & kafe tersembunyi', en: 'Old bookstore hunting & secret café nooks', icon: '📚' },
        followUp: { id: 'Buku atau topik apa yang paling menggambarkan dinamika kita?', en: 'What book or topic best captures our bond?' }
      },
      {
        optA: { id: 'Menonton film bioskop hari pertama rilis', en: 'First-day cinema premiere in dark cozy seats', icon: '🎬' },
        optB: { id: 'Marathon serial favorit di kasur berselimut tebal', en: 'Binging our favorite series under heavy blankets', icon: '🍿' },
        followUp: { id: 'Camilan wajib apa yang harus selalu siap saat kita nonton berdua?', en: 'What must-have snack belongs at our movie marathons?' }
      },
      {
        optA: { id: 'Perjalanan kereta api jarak jauh melintasi pemandangan alam', en: 'Scenic long-distance train ride with window seats', icon: '🚂' },
        optB: { id: 'Road trip santai naik mobil sambil bebas berhenti di mana saja', en: 'Flexible road trip stopping anywhere whenever we want', icon: '🚗' },
        followUp: { id: 'Siapa yang biasanya pegang kontrol playlist musik di perjalanan?', en: 'Who usually claims DJ rights for road trip playlists?' }
      }
    ]
  },
  {
    category: 'Values',
    items: [
      {
        optA: { id: 'Tinggal dekat dengan keluarga besar dan sahabat', en: 'Living close to family roots and lifelong friends', icon: '🏡' },
        optB: { id: 'Membangun kehidupan mandiri di kota atau negara baru', en: 'Building an independent life in a completely new city', icon: '🗺️' },
        followUp: { id: 'Hal apa yang paling bikin kamu kangen saat jauh dari kampung halaman?', en: 'What do you miss most when away from home?' }
      },
      {
        optA: { id: 'Pekerjaan stabil dengan jam kerja teratur & banyak waktu luang', en: 'Predictable stable job with abundant free evenings', icon: '⏳' },
        optB: { id: 'Karier penuh tantangan dengan potensi pencapaian besar', en: 'High-growth ambitious career with massive creative impact', icon: '🚀' },
        followUp: { id: 'Bagaimana kita memastikan waktu berkualitas berdua tetap terlindungi?', en: 'How will we fiercely protect our couple time?' }
      },
      {
        optA: { id: 'Kejujuran mutlak meskipun terkadang terdengar pahit', en: 'Radical blunt honesty even when it stings', icon: '⚖️' },
        optB: { id: 'Penyampaian lemah lembut dengan menjaga perasaan pasangan', en: 'Gentle tactful words prioritizing emotional tenderness', icon: '🕊️' },
        followUp: { id: 'Kapan saat terbaik buat menyampaikan kritik membangun ke kamu?', en: 'When is the best time to share constructive feedback with you?' }
      }
    ]
  },
  {
    category: 'Flirty',
    items: [
      {
        optA: { id: 'Bisikan manis di telinga pas lagi di tempat ramai', en: 'Sweet whispers in the ear in a crowded room', icon: '🤫' },
        optB: { id: 'Tatapan mata penuh arti dari seberang ruangan', en: 'Intense lingering eye contact across the room', icon: '👀' },
        followUp: { id: 'Kode rahasia apa yang paling cepat bikin kamu salah tingkah?', en: 'What secret non-verbal signal makes your heart race most?' }
      },
      {
        optA: { id: 'Ciuman kening hangat sebelum berangkat beraktivitas', en: 'Gentle forehead kiss before leaving for the day', icon: '💋' },
        optB: { id: 'Pelukan erat dari belakang saat sedang sibuk di dapur', en: 'Tight hug from behind while making coffee in the kitchen', icon: '🫂' },
        followUp: { id: 'Sentuhan kasih sayang seperti apa yang paling menenangkan harimu?', en: 'Which touch instantly melts away your daily fatigue?' }
      }
    ]
  }
];

export function generateUnlimitedThisOrThat(seenIds: Set<string>, lang: Language = 'id'): ThisOrThatItem {
  const catObj = pickRandom(THIS_OR_THAT_CATEGORIES);
  const items = catObj.items;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const candidateId = `tot-gen-${normalizeSemanticSignature(item.optA.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('this-or-that', candidateId, item.optA.id)) {
      return {
        id: candidateId,
        category: catObj.category,
        optionA: {
          label: item.optA[lang] || item.optA.id,
          icon: item.optA.icon
        },
        optionB: {
          label: item.optB[lang] || item.optB.id,
          icon: item.optB.icon
        },
        followUp: item.followUp[lang] || item.followUp.id
      };
    }
  }

  // Dynamic Generator
  const pairsId = [
    {
      a: 'Masak resep baru bareng di dapur meski berantakan',
      b: 'Pesan makanan lezat favorit via delivery sambil leyeh-leyeh',
      ia: '🍳', ib: '🛵',
      f: 'Makanan apa yang paling ingin kita coba masak bareng akhir pekan ini?'
    },
    {
      a: 'Menghabiskan tabungan untuk renovasi sudut santai rumah idaman',
      b: 'Menghabiskan tabungan untuk tiket pesawat liburan impian berdua',
      ia: '🛋️', ib: '✈️',
      f: 'Destinasi atau sudut rumah mana yang paling kamu prioritaskan?'
    },
    {
      a: 'Berbagi semua password dan akun tanpa rahasia sama sekali',
      b: 'Saling menjaga ruang privasi pribadi dengan kepercayaan penuh',
      ia: '🔐', ib: '🌿',
      f: 'Bagaimana caramu mendefinisikan batas privasi yang sehat?'
    }
  ];
  const pairsEn = [
    {
      a: 'Cooking a chaotic new recipe together in the kitchen',
      b: 'Ordering gourmet comfort food delivery and lounging',
      ia: '🍳', ib: '🛵',
      f: 'What delicious meal should we make together this weekend?'
    },
    {
      a: 'Investing savings into our cozy future home renovation',
      b: 'Investing savings into round-the-world travel tickets',
      ia: '🛋️', ib: '✈️',
      f: 'Which dream trip or home upgrade would you choose first?'
    },
    {
      a: 'Sharing all passwords and open devices with zero secrets',
      b: 'Keeping personal privacy sacred with complete mutual trust',
      ia: '🔐', ib: '🌿',
      f: 'What does healthy privacy look like in your ideal relationship?'
    }
  ];

  const pIdx = Math.floor(Math.random() * pairsId.length);
  const p = lang === 'id' ? pairsId[pIdx] : pairsEn[pIdx];
  const genId = `tot-dyn-${Date.now()}-${pIdx}`;

  return {
    id: genId,
    category: 'Light',
    optionA: { label: p.a, icon: p.ia },
    optionB: { label: p.b, icon: p.ib },
    followUp: p.f
  };
}

// -------------------------------------------------------------
// 3. WISHES & HOPES (MASA DEPAN BERDUA) GENERATOR
// -------------------------------------------------------------
const WISHES_TEMPLATES = [
  {
    prompt: {
      id: 'Ritual pagi sederhana seperti apa yang ingin kita jadikan kebiasaan tetap saat kita tinggal serumah nanti?',
      en: 'What sweet morning ritual do you want us to practice daily once we live together full-time?'
    },
    subtext: {
      id: 'Menyeruput kopi bersama di balkon, jalan santai 15 menit, atau saling mendoakan sebelum beraktivitas.',
      en: 'Coffee on the balcony, 15-minute morning walks, or a warm forehead kiss before work.'
    }
  },
  {
    prompt: {
      id: 'Jika kita bisa merancang satu tradisi tahunan khusus berdua, tradisi apa yang ingin kita buat?',
      en: 'If we could create one unique annual tradition just for the two of us, what would it be?'
    },
    subtext: {
      id: 'Kemping di bawah bintang tiap tanggal jadian, menulis surat refleksi tahunan, atau berburu kuliner kota baru.',
      en: 'Anniversary stargazing trips, writing yearly reflection letters, or exploring a new hidden town.'
    }
  },
  {
    prompt: {
      id: 'Bila kita memiliki rumah impian dengan halaman belakang luas, hal apa yang paling ingin kita letakkan di sana?',
      en: 'If our future dream home has a spacious backyard, what would you most love to put there?'
    },
    subtext: {
      id: 'Ayunan kayu santai, meja makan outdoor dengan lampu gantung, kebun tanaman herbal, atau area hewan peliharaan.',
      en: 'A wooden porch swing, outdoor dining table under fairy lights, an herb garden, or a playful pet corner.'
    }
  },
  {
    prompt: {
      id: 'Hal baru apa yang selama ini belum pernah kita coba sama sekali, tapi sangat ingin kamu pelajari berdua denganku?',
      en: 'What is something neither of us has ever done, but you would love for us to learn and try together?'
    },
    subtext: {
      id: 'Kelas membuat tembikar, belajar bahasa asing bersama, diving, atau kursus memasak pastry.',
      en: 'Pottery classes, learning a new language together, scuba diving, or baking artisan sourdough.'
    }
  },
  {
    prompt: {
      id: 'Bagaimana caramu membayangkan masa tua kita saat kita sudah berusia 70 tahun dan duduk berdua di teras sore hari?',
      en: 'How do you picture our life when we are 70 years old, sitting quietly on the porch on a Sunday afternoon?'
    },
    subtext: {
      id: 'Menertawakan kenangan konyol masa muda kita dan bersyukur atas semua badai yang telah berhasil kita lewati.',
      en: 'Laughing at memories of our younger days and feeling peaceful that we weathered every storm.'
    }
  }
];

export function generateUnlimitedWishes(seenIds: Set<string>, lang: Language = 'id', p1 = 'Kita', p2 = 'Pasangan') {
  for (let i = 0; i < WISHES_TEMPLATES.length; i++) {
    const item = WISHES_TEMPLATES[i];
    const candidateId = `wish-tmpl-${normalizeSemanticSignature(item.prompt.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('wishes', candidateId, item.prompt.id)) {
      return {
        id: candidateId,
        prompt: item.prompt[lang] || item.prompt.id,
        subtext: item.subtext[lang] || item.subtext.id
      };
    }
  }

  const dynamicWishesPoolId = [
    'Destinasi tersembunyi di pelosok dunia mana yang ingin kita datangi berdua tanpa paket tur komersial?',
    'Bagaimana caramu membayangkan cara kita merayakan pencapaian besar dalam karier masing-masing di masa depan?',
    'Sudut ternyaman seperti apa yang wajib kita ciptakan di kamar tidur utama rumah masa depan kita?',
    'Komitmen apa yang ingin kita jaga bersama agar hubungan kita tetap terasa segar dan romantis meski sudah bertahun-tahun berlalu?'
  ];
  const dynamicWishesPoolEn = [
    'What hidden, off-the-beaten-path destination in the world would you love for us to explore without tour guides?',
    'How do you envision us celebrating each other’s major personal and career triumphs in the coming years?',
    'What cozy, soothing sanctuary do you want to create in our future master bedroom?',
    'What mutual promise will help our relationship stay delightfully romantic even after decades of companionship?'
  ];

  const idx = Math.floor(Math.random() * dynamicWishesPoolId.length);
  const prompt = lang === 'id' ? dynamicWishesPoolId[idx] : dynamicWishesPoolEn[idx];
  const genId = `wish-dyn-${Date.now()}-${idx}`;

  return {
    id: genId,
    prompt,
    subtext: lang === 'id' ? `Wujudkan impian indah bersama ${p1} & ${p2}.` : `Cultivating shared hopes for ${p1} & ${p2}.`
  };
}

// -------------------------------------------------------------
// 4. GET TO KNOW ME (KENALI DIRIKU) GENERATOR
// -------------------------------------------------------------
const GET_TO_KNOW_TEMPLATES: Array<{
  cat: QuestionCategory;
  statementA: { id: string; en: string };
  statementB: { id: string; en: string };
}> = [
  {
    cat: 'Light',
    statementA: {
      id: 'Saat menonton film, aku suka menebak alur dan berkomentar sepanjang adegan.',
      en: 'During movies, I love predicting the plot and whispering running commentary.'
    },
    statementB: {
      id: 'Saat menonton film, aku butuh keheningan total untuk fokus menikmati cerita.',
      en: 'During movies, I need total uninterrupted silence to immerse myself.'
    }
  },
  {
    cat: 'Communication',
    statementA: {
      id: 'Ketika menghadapi keputusan rumit, aku lebih percaya intuisi dan kata hati.',
      en: 'When facing complex dilemmas, I trust my gut instincts and emotional compass.'
    },
    statementB: {
      id: 'Ketika menghadapi keputusan rumit, aku butuh data logis dan daftar pro-kontra.',
      en: 'When facing complex dilemmas, I rely on rigorous logic and pros-cons lists.'
    }
  },
  {
    cat: 'Love',
    statementA: {
      id: 'Aku merasa paling terhibur saat pasanganku membuat lelucon konyol untuk mencairkan suasana.',
      en: 'I feel most cheered up when my partner uses playful banter to lighten the room.'
    },
    statementB: {
      id: 'Aku merasa paling terhibur saat pasanganku hanya duduk tenang menemaniku tanpa banyak bicara.',
      en: 'I feel most cheered up when my partner simply sits quietly beside me in presence.'
    }
  },
  {
    cat: 'Values',
    statementA: {
      id: 'Aku lebih memilih mengoleksi barang-barang estetis dan bermakna untuk menghias rumah.',
      en: 'I prefer curating meaningful, beautiful objects to furnish our personal space.'
    },
    statementB: {
      id: 'Aku lebih memilih gaya hidup minimalis dengan sesedikit mungkin barang yang menumpuk.',
      en: 'I thrive on minimalist clutter-free spaces with strictly functional essentials.'
    }
  }
];

export function generateUnlimitedGetToKnow(seenIds: Set<string>, lang: Language = 'id'): GetToKnowItem {
  for (let i = 0; i < GET_TO_KNOW_TEMPLATES.length; i++) {
    const item = GET_TO_KNOW_TEMPLATES[i];
    const candidateId = `gtk-tmpl-${normalizeSemanticSignature(item.statementA.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('get-to-know', candidateId, item.statementA.id)) {
      return {
        id: candidateId,
        category: item.cat,
        statementA: item.statementA[lang] || item.statementA.id,
        statementB: item.statementB[lang] || item.statementB.id
      };
    }
  }

  // Dynamic Generator
  const dynId = [
    {
      cat: 'Light' as QuestionCategory,
      a: 'Kalau lagi stres berat, aku butuh jalan kaki sendirian di luar rumah menghirup udara segar.',
      b: 'Kalau lagi stres berat, aku butuh berbaring di kasur memutar playlist musik favoritku.'
    },
    {
      cat: 'Communication' as QuestionCategory,
      a: 'Aku lebih nyaman menyelesaikan masalah secara langsung lewat tatap muka.',
      b: 'Aku lebih nyaman menuliskan isi kepalaku lewat pesan teks panjang agar tidak salah bicara.'
    },
    {
      cat: 'Love' as QuestionCategory,
      a: 'Bentuk perhatian yang paling bikin aku meleleh adalah dipuji di depan orang lain.',
      b: 'Bentuk perhatian yang paling bikin aku meleleh adalah ucapan terima kasih tulus saat hanya berdua.'
    }
  ];
  const dynEn = [
    {
      cat: 'Light' as QuestionCategory,
      a: 'When highly stressed, I need an outdoor walk alone to breathe fresh air.',
      b: 'When highly stressed, I need to collapse into bed with my favorite comfort soundtrack.'
    },
    {
      cat: 'Communication' as QuestionCategory,
      a: 'I prefer resolving misunderstandings immediately through face-to-face eye contact.',
      b: 'I prefer drafting my thoughts in a structured message first to avoid saying the wrong thing.'
    },
    {
      cat: 'Love' as QuestionCategory,
      a: 'The compliment that melts me most is being praised proudly in front of others.',
      b: 'The compliment that melts me most is a private, tender whisper of gratitude just between us.'
    }
  ];

  const idx = Math.floor(Math.random() * dynId.length);
  const picked = lang === 'id' ? dynId[idx] : dynEn[idx];
  const genId = `gtk-dyn-${Date.now()}-${idx}`;

  return {
    id: genId,
    category: picked.cat,
    statementA: picked.a,
    statementB: picked.b
  };
}

// -------------------------------------------------------------
// 5. SEBERAPA PAHAM? (HOW WELL DO YOU KNOW ME) GENERATOR
// -------------------------------------------------------------
const HOW_WELL_TEMPLATES: Array<{
  cat: QuestionCategory;
  q: { id: string; en: string };
  opts: { id: string[]; en: string[] };
}> = [
  {
    cat: 'Light',
    q: {
      id: 'Apa yang paling sering dicari pasanganmu saat sedang bad mood atau kehabisan energi?',
      en: 'What does your partner reach for first when they are in a bad mood or drained?'
    },
    opts: {
      id: ['Camilan manis / es krim favorit', 'Tidur lelap tanpa gangguan alarm', 'Pelukan hangat & didengarkan ceritanya', 'Waktu sendiri bermain game / scrolling'],
      en: ['Sweet dessert or favorite ice cream', 'Long undisturbed nap', 'Warm hug and an open ear', 'Alone time gaming or scrolling']
    }
  },
  {
    cat: 'Values',
    q: {
      id: 'Hal apa yang paling cepat membuat pasanganmu merasa kesal atau kehilangan respek pada orang lain?',
      en: 'What behavior most quickly makes your partner lose patience or respect for someone?'
    },
    opts: {
      id: ['Sikap meremehkan pramusaji / staf', 'Kebiasaan mengingkari janji tanpa kabar', 'Sombong & selalu merasa paling benar', 'Suka bergosip dan membicarakan orang di belakang'],
      en: ['Disrespecting service staff or waiters', 'Breaking promises without a heads-up', 'Arrogance and know-it-all attitudes', 'Gossip and talking behind people’s backs']
    }
  },
  {
    cat: 'Love',
    q: {
      id: 'Jika pasanganmu bisa meminta satu hal tanpa batas waktu dari kamu, apa yang paling ia dambakan?',
      en: 'If your partner could ask for one unlimited gift of time from you, what would it be?'
    },
    opts: {
      id: ['Ditemani jalan-jalan santai tanpa terburu-buru', 'Dipijat punggungnya sambil ngobrol santai malam', 'Didengarkan keluh kesahnya tanpa disanggah', 'Dibuatkan makanan favorit saat lelah'],
      en: ['Leisurely walks without any rush', 'Shoulder massage with cozy pillow talk', 'Listening to venting without unsolicited advice', 'Cooking their favorite comfort meal']
    }
  },
  {
    cat: 'Communication',
    q: {
      id: 'Saat pasanganmu sedang cemburu atau overthinking, bagaimana ia biasanya bereaksi pertama kali?',
      en: 'When your partner feels secretly jealous or overthinks, how do they react first?'
    },
    opts: {
      id: ['Menjadi lebih pendiam dan dingin', 'Langsung bertanya dengan nada penasaran', 'Menyelipkan sindiran halus atau lelucon', 'Mencari kepastian lewat pelukan ekstra'],
      en: ['Turning quiet and emotionally distant', 'Asking directly with curious eyes', 'Dropping subtle teasing hints', 'Seeking reassurance through extra affection']
    }
  }
];

export function generateUnlimitedHowWell(seenIds: Set<string>, lang: Language = 'id'): HowWellItem {
  for (let i = 0; i < HOW_WELL_TEMPLATES.length; i++) {
    const item = HOW_WELL_TEMPLATES[i];
    const candidateId = `hw-tmpl-${normalizeSemanticSignature(item.q.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('how-well', candidateId, item.q.id)) {
      return {
        id: candidateId,
        category: item.cat,
        question: item.q[lang] || item.q.id,
        options: item.opts[lang] || item.opts.id
      };
    }
  }

  const dynQId = [
    {
      q: 'Apa ketakutan konyol atau fobia aneh yang dimiliki pasanganmu?',
      opts: ['Kecoak terbang atau serangga kecil', 'Ketinggian atau jembatan gantung', 'Ruangan sempit dan gelap gulita', 'Tertinggal rombongan di tempat asing']
    },
    {
      q: 'Bagaimana reaksi spontan pasanganmu saat menerima kejutan tak terduga?',
      opts: ['Tersipu malu dan salah tingkah', 'Tertawa terbahak-bahak bahagia', 'Menangis haru terharu berat', 'Langsung memeluk erat tanpa kata']
    }
  ];
  const dynQEn = [
    {
      q: 'What quirky fear or silly phobia does your partner harbor?',
      opts: ['Flying bugs or tiny crawlers', 'Heights or swinging bridges', 'Tight pitch-black spaces', 'Getting lost in unfamiliar crowds']
    },
    {
      q: 'What is your partner’s natural reflex when surprised with a sweet gift?',
      opts: ['Blushing and getting adorable butterflies', 'Bursting into joyful laughter', 'Getting softly teary-eyed', 'Instantly wrapping you in a tight hug']
    }
  ];

  const idx = Math.floor(Math.random() * dynQId.length);
  const picked = lang === 'id' ? dynQId[idx] : dynQEn[idx];
  const genId = `hw-dyn-${Date.now()}-${idx}`;

  return {
    id: genId,
    category: 'Light',
    question: picked.q,
    options: picked.opts
  };
}

// -------------------------------------------------------------
// 6. CHAOS MODE GENERATOR (ABSURD, FUNNY, PLAYFUL DILEMMAS)
// -------------------------------------------------------------
const CHAOS_TEMPLATES: Array<{
  prompt: { id: string; en: string };
  subtext?: { id: string; en: string };
}> = [
  {
    prompt: {
      id: 'Siapa yang bakal bertahan hidup paling lama kalau kita tiba-tiba terjebak dalam kiamat zombie?',
      en: 'Who would survive longer if a sudden zombie apocalypse broke out right now?'
    },
    subtext: {
      id: 'Yang jago lari dan sembunyi atau yang panik tapi penuh keberuntungan?',
      en: 'The tactical runner or the panicky lucky survivor?'
    }
  },
  {
    prompt: {
      id: 'Siapa yang paling mungkin menghabiskan uang 1 juta rupiah dalam 10 menit untuk barang yang sama sekali nggak penting?',
      en: 'Who is most likely to blow $100 in 10 minutes on something utterly useless?'
    },
    subtext: {
      id: 'Belanja online tengah malam atau tergiur promo lucu.',
      en: 'Midnight impulse online shopping or weird gimmicks.'
    }
  },
  {
    prompt: {
      id: 'Kalau kita berdua tersesat di hutan belantara tanpa sinyal GPS, siapa yang bakal kamu percaya buat pegang kompas?',
      en: 'If we were lost in a dense forest with zero GPS, who would you trust to hold the compass?'
    },
    subtext: {
      id: 'Tunjuk pasanganmu atau akui dirimu sendiri!',
      en: 'Point at your partner or claim the navigator crown!'
    }
  },
  {
    prompt: {
      id: 'Siapa yang paling sering bilang "Terserah mau makan apa", tapi pas dikasih opsi selalu nolak semuanya?',
      en: 'Who says "I don’t care where we eat" but proceeds to veto every single restaurant suggestion?'
    },
    subtext: {
      id: 'Jawab jujur dalam hitungan ketiga!',
      en: 'Answer honestly on the count of three!'
    }
  },
  {
    prompt: {
      id: 'Siapa yang paling payah dalam menyembunyikan rahasia kejutan ulang tahun karena wajahnya keburu senyum-senyum sendiri?',
      en: 'Who is terrible at hiding birthday surprises because they start giggling days in advance?'
    },
    subtext: {
      id: 'Wajah polos yang selalu membocorkan rencana rahasia.',
      en: 'The innocent face that gives away the whole game.'
    }
  }
];

export function generateUnlimitedChaos(seenIds: Set<string>, lang: Language = 'id'): ChaosItem {
  for (let i = 0; i < CHAOS_TEMPLATES.length; i++) {
    const item = CHAOS_TEMPLATES[i];
    const candidateId = `chaos-tmpl-${normalizeSemanticSignature(item.prompt.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('chaos-mode', candidateId, item.prompt.id)) {
      return {
        id: candidateId,
        prompt: item.prompt[lang] || item.prompt.id
      };
    }
  }

  const dynChaosId = [
    'Siapa yang paling mungkin panik berlebihan kalau ada cicak jatuh di dekat kakinya?',
    'Siapa yang punya selera humor paling receh dan bisa ngakak sendirian di depan layar HP?',
    'Siapa yang lebih lama siap-siap di depan cermin sebelum kita berangkat kencan?',
    'Siapa yang bakal lupa di mana menaruh kunci motor/mobil padahal lagi dipegang di tangan sendiri?'
  ];
  const dynChaosEn = [
    'Who screams louder when an innocent tiny lizard scurries near their foot?',
    'Who has the most broken sense of humor and bursts out laughing at 2 AM memes?',
    'Who takes 30 minutes longer getting dressed before stepping out for a date?',
    'Who spends 10 minutes looking for their keys while holding them in their own hand?'
  ];

  const idx = Math.floor(Math.random() * dynChaosId.length);
  const prompt = lang === 'id' ? dynChaosId[idx] : dynChaosEn[idx];
  const genId = `chaos-dyn-${Date.now()}-${idx}`;

  return {
    id: genId,
    prompt
  };
}

// -------------------------------------------------------------
// 7. KATAKAN SESUATU (TELL ME SOMETHING) GENERATOR
// -------------------------------------------------------------
const TELL_ME_TEMPLATES = [
  {
    id: 'Katakan satu hal kecil tentang caraku tertawa atau tersenyum yang paling kamu sukai.',
    en: 'Tell me one little thing about the way I smile or laugh that you secretly adore.'
  },
  {
    id: 'Ungkapkan satu kekhawatiran tentang dirimu yang selama ini malu kamu akui kepadaku.',
    en: 'Confess one vulnerable insecurity about yourself you were once shy to admit to me.'
  },
  {
    id: 'Ceritakan satu kenangan kencan kita yang sampai sekarang masih sering membuat hatimu hangat saat teringat.',
    en: 'Describe one past date of ours that still brings warmth to your heart whenever you remember it.'
  },
  {
    id: 'Beri tahu aku satu hal yang bisa kulakukan minggu ini untuk membuat harimu terasa jauh lebih ringan.',
    en: 'Tell me one concrete thing I can do this week to make your life feel significantly lighter.'
  },
  {
    id: 'Katakan satu kalimat apresiasi yang menurutmu jarang aku dengar dari orang lain, tapi sangat layak kudapatkan.',
    en: 'Share one compliment or affirmation you feel I don’t hear enough from the world, but truly deserve.'
  }
];

export function generateUnlimitedTellMe(seenIds: Set<string>, lang: Language = 'id'): string {
  for (let i = 0; i < TELL_ME_TEMPLATES.length; i++) {
    const item = TELL_ME_TEMPLATES[i];
    const candidateId = `tell-tmpl-${normalizeSemanticSignature(item.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('tell-me-something', candidateId, item.id)) {
      return item[lang] || item.id;
    }
  }

  const dynTellId = [
    'Bisikkan satu impian romantis yang paling ingin kamu wujudkan bersamaku sebelum tahun ini berakhir.',
    'Katakan satu hal yang paling kamu rindukan saat kita sedang terpisah jarak beberapa hari.',
    'Beri tahu aku satu perubahan positif dalam hidupmu sejak kita pertama kali berjalan bersama.',
    'Katakan satu hal yang membuatmu merasa bangga menjadi pasanganku di mata orang lain.'
  ];
  const dynTellEn = [
    'Share one romantic hope you most want to experience with me before this year comes to a close.',
    'Tell me what you miss most deeply when we are apart for a few days.',
    'Share one positive transformation in your personal life since we began walking this path together.',
    'Tell me one reason you feel quietly proud to stand by my side in front of the world.'
  ];

  const idx = Math.floor(Math.random() * dynTellId.length);
  return lang === 'id' ? dynTellId[idx] : dynTellEn[idx];
}

// -------------------------------------------------------------
// 8. TANYA BEBAS (CUSTOM ASK) ENDLESS INSPIRATION STREAM
// -------------------------------------------------------------
const INSPIRATION_PROMPT_POOLS = [
  {
    cat: 'Deep Vulnerability',
    id: 'Apa luka masa lalu yang paling ingin kamu sembuhkan bersama dalam pelukan hubungan ini?',
    en: 'What past wound do you most wish to gently heal within the safety of our bond?'
  },
  {
    cat: 'Future Dreams',
    id: 'Jika kita diberi kesempatan tinggal di luar negeri selama 1 tahun, kota mana yang akan kamu pilih?',
    en: 'If we could live abroad together for one full year, which city would you choose?'
  },
  {
    cat: 'Love & Gratitude',
    id: 'Kapan momen paling mengharukan saat kamu menyadari betapa tulusnya perhatian yang kuberikan padamu?',
    en: 'When was a touching moment when you realized the sheer depth of care I hold for you?'
  },
  {
    cat: 'Funny Banter',
    id: 'Kalau kita bertukar tubuh selama 24 jam, hal pertama apa yang bakal kamu lakukan pakai tubuhku?',
    en: 'If we swapped bodies for 24 hours, what is the very first thing you would do?'
  },
  {
    cat: 'Daily Intimacy',
    id: 'Sentuhan atau kata-kata manis apa yang paling cepat mengubah hari burukmu menjadi damai?',
    en: 'What comforting touch or tender words most quickly turn a rough day into peace?'
  }
];

export function generateUnlimitedCustomInspiration(seenIds: Set<string>, lang: Language = 'id'): { text: string; category: string } {
  for (let i = 0; i < INSPIRATION_PROMPT_POOLS.length; i++) {
    const item = INSPIRATION_PROMPT_POOLS[i];
    const candidateId = `insp-tmpl-${normalizeSemanticSignature(item.id).slice(0, 12)}`;
    if (!seenIds.has(candidateId) && !isQuestionSeen('custom-ask', candidateId, item.id)) {
      return {
        text: item[lang] || item.id,
        category: item.cat
      };
    }
  }

  const dynInspId = [
    'Apa kebiasaan unik dariku yang menurutmu paling menggemaskan saat aku tidak sadar sedang diperhatikan?',
    'Bagaimana caramu menjaga api asmara kita tetap berkobar saat rutinitas kerja terasa monoton?',
    'Jika hidup kita dibuatkan buku autobiografi, judul bab apa yang cocok untuk fase hubungan kita saat ini?',
    'Apa satu nasihat cinta terbaik yang pernah kamu dengar dan ingin kita terapkan bersama?'
  ];
  const dynInspEn = [
    'What adorable quirk of mine do you love catching when I have no idea you are looking?',
    'How do you envision keeping our romantic spark ablaze during predictable work weeks?',
    'If our love story was a published book, what chapter title best captures where we stand today?',
    'What is the greatest piece of relationship wisdom you have ever encountered that you want us to live by?'
  ];

  const idx = Math.floor(Math.random() * dynInspId.length);
  return {
    text: lang === 'id' ? dynInspId[idx] : dynInspEn[idx],
    category: 'Endless Discovery'
  };
}
