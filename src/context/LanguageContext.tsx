import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

export interface Translations {
  [key: string]: {
    id: string;
    en: string;
  };
}

export const UI_STRINGS: Translations = {
  // Brand & Nav
  appName: { id: 'Dua Hati', en: 'Dua Hati' },
  appTagline: { id: 'Ruang obrolan santai & bermakna untuk berdua', en: 'An intimate conversation space for couples' },
  faceToFaceMode: { id: 'Mode offline (1 layar)', en: 'Offline mode (1 screen)' },
  onlineMode: { id: 'Mode online (2 HP)', en: 'Online mode (2 phones)' },
  lobby: { id: 'Beranda', en: 'Lobby' },
  universe: { id: 'Jelajah topik', en: 'Universe' },
  memories: { id: 'Kenangan', en: 'Memories' },
  surprise: { id: 'Acak game', en: 'Surprise us' },
  soundOn: { id: 'Suara aktif', en: 'Sound on' },
  soundOff: { id: 'Suara nonaktif', en: 'Sound off' },
  onlineWaiting: { id: 'Menunggu pasangan bergabung...', en: 'Waiting for partner...' },
  onlineConnected: { id: 'Terhubung', en: 'Connected' },
  isTyping: { id: 'sedang mengetik...', en: 'is typing...' },
  save: { id: 'Simpan', en: 'Save' },
  cancel: { id: 'Batal', en: 'Cancel' },
  close: { id: 'Tutup', en: 'Close' },
  back: { id: 'Kembali', en: 'Back' },
  next: { id: 'Lanjut', en: 'Next' },
  shuffle: { id: 'Acak kartu', en: 'Shuffle' },
  nextCard: { id: 'Kartu berikutnya', en: 'Next card' },
  saveToMemories: { id: 'Simpan ke kenangan', en: 'Save to memories' },
  savedToMemories: { id: 'Tersimpan di kenangan', en: 'Saved to memories' },
  faceToFaceHint: { id: 'Obrolkan langsung berdua', en: 'Talk face-to-face' },
  faceToFaceDesc: { id: 'Tatap mata pasanganmu dan ceritakan jawabanmu dengan santai dan jujur.', en: 'Look into your partner’s eyes and share your thoughts openly and warmly.' },
  noteOptional: { id: 'Catat momen ini (opsional)', en: 'Write a note for this moment (optional)' },
  backToLobby: { id: 'Kembali ke beranda', en: 'Back to lobby' },
  infiniteBadge: { id: 'Pertanyaan tak terbatas', en: 'Unlimited questions' },
  infiniteNewPrompt: { id: 'Buat pertanyaan baru', en: 'Generate new prompt' },

  // Welcome Screen
  welcomeTitle: { id: 'Ruang cerita & cinta kalian berdua', en: 'A space for your stories & love' },
  welcomeSubtitle: { id: 'Pilih cara bermain yang paling nyaman untuk kalian hari ini.', en: 'Choose the way you want to connect and play today.' },
  modeOfflineTitle: { id: 'Mode offline (1 layar)', en: 'Offline mode (1 screen)' },
  modeOfflineDesc: { id: 'Lagi duduk bareng? Buka kartu pertanyaan, tatap mata pasangan, dan ngobrol santai tanpa perlu ngetik.', en: 'Sitting together? Open questions, look each other in the eye, and talk openly without typing.' },
  modeOnlineTitle: { id: 'Mode online (2 HP berjauhan)', en: 'Online mode (2 phones / LDR)' },
  modeOnlineDesc: { id: 'LDR atau lagi beda tempat? Masuk ke room yang sama lewat kode dengan sinkronisasi kartu dan ketikan real-time.', en: 'In an LDR or different rooms? Connect via room code with live synchronized cards and typing.' },
  partnerNamesTitle: { id: 'Nama kalian berdua', en: 'Your names' },
  player1Placeholder: { id: 'Namamu (misal: Rama)', en: 'Your name (e.g. Alex)' },
  player2Placeholder: { id: 'Nama pasangan (misal: Shinta)', en: 'Partner’s name (e.g. Sam)' },
  relationshipStageTitle: { id: 'Fase hubungan saat ini', en: 'Current relationship stage' },
  startAdventure: { id: 'Mulai ngobrol sekarang', en: 'Start connecting' },

  // Relationship Stages
  stageCuriosity: { id: '🌱 Baru kenal / PDKT', en: '🌱 Curious & dating' },
  stageGettingCloser: { id: '🌸 Makin dekat & nyaman', en: '🌸 Getting closer' },
  stageKnowingEachOther: { id: '✨ Saling memahami lebih dalam', en: '✨ Knowing each other deeply' },
  stageBuildingSomething: { id: '🧱 Berkomitmen & bangun masa depan', en: '🧱 Building together' },
  stageImaginingForever: { id: '🏡 Menuju masa depan bersama', en: '🏡 Imagining forever' },

  // Lobby
  lobbyHeading: { id: 'Mau ngobrol atau seru-seruan apa hari ini?', en: 'What kind of conversation are you craving today?' },
  lobbySubheading: { id: 'Pilih deck kartu sesuai suasana hati kalian. Setiap deck punya pertanyaan tak terbatas.', en: 'Pick a card deck that matches your mood right now. Every deck has unlimited questions.' },
  playNow: { id: 'Mulai main', en: 'Play now' },
  featuredDeck: { id: 'Pilihan favorit', en: 'Featured deck' },
  categoryAll: { id: 'Semua deck', en: 'All decks' },
  categoryDeep: { id: 'Mendalam & personal', en: 'Deep & vulnerable' },
  categoryPlayful: { id: 'Santai & seru', en: 'Fun & playful' },
  categoryFuture: { id: 'Masa depan & cinta', en: 'Love & future' },

  // Games Titles & Descriptions
  deepTalkTitle: { id: 'Deep talk', en: 'Deep talk' },
  deepTalkDesc: { id: 'Pertanyaan hangat dan jujur untuk saling memahami perasaan dan pikiran yang jarang terucap.', en: 'Meaningful questions to explore quiet truths, emotional safety, and inner feelings.' },
  thisOrThatTitle: { id: 'This or that', en: 'This or that' },
  thisOrThatDesc: { id: 'Pilih cepat antara dua opsi seru. Cek seberapa kompak selera dan cara pandang kalian!', en: 'Fast choices between two options. See how aligned your tastes and habits are!' },
  chaosModeTitle: { id: 'Chaos mode 😂', en: 'Chaos mode 😂' },
  chaosModeDesc: { id: 'Skenario lucu "siapa yang paling mungkin?". Penuh tawa, canda spontan, dan tuduhan manis.', en: 'Funny "who is more likely to...?" debates. Fast-paced, unfiltered laughs.' },
  howWellTitle: { id: 'Seberapa paham kamu?', en: 'How well do you know me?' },
  howWellDesc: { id: 'Tebak pilihan rahasia dan kebiasaan pasanganmu. Uji seberapa jeli kamu mengenalnya!', en: 'Guess your partner’s true preferences and see how well you really know their heart.' },
  getToKnowTitle: { id: 'Kenali diriku', en: 'Get to know me' },
  getToKnowDesc: { id: 'Eksplorasi gaya komunikasi, bahasa cinta, dan cara menenangkan diri pas lagi capek.', en: 'Explore communication styles, love languages, and how you each handle stress.' },
  loveAndUsTitle: { id: 'Cinta & kita', en: 'Love & us' },
  loveAndUsDesc: { id: 'Refleksi manis tentang alasan saling jatuh cinta, momen berkesan, dan janji berdua.', en: 'Sweet reflections on falling in love, quiet devotions, and favorite memories.' },
  tellMeTitle: { id: 'Katakan sesuatu padaku', en: 'Tell me something' },
  tellMeDesc: { id: 'Prompt kejujuran manis yang sering kali malu atau canggung diungkapkan secara langsung.', en: 'Prompts for heartfelt truths that are often easier to write than say.' },
  dailyDropTitle: { id: 'Obrolan harian (daily drop)', en: 'Daily drop' },
  dailyDropDesc: { id: 'Satu pertanyaan kecil dan hangat setiap hari untuk menjaga kedekatan di tengah kesibukan.', en: 'One small thoughtful question each day to keep you connected.' },
  dateNightTitle: { id: 'Panduan kencan (date night)', en: 'Date night flow' },
  dateNightDesc: { id: 'Rangkaian 7 tahap terstruktur dari pemanasan santai hingga janji manis berdua.', en: 'A guided 7-stage romantic journey from light warm-ups to heartfelt intentions.' },
  ldrModeTitle: { id: 'Mode LDR (jarak jauh)', en: 'LDR connection deck' },
  ldrModeDesc: { id: 'Dirancang khusus untuk menghangatkan hati yang sedang terpisah jarak dan waktu.', en: 'Crafted especially to bridge the physical miles and warm each other’s hearts.' },
  wishesTitle: { id: 'Harapan & cita', en: 'Wishes & hopes' },
  wishesDesc: { id: 'Membayangkan rumah idaman, petualangan berdua, dan harapan indah di masa depan.', en: 'Imagine your dream home, adventures together, and quiet hopes for the future.' },
  customAskTitle: { id: 'Tanya bebas (custom)', en: 'Custom question box' },
  customAskDesc: { id: 'Tulis pertanyaan rahasiamu sendiri dan minta pasangan menjawabnya dengan jujur.', en: 'Write your own custom question and invite your partner to answer.' },

  // Room Modal
  roomModalTitle: { id: 'Mode online (sinkron 2 HP)', en: 'Online multiplayer (2 phones)' },
  roomModalDesc: { id: 'Bermain secara real-time dari dua HP berbeda dengan kartu dan ketikan tersinkronisasi.', en: 'Play in real-time from two separate phones with synced cards and live typing.' },
  createRoomTab: { id: 'Buat room baru', en: 'Create room' },
  joinRoomTab: { id: 'Gabung room', en: 'Join room' },
  yourRoomCode: { id: 'Kode room kalian:', en: 'Your room code:' },
  copyCode: { id: 'Salin kode', en: 'Copy code' },
  copyLink: { id: 'Salin link undangan', en: 'Copy invite link' },
  linkCopied: { id: 'Link tersalin!', en: 'Link copied!' },
  waitingPartnerJoin: { id: 'Menunggu pasangan membuka link atau memasukkan kode...', en: 'Waiting for your partner to join via link or code...' },
  enterRoomCode: { id: 'Masukkan kode 6 digit:', en: 'Enter 6-digit room code:' },
  joinButton: { id: 'Gabung sekarang', en: 'Join room now' },
  switchOfflineBtn: { id: 'Beralih ke mode offline (1 layar)', en: 'Switch to offline mode (1 screen)' },

  // Memories / Our Story
  ourStoryTitle: { id: 'Brankas kenangan kita', en: 'Our memories vault' },
  ourStorySubtitle: { id: 'Kumpulan jawaban manis, janji, dan momen tawa yang pernah kalian simpan bersama.', en: 'A collection of sweet answers, pledges, and laughing moments saved together.' },
  emptyMemoriesTitle: { id: 'Belum ada kenangan tersimpan', en: 'No saved memories yet' },
  emptyMemoriesDesc: { id: 'Saat bermain kartu apa pun, klik tombol "Simpan ke kenangan" untuk mengabadikan momen kalian di sini.', en: 'When playing any card game, click "Save to memories" to cherish your special moments here.' },
  exploreGames: { id: 'Mulai main & buat kenangan', en: 'Start playing & make memories' },

  // Question Library / Universe
  universeTitle: { id: 'Perpustakaan pertanyaan', en: 'Question universe' },
  universeSubtitle: { id: 'Jelajahi ratusan topik obrolan berdasarkan kategori dan tingkat kedalaman.', en: 'Explore hundreds of conversation prompts filtered by category and depth.' },
  filterCategory: { id: 'Kategori', en: 'Category' },
  filterDepth: { id: 'Tingkat kedalaman', en: 'Depth level' },
  allDepths: { id: 'Semua tingkat', en: 'All depths' },
  searchPromptPlaceholder: { id: 'Cari topik atau kata kunci...', en: 'Search prompts or keywords...' },
  launchDeck: { id: 'Buka deck ini', en: 'Play this deck' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'en' || saved === 'id') return saved;
    // Default to Indonesian
    return 'id';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultText?: string): string => {
    const entry = UI_STRINGS[key];
    if (!entry) return defaultText || key;
    return entry[language] || entry.id || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
