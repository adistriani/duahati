import { BaseQuestion, ThisOrThatItem, GetToKnowItem, HowWellItem, ChaosItem, QuestionCategory } from '../types';
import { Language } from '../context/LanguageContext';
import {
  generateUnlimitedDeepTalk,
  generateUnlimitedThisOrThat,
  generateUnlimitedWishes,
  generateUnlimitedGetToKnow,
  generateUnlimitedHowWell,
  generateUnlimitedChaos,
  generateUnlimitedTellMe,
  isQuestionSeen,
  markQuestionSeen
} from '../utils/questionEngine';

export type ConversationDepth = 'light' | 'fun' | 'personal' | 'deep';

export interface BilingualThisOrThat {
  id: string;
  category: QuestionCategory;
  optionA: { label: { id: string; en: string }; icon: string };
  optionB: { label: { id: string; en: string }; icon: string };
  followUp: { id: string; en: string };
}

export interface BilingualGetToKnow {
  id: string;
  category: QuestionCategory;
  statementA: { id: string; en: string };
  statementB: { id: string; en: string };
}

export interface BilingualHowWell {
  id: string;
  category: QuestionCategory;
  question: { id: string; en: string };
  options: { id: string[]; en: string[] };
}

export interface BilingualChaos {
  id: string;
  category: 'Chaos';
  text: { id: string; en: string };
  subtext: { id: string; en: string };
  timerSeconds?: number;
  options?: { id: string[]; en: string[] };
}

export interface BilingualBaseQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: { id: string; en: string };
  text: { id: string; en: string };
  subtext?: { id: string; en: string };
}

// -------------------------------------------------------------
// CURATED MASTER POOLS (Rich Topic Angles & Varied Structures)
// -------------------------------------------------------------

export const RAW_BASE_QUESTIONS: BilingualBaseQuestion[] = [
  // 1. Perspective & Dynamics
  {
    id: 'dt-dyn-1',
    category: 'Deep Talk',
    difficulty: { id: '🌱 Santai', en: '🌱 Light & easy' },
    text: {
      id: 'Menurut kamu, kita berdua paling mirip dalam hal apa dan paling beda jauh dalam hal apa?',
      en: 'In what ways are we most identical, and in what ways are we completely opposite?'
    },
    subtext: {
      id: 'Bisa cara mikir, selera humor, atau cara menyikapi masalah.',
      en: 'Mindsets, sense of humor, or handling pressure.'
    }
  },
  {
    id: 'dt-dyn-2',
    category: 'Deep Talk',
    difficulty: { id: '😄 Seru', en: '😄 Fun & playful' },
    text: {
      id: 'Kalau perjalanan hubungan kita dijadiin film bioskop, genre utamanya apa dan siapa yang bakal jadi sutradaranya?',
      en: 'If our relationship story was turned into a movie, what genre would it be and who would direct it?'
    },
    subtext: {
      id: 'Romcom manis, drama penuh tawa, atau petualangan seru.',
      en: 'Sweet romcom, hilarious adventure, or heartfelt indie film.'
    }
  },
  {
    id: 'dt-dyn-3',
    category: 'Deep Talk',
    difficulty: { id: '🌱 Santai', en: '🌱 Light & easy' },
    text: {
      id: 'Hal random atau lelucon konyol apa yang menurutmu cuma kita berdua di dunia ini yang paham maksudnya?',
      en: 'What inside joke or random quirk do you think only the two of us truly understand?'
    },
    subtext: {
      id: 'Panggilan rahasia, tatapan mata kode, atau celetukan spontan.',
      en: 'Secret code words, subtle eye contact, or silly moments.'
    }
  },
  {
    id: 'dt-dyn-4',
    category: 'Deep Talk',
    difficulty: { id: '✨ Masa depan', en: '✨ Big conversation' },
    text: {
      id: 'Kalau besok kita dapet hari libur mendadak tanpa batas budget sama sekali, rencana seharian kita bakal seperti apa?',
      en: 'If tomorrow was an unplanned day off with unlimited budget, how would our full 24-hour adventure look?'
    },
    subtext: {
      id: 'Mulai dari sarapan pagi sampai larut malam.',
      en: 'From morning coffee to midnight wanderings.'
    }
  },
  {
    id: 'dt-dyn-5',
    category: 'Deep Talk',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Ada nggak sesuatu dari awal kita kenal yang dulu kamu kira bakal bikin kita sering ribut, tapi ternyata sekarang malah aman-aman aja?',
      en: 'Was there something when we first met that you feared would cause friction, but turned out to be completely fine?'
    },
    subtext: {
      id: 'Perbedaan kebiasaan, sifat bawaan, atau gaya komunikasi.',
      en: 'Habit differences, background, or communication quirks.'
    }
  },
  {
    id: 'dt-dyn-6',
    category: 'Deep Talk',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Kalau kamu boleh milih satu hari di masa lalu kita buat diulang persis tanpa ada yang diubah, hari yang mana yang kamu pilih?',
      en: 'If you could pick one exact day from our past to relive completely unchanged, which one would it be?'
    },
    subtext: {
      id: 'Kencan pertama, hari liburan santai, atau malam ngobrol panjang.',
      en: 'First date, cozy trip, or a late-night talk.'
    }
  },
  {
    id: 'dt-dyn-7',
    category: 'Deep Talk',
    difficulty: { id: '🌱 Santai', en: '🌱 Light & easy' },
    text: {
      id: 'Kalau aku tiba-tiba ngajak pergi sekarang juga tanpa persiapan apa pun, tempat mana yang langsung terlintas di kepalamu?',
      en: 'If I asked you to leave right this second with no prep, where would you immediately want us to go?'
    },
    subtext: {
      id: 'Warung makan favorit, jalanan sepi pinggir kota, atau kafe langganan.',
      en: 'Favorite food spot, quiet scenic road, or familiar café.'
    }
  },
  {
    id: 'dt-dyn-8',
    category: 'Deep Talk',
    difficulty: { id: '🌱 Santai', en: '🌱 Light & easy' },
    text: {
      id: 'Kebiasaan kecil aku yang pas awal-awal kenal kelihatan aneh tapi sekarang malah bikin kangen kalau lagi nggak ada apa?',
      en: 'What little habit of mine seemed odd at first, but now you genuinely miss when we are apart?'
    },
    subtext: {
      id: 'Cara nyiapin barang, nada bicara, atau gaya jalan.',
      en: 'How I pack, talk to myself, or silly gestures.'
    }
  },

  // 2. Emotional Vulnerability & Safe Harbor
  {
    id: 'dt-vul-1',
    category: 'Deep Talk',
    difficulty: { id: '🌙 Mendalam', en: '🌙 Deep & vulnerable' },
    text: {
      id: 'Saat dunia di luar terasa terlalu berisik dan bikin kewalahan, suasana seperti apa yang paling kamu butuhin pas pulang ke aku?',
      en: 'When the outside world feels too loud and overwhelming, what environment do you need most when returning to me?'
    },
    subtext: {
      id: 'Keheningan tanpa tuntutan bicara, pelukan hangat, atau didengarkan tanpa dinasihati.',
      en: 'Quiet comfort, holding hands, or being heard without unsolicited advice.'
    }
  },
  {
    id: 'dt-vul-2',
    category: 'Deep Talk',
    difficulty: { id: '🌙 Mendalam', en: '🌙 Deep & vulnerable' },
    text: {
      id: 'Bentuk luka atau rasa takut masa lalu apa yang perlahan-lahan mulai terasa lebih sembuh sejak kamu bersama aku?',
      en: 'What past fear or quiet scar has felt a little lighter or safer since we have been together?'
    },
    subtext: {
      id: 'Rasa takut tidak dihargai, cemas ditinggalkan, atau keraguan pada diri sendiri.',
      en: 'Fear of being judged, fear of abandonment, or self-doubt.'
    }
  },
  {
    id: 'dt-vul-3',
    category: 'Deep Talk',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Hal apa yang paling sering bikin kamu ragu untuk minta tolong atau cerita saat kamu sedang menghadapi hari yang berat?',
      en: 'What makes you hesitate most before asking for help when you are having a tough time?'
    },
    subtext: {
      id: 'Takut merepotkan, gengsi, atau belum tahu cara merangkai katanya.',
      en: 'Fear of burdening others, pride, or struggling to find words.'
    }
  },
  {
    id: 'dt-vul-4',
    category: 'Deep Talk',
    difficulty: { id: '🌙 Mendalam', en: '🌙 Deep & vulnerable' },
    text: {
      id: 'Kapan momen di mana kamu merasa paling bebas menjadi dirimu seutuhnya tanpa perlu memakai topeng apa pun di depanku?',
      en: 'When did you feel completely free to be your unfiltered self without any emotional armor around me?'
    },
    subtext: {
      id: 'Saat menangis bersama, tertawa konyol, atau bangun tidur tanpa polesan.',
      en: 'Crying together, being goofy, or resting without performance.'
    }
  },

  // 3. Communication & Resolving Conflict
  {
    id: 'dt-com-1',
    category: 'Communication',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Sinyal halus apa yang biasanya kamu tunjukkan saat suasana hatimu lagi buruk tapi kamu belum siap untuk bicara?',
      en: 'What subtle cues do you show when your mood drops but you are not yet ready to explain why?'
    },
    subtext: {
      id: 'Jadi lebih pendiam, sibuk sendiri, atau membalas pesan dengan sangat singkat.',
      en: 'Going quiet, getting distracted, or sending one-word replies.'
    }
  },
  {
    id: 'dt-com-2',
    category: 'Communication',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Kalau ada kesalahpahaman di antara kita, kalimat pembuka seperti apa dari aku yang paling cepat menurunkan ketegangan di hatimu?',
      en: 'If tension rises between us, what opening sentence from me most quickly softens your defensiveness?'
    },
    subtext: {
      id: '"Aku di sini buat dengerin", "Kita satu tim", atau permohonan maaf yang tulus.',
      en: '"We are on the same team", "I want to understand", or a warm touch.'
    }
  },
  {
    id: 'dt-com-3',
    category: 'Communication',
    difficulty: { id: '✨ Masa depan', en: '✨ Big conversation' },
    text: {
      id: 'Kebiasaan komunikasi apa dari kita yang menurutmu perlu kita jaga baik-baik agar hubungan kita tetap sehat bertahun-tahun ke depan?',
      en: 'What communication habit of ours should we fiercely protect so our connection stays healthy for decades?'
    },
    subtext: {
      id: 'Tidak mendiamkan masalah berhari-hari, saling mengabari tanpa paksaan, atau selalu mengucap terima kasih.',
      en: 'Never stonewalling, casual check-ins, or daily appreciation.'
    }
  },

  // 4. Values & Life Philosophy
  {
    id: 'dt-val-1',
    category: 'Values',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Bagaimana caramu mendefinisikan arti "kehidupan yang cukup dan damai" bagi masa depan kita berdua?',
      en: 'How do you define a "content and peaceful life" for our future together?'
    },
    subtext: {
      id: 'Keseimbangan antara ambisi karier, kebebasan waktu luang, dan kehangatan rumah.',
      en: 'Career ambition, time freedom, and warm sanctuary.'
    }
  },
  {
    id: 'dt-val-2',
    category: 'Values',
    difficulty: { id: '✨ Masa depan', en: '✨ Big conversation' },
    text: {
      id: 'Dalam mengelola keuangan keluarga nanti, prinsip apa yang paling tidak boleh kita kompromikan?',
      en: 'When managing our shared finances down the road, what core principle should never be compromised?'
    },
    subtext: {
      id: 'Keterbukaan anggaran, dana darurat, sedekah, atau alokasi kebahagiaan bersama.',
      en: 'Transparency, safety nets, generosity, or shared joy budgets.'
    }
  },
  {
    id: 'dt-val-3',
    category: 'Values',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Bila suatu saat salah satu dari kita harus mengambil keputusan besar yang mengubah ritme hidup, bagaimana kita akan menentukannya bersama?',
      en: 'If one of us ever faces a major life pivot, how do you envision us navigating the choice together?'
    },
    subtext: {
      id: 'Pindah kota, ganti haluan karier, atau merawat keluarga.',
      en: 'Relocation, career change, or supporting family.'
    }
  },

  // 5. Love & Devotion (Fresh non-cliche angles)
  {
    id: 'lu-fr-1',
    category: 'Love',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Hal kecil apa yang aku lakukan tanpa sadar yang membuatmu diam-diam tersenyum dan merasa beruntung?',
      en: 'What little thing do I do unconsciously that makes you secretly smile and feel grateful?'
    },
    subtext: {
      id: 'Menyelipkan selimut, mengingat camilan kesukaanmu, atau caraku menyapa pagimu.',
      en: 'Fixing blankets, bringing snacks, or my morning greetings.'
    }
  },
  {
    id: 'lu-fr-2',
    category: 'Love',
    difficulty: { id: '🌱 Santai', en: '🌱 Light & easy' },
    text: {
      id: 'Bila cinta kita bisa digambarkan dengan satu aroma atau suasana cuaca, aroma dan suasana seperti apa itu?',
      en: 'If our love was described by a scent or weather mood, what would it be?'
    },
    subtext: {
      id: 'Hujan rintik di jendela, aroma kopi seduh pagi, atau angin sore di pantai.',
      en: 'Rain on the window, morning coffee aroma, or gentle sea breeze.'
    }
  },
  {
    id: 'lu-fr-3',
    category: 'Love',
    difficulty: { id: '✨ Masa depan', en: '✨ Big conversation' },
    text: {
      id: 'Saat rambut kita sama-sama memutih puluhan tahun lagi, bayangan momen seperti apa yang paling ingin kamu nikmati berdua?',
      en: 'Decades from now when our hair turns silver, what quiet scene do you most look forward to sharing?'
    },
    subtext: {
      id: 'Duduk di teras belakang menyeruput teh, jalan pagi beriringan, atau menertawakan cerita lama.',
      en: 'Sitting on the porch with tea, morning walks, or laughing at old memories.'
    }
  },
  {
    id: 'lu-fr-4',
    category: 'Love',
    difficulty: { id: '💭 Personal', en: '💭 Personal & open' },
    text: {
      id: 'Kapan kamu pertama kali menyadari bahwa perasaanmu kepadaku sudah melampaui rasa suka biasa dan menjadi komitmen yang sungguh-sungguh?',
      en: 'When did you first realize your feelings for me grew beyond infatuation into genuine commitment?'
    },
    subtext: {
      id: 'Saat melewati masa sulit bersama atau obrolan hening di tengah malam.',
      en: 'Going through a tough patch together or a quiet late-night talk.'
    }
  }
];

// -------------------------------------------------------------
// THIS OR THAT (Fresh Dilemmas & Contrast Choices)
// -------------------------------------------------------------

export const RAW_THIS_OR_THAT: BilingualThisOrThat[] = [
  {
    id: 'tot-1',
    category: 'Light',
    optionA: { label: { id: 'Ngopi santai di kafe tenang berdua', en: 'Quiet coffee date in a cozy spot' }, icon: '☕' },
    optionB: { label: { id: 'Midnight drive muter kota dengerin musik', en: 'Late night drive with good music' }, icon: '🌙' },
    followUp: { id: 'Playlist lagu apa yang wajib diputar pas momen itu berlangsung?', en: 'What soundtrack must play during that moment?' }
  },
  {
    id: 'tot-2',
    category: 'Light',
    optionA: { label: { id: 'Makan street food lesehan pinggir jalan', en: 'Casual street food stalls' }, icon: '🍢' },
    optionB: { label: { id: 'Dinner romantis di restoran bernuansa redup', en: 'Romantic dinner in a dim aesthetic spot' }, icon: '🕯️' },
    followUp: { id: 'Makanan apa yang paling ngingetin kamu sama masa awal PDKT kita?', en: 'What food reminds you most of our early days?' }
  },
  {
    id: 'tot-3',
    category: 'Values',
    optionA: { label: { id: 'Nabung disiplin demi keamanan masa depan', en: 'Strict savings for future safety' }, icon: '🏦' },
    optionB: { label: { id: 'Alokasi bebas buat liburan dan pengalaman baru', en: 'Flexible budget for travel and memories' }, icon: '✈️' },
    followUp: { id: 'Berapa persen alokasi ideal menurutmu antara bersenang-senang dan investasi?', en: 'What is your ideal split between living now and saving for later?' }
  },
  {
    id: 'tot-4',
    category: 'Communication',
    optionA: { label: { id: 'Selesaikan masalah hari itu juga sebelum tidur', en: 'Resolve arguments before sleeping' }, icon: '⚡' },
    optionB: { label: { id: 'Beri waktu hening semalam buat mendinginkan kepala', en: 'Take a quiet night to cool down first' }, icon: '🧘' },
    followUp: { id: 'Berapa lama waktu hening yang pas sebelum salah satu dari kita menyapa duluan?', en: 'How long of a pause feels healthy before checking back in?' }
  },
  {
    id: 'tot-5',
    category: 'Future',
    optionA: { label: { id: 'Tinggal di apartemen modern pusat kota', en: 'Modern downtown high-rise apartment' }, icon: '🏙️' },
    optionB: { label: { id: 'Rumah asri di pinggiran kota dengan halaman hijau', en: 'Suburban home with a garden & fresh air' }, icon: '🏡' },
    followUp: { id: 'Sudut ruangan seperti apa yang wajib ada di rumah impian kita nanti?', en: 'What special nook must exist in our future home?' }
  },
  {
    id: 'tot-6',
    category: 'Love',
    optionA: { label: { id: 'Surat tulisan tangan panjang yang puitis', en: 'A heartfelt handwritten letter' }, icon: '💌' },
    optionB: { label: { id: 'Kado barang yang sudah lama diidam-idamkan', en: 'A thoughtful gift from the wishlist' }, icon: '🎁' },
    followUp: { id: 'Kapan terakhir kali sebuah kejutan kecil sukses membuat harimu cerah?', en: 'When did a small surprise last brighten your entire day?' }
  },
  {
    id: 'tot-7',
    category: 'Light',
    optionA: { label: { id: 'Liburan terencana rapi dengan rundown detail', en: 'Strictly planned itinerary with reservations' }, icon: '📋' },
    optionB: { label: { id: 'Petualangan spontan tanpa jadwal pasti', en: 'Pure spontaneous adventure' }, icon: '🎒' },
    followUp: { id: 'Destinasi mana yang paling seru kalau kita jelajahi secara spontan?', en: 'Which destination would be most thrilling to explore spontaneously?' }
  },
  {
    id: 'tot-8',
    category: 'Flirty',
    optionA: { label: { id: 'Pelukan erat dari belakang pas lagi sibuk', en: 'Surprise warm hug from behind' }, icon: '🫂' },
    optionB: { label: { id: 'Genggaman tangan hangat di saku mantel', en: 'Holding hands inside a warm pocket' }, icon: '🤝' },
    followUp: { id: 'Sentuhan kecil apa dari aku yang paling cepat menenangkanmu?', en: 'What physical touch instantly grounds you when stressed?' }
  }
];

// -------------------------------------------------------------
// GET TO KNOW ME (Dichotomies of Personality & Quirks)
// -------------------------------------------------------------

export const RAW_GET_TO_KNOW: BilingualGetToKnow[] = [
  {
    id: 'gtk-1',
    category: 'Communication',
    statementA: {
      id: 'Saat sedih, aku butuh dipeluk dan mendengar kata-kata penenang.',
      en: 'When sad, I crave warm hugs and comforting reassurance.'
    },
    statementB: {
      id: 'Saat sedih, aku butuh ruang hening sendiri untuk merenung.',
      en: 'When sad, I need quiet solitude to process everything.'
    }
  },
  {
    id: 'gtk-2',
    category: 'Love',
    statementA: {
      id: 'Aku merasa paling dicintai lewat ucapan tulus dan apresiasi langsung.',
      en: 'I feel most loved through verbal praise and spoken appreciation.'
    },
    statementB: {
      id: 'Aku merasa paling dicintai lewat bantuan nyata tanpa diminta.',
      en: 'I feel most loved through thoughtful actions and helping hands.'
    }
  },
  {
    id: 'gtk-3',
    category: 'Light',
    statementA: {
      id: 'Energiku terisi kembali dengan rebahan tenang di kamar seharian.',
      en: 'My energy recharges through a quiet day at home in bed.'
    },
    statementB: {
      id: 'Energiku terisi kembali dengan keluar rumah mencari suasana baru.',
      en: 'My energy recharges by exploring lively outdoors and new spots.'
    }
  },
  {
    id: 'gtk-4',
    category: 'Values',
    statementA: {
      id: 'Dalam mengambil keputusan besar, aku sangat mengandalkan analisis rasional.',
      en: 'In big life choices, I rely heavily on analytical logic.'
    },
    statementB: {
      id: 'Dalam mengambil keputusan besar, aku lebih percaya pada firasat dan intuisi hati.',
      en: 'In big life choices, I follow my gut instinct and emotional compass.'
    }
  },
  {
    id: 'gtk-5',
    category: 'Communication',
    statementA: {
      id: 'Aku lebih suka pasanganku bertanya dengan sabar sampai aku bercerita.',
      en: 'I appreciate my partner gently asking until I open up.'
    },
    statementB: {
      id: 'Aku lebih suka pasanganku memberi ruang dan menunggu inisiatifku.',
      en: 'I prefer my partner holding quiet space until I am ready to initiate.'
    }
  }
];

// -------------------------------------------------------------
// HOW WELL DO YOU KNOW ME (Multiple Choice Trivia & Insights)
// -------------------------------------------------------------

export const RAW_HOW_WELL: BilingualHowWell[] = [
  {
    id: 'hw-1',
    category: 'Light',
    question: {
      id: 'Saat sedang ingin bersantai di sore hari, camilan atau minuman apa yang paling aku sukai?',
      en: 'When unwinding in the late afternoon, what treat or drink do I reach for first?'
    },
    options: {
      id: [
        'A. Kopi susu manis atau latte dingin',
        'B. Teh buah segar atau jus dingin',
        'C. Camilan asin gurih yang renyah',
        'D. Cokelat hangat atau kue manis'
      ],
      en: [
        'A. Sweet iced latte or creamy coffee',
        'B. Fresh iced fruit tea or juice',
        'C. Crunchy savory snacks',
        'D. Hot cocoa or sweet pastries'
      ]
    }
  },
  {
    id: 'hw-2',
    category: 'Communication',
    question: {
      id: 'Apa yang paling cepat menguras baterai sosialku saat berada di keramaian?',
      en: 'What drains my social battery the fastest in large crowds?'
    },
    options: {
      id: [
        'A. Basa-basi panjang dengan orang yang belum akrab',
        'B. Suara musik yang terlalu bising dan ruangan sesak',
        'C. Merasa harus selalu tersenyum dan menjaga penampilan',
        'D. Berada di acara tanpa ada kamu di sampingku'
      ],
      en: [
        'A. Extended small talk with strangers',
        'B. Blaring loud music and stuffy rooms',
        'C. Pressure to constantly smile and entertain',
        'D. Being in the event without you nearby'
      ]
    }
  },
  {
    id: 'hw-3',
    category: 'Love',
    question: {
      id: 'Sikap kecil apa darimu yang paling ampuh memperbaiki suasana hatiku yang sedang murung?',
      en: 'What tiny gesture from you works best to lift my gloomy mood?'
    },
    options: {
      id: [
        'A. Mengirim pesan manis dan lelucon lucu di sela kesibukan',
        'B. Membelikan makanan favoritku tanpa perlu ditanya',
        'C. Memberikan pelukan erat dalam keheningan',
        'D. Mendengarkan seluruh ceritaku dengan tatapan fokus'
      ],
      en: [
        'A. Sweet texts and funny memes in the middle of the day',
        'B. Bringing my comfort food unexpectedly',
        'C. A long, silent grounding hug',
        'D. Listening attentively without checking your phone'
      ]
    }
  },
  {
    id: 'hw-4',
    category: 'Values',
    question: {
      id: 'Jika memiliki waktu luang penuh satu minggu tanpa beban kerja, apa impian terbesarku?',
      en: 'If given one full week free of work obligations, what is my biggest dream?'
    },
    options: {
      id: [
        'A. Road trip keliling tempat alam yang sejuk berdua bersamamu',
        'B. Tidur puas, membaca buku, dan maraton serial film di rumah',
        'C. Mengunjungi kota baru dan mencoba kuliner legendaris',
        'D. Menyelesaikan proyek hobi pribadi yang sudah lama tertunda'
      ],
      en: [
        'A. Scenic road trip through cool nature with you',
        'B. Deep rest, reading, and cozy show binges at home',
        'C. Exploring a brand new city and authentic food spots',
        'D. Focusing on a long-delayed personal passion project'
      ]
    }
  }
];

// -------------------------------------------------------------
// CHAOS MODE ("Who is More Likely?" & Chaotic Dilemmas)
// -------------------------------------------------------------

export const RAW_CHAOS: { id: string; prompt: { id: string; en: string } }[] = [
  {
    id: 'ch-1',
    prompt: {
      id: 'Siapa yang lebih gampang ngambek kalau lagi lapar atau kurang tidur?',
      en: 'Who gets hangry or cranky faster when sleep-deprived?'
    }
  },
  {
    id: 'ch-2',
    prompt: {
      id: 'Siapa yang lebih mungkin ngajak baikan duluan setelah terjadi pertengkaran?',
      en: 'Who is more likely to break the silence and initiate making up after an argument?'
    }
  },
  {
    id: 'ch-3',
    prompt: {
      id: 'Siapa yang bakal panik duluan kalau kita terjebak di lift yang macet selama 2 jam?',
      en: 'Who would panic first if we got stuck in an elevator for two hours?'
    }
  },
  {
    id: 'ch-4',
    prompt: {
      id: 'Siapa yang paling lama menentukan pilihan saat ditanya: "Mau makan apa hari ini?"',
      en: 'Who takes 20 minutes to answer: "What do you want to eat today?"'
    }
  },
  {
    id: 'ch-5',
    prompt: {
      id: 'Siapa yang paling sering salah kirim pesan ke grup keluarga padahal maksudnya ke pasangan?',
      en: 'Who is more prone to sending a private text into the wrong family group chat?'
    }
  },
  {
    id: 'ch-6',
    prompt: {
      id: 'Siapa yang lebih boros checkout belanjaan online saat tengah malam?',
      en: 'Who is more guilty of late-night impulse shopping on e-commerce?'
    }
  },
  {
    id: 'ch-7',
    prompt: {
      id: 'Siapa yang kalau packing liburan 2 hari tapi barang bawaannya seperti mau pindah rumah?',
      en: 'Who packs for a weekend trip as if moving abroad permanently?'
    }
  },
  {
    id: 'ch-8',
    prompt: {
      id: 'Siapa yang paling sering bilang "aku sudah otw" padahal baru masuk kamar mandi?',
      en: 'Who claims "I am on my way" while literally still choosing an outfit?'
    }
  },
  {
    id: 'ch-9',
    prompt: {
      id: 'Siapa yang paling gampang terharu sampai menitikkan air mata saat menonton film romantis?',
      en: 'Who sheds tears first during a touching movie scene?'
    }
  },
  {
    id: 'ch-10',
    prompt: {
      id: 'Siapa yang bisa tersesat di jalan raya meskipun aplikasi peta navigasi sudah menyala?',
      en: 'Who somehow gets lost even with navigation GPS running?'
    }
  }
];

// -------------------------------------------------------------
// TELL ME SOMETHING (Vulnerable Whispers & Honest Confessions)
// -------------------------------------------------------------

export const RAW_TELL_ME: { id: string; en: string }[] = [
  {
    id: 'Ceritakan satu hal tentang diriku yang awalnya membuatmu penasaran dan ingin mengenal lebih dekat.',
    en: 'Tell me one thing about me that initially sparked your curiosity and made you want to know more.'
  },
  {
    id: 'Beri tahu aku sebuah kekhawatiran kecil tentang masa depan yang belakangan ini sering melintas di benakmu.',
    en: 'Share a quiet worry about the future that has been lingering on your mind lately.'
  },
  {
    id: 'Ungkapkan satu kebaikan atau pengorbanan dariku yang belum sempat kamu ucapkan terima kasih secara langsung.',
    en: 'Tell me about a sacrifice or kindness of mine you never got the chance to properly thank me for.'
  },
  {
    id: 'Ceritakan momen di mana kamu merasa paling bangga berdiri di sampingku sebagai pasangan.',
    en: 'Share a moment where you felt deeply proud to stand beside me as my partner.'
  },
  {
    id: 'Beri tahu aku satu kalimat penenang yang paling ingin kamu dengar saat harimu sedang sangat berat.',
    en: 'Tell me the exact soothing words you most wish to hear when your world feels heavy.'
  },
  {
    id: 'Ceritakan satu mimpi rahasia masa kecilmu yang masih kamu simpan hingga hari ini.',
    en: 'Share a secret childhood dream that you still hold softly in your heart.'
  }
];

// -------------------------------------------------------------
// WISHES & HOPES (Future Visions & Intentional Promises)
// -------------------------------------------------------------

export const RAW_WISHES: { id: string; prompt: { id: string; en: string }; subtext: { id: string; en: string } }[] = [
  {
    id: 'w-1',
    prompt: {
      id: 'Seperti apa rutinitas pagi hari yang kamu impikan saat kita sudah tinggal satu atap nanti?',
      en: 'What kind of morning routine do you envision when we share a home together?'
    },
    subtext: {
      id: 'Aroma seduhan kopi, sarapan santai tanpa tergesa, atau berbagi cerita singkat sebelum beraktivitas.',
      en: 'Brewing coffee, quiet breakfast, or sharing thoughts before the day begins.'
    }
  },
  {
    id: 'w-2',
    prompt: {
      id: 'Tradisi mingguan istimewa apa yang ingin kita buat khusus hanya untuk kita berdua?',
      en: 'What special weekly tradition do you want to create exclusively for the two of us?'
    },
    subtext: {
      id: 'Malam memasak bersama tiap Jumat, jalan sore tanpa gawai di akhir pekan, atau sesi baca buku bersama.',
      en: 'Friday cooking dates, screen-free weekend walks, or shared reading nights.'
    }
  },
  {
    id: 'w-3',
    prompt: {
      id: 'Destinasi atau pengalaman petualangan apa yang paling ingin kamu wujudkan bersamaku sebelum usia kita bertambah 5 tahun?',
      en: 'What dream adventure do you most wish to experience with me within the next 5 years?'
    },
    subtext: {
      id: 'Menyaksikan matahari terbit di puncak gunung, menjelajah kota tua di luar negeri, atau berkemah di tepi danau.',
      en: 'Watching sunrise on a mountain, exploring historic towns, or lakeside camping.'
    }
  },
  {
    id: 'w-4',
    prompt: {
      id: 'Kualitas atau kehangatan apa dalam hubungan kita saat ini yang kamu harap tidak akan pernah pudar selamanya?',
      en: 'What warmth or quality in our current bond do you pray will never fade away?'
    },
    subtext: {
      id: 'Rasa saling percaya, tawa lepas saat berdua, atau kesediaan untuk selalu mendengarkan.',
      en: 'Unconditional trust, silly laughter, or willingness to listen deeply.'
    }
  }
];

// -------------------------------------------------------------
// DAILY DROP (Spark of the Day)
// -------------------------------------------------------------

export const RAW_DAILY: { id: string; en: string }[] = [
  {
    id: 'Hal kecil apa yang terjadi hari ini yang secara spontan membuatmu langsung teringat padaku?',
    en: 'What little thing happened today that spontaneously made you think of me?'
  },
  {
    id: 'Momen apa yang paling membuatmu tersenyum atau tertawa lepas di tengah kesibukanmu seharian ini?',
    en: 'What moment brought the brightest smile or laugh to your face throughout today?'
  },
  {
    id: 'Jika kamu bisa menitipkan satu rasa lelahmu hari ini kepadaku untuk kuringankan, beban apa itu?',
    en: 'If you could hand over one piece of today’s fatigue for me to hold, what would it be?'
  },
  {
    id: 'Camilan atau obrolan santai seperti apa yang paling kamu nantikan untuk kita nikmati bersama malam ini?',
    en: 'What treat or cozy topic are you looking forward to sharing tonight?'
  },
  {
    id: 'Satu hal apa dari caraku memperlakukanmu belakangan ini yang membuat hatimu merasa tenang?',
    en: 'What recent gesture of mine brought a feeling of gentle calm to your heart?'
  }
];

// -------------------------------------------------------------
// ADVANCED ANTI-REPETITION & MULTI-ARCHETYPE ENGINE
// -------------------------------------------------------------

// Comprehensive Topic Vectors & Archetypes (Guarantees multi-angle non-repetition)
export type QuestionArchetype =
  | 'what_if'
  | 'nostalgia_memory'
  | 'couple_dynamic'
  | 'daily_habit'
  | 'emotional_safety'
  | 'perspective_shift'
  | 'bucket_list'
  | 'conflict_craft'
  | 'inside_joke'
  | 'appreciation_nuance';

interface ArchetypeTemplate {
  archetype: QuestionArchetype;
  category: QuestionCategory;
  depth: ConversationDepth;
  structures: {
    id: (subject: string, detail: string) => string;
    en: (subject: string, detail: string) => string;
  };
  subtexts: {
    id: string;
    en: string;
  };
  topics: {
    subjectId: string;
    subjectEn: string;
    detailId: string;
    detailEn: string;
  }[];
}

const PROCEDURAL_ARCHETYPES: ArchetypeTemplate[] = [
  // 1. What-If & Hypothetical Scenarios
  {
    archetype: 'what_if',
    category: 'Deep Talk',
    depth: 'fun',
    structures: {
      id: (sub, det) => `Kalau ${sub}, kamu bakal pilih ${det}?`,
      en: (sub, det) => `If ${sub}, would you choose ${det}?`
    },
    subtexts: {
      id: 'Ceritakan alasan spontanmu tanpa ragu.',
      en: 'Share your immediate reasoning without overthinking.'
    },
    topics: [
      {
        subjectId: 'kita terdampar di sebuah pulau terpencil selama seminggu',
        subjectEn: 'we were stranded on a peaceful desert island for a week',
        detailId: 'fokus bikin tempat berteduh estetik atau berburu makanan lezat',
        detailEn: 'building an aesthetic bamboo shelter or hunting for delicious coconuts'
      },
      {
        subjectId: 'kita punya mesin waktu yang cuma bisa dipakai satu kali',
        subjectEn: 'we had a time machine that could only be used once',
        detailId: 'ngintip kehidupan kita 20 tahun ke depan atau mengunjungi momen pertama kita bertemu',
        detailEn: 'peeking 20 years into our future or revisiting the first hour we met'
      },
      {
        subjectId: 'kita bisa bertukar kepribadian selama 24 jam',
        subjectEn: 'we swapped bodies and personalities for 24 hours',
        detailId: 'hal pertama apa yang bakal kamu lakukan dengan tubuh dan kebiasaanku',
        detailEn: 'what is the first habit or task you would attempt in my shoes'
      },
      {
        subjectId: 'kita diizinkan merancang satu peraturan kencan mutlak tanpa bantahan',
        subjectEn: 'we could establish one unbreakable couple tradition',
        detailId: 'aturan manis apa yang ingin kamu tetapkan untuk kita berdua',
        detailEn: 'what sweet rule would you strictly enforce for us'
      }
    ]
  },

  // 2. Nostalgia & Specific Memories
  {
    archetype: 'nostalgia_memory',
    category: 'Love',
    depth: 'personal',
    structures: {
      id: (sub, det) => `Momen pas ${sub}, apa yang paling berkesan tentang ${det}?`,
      en: (sub, det) => `During the time ${sub}, what stood out most regarding ${det}?`
    },
    subtexts: {
      id: 'Detail kecil yang mungkin belum pernah terucap.',
      en: 'Small nuances you might not have spoken out loud.'
    },
    topics: [
      {
        subjectId: 'pertama kali kita ngobrol berdua sampai larut malam',
        subjectEn: 'we first talked until the early morning hours',
        detailId: 'topik apa yang bikin kamu sadar obrolan kita mengalir begitu alami',
        detailEn: 'which topic made you realize our conversation felt effortless'
      },
      {
        subjectId: 'kita pertama kali saling melihat saat berdandan rapi untuk kencan',
        subjectEn: 'we first saw each other dressed up for a special date',
        detailId: 'kesan pertama apa yang langsung terlintas di pikiranmu saat itu',
        detailEn: 'what exact thought flashed across your mind back then'
      },
      {
        subjectId: 'kita menghadapi situasi canggung atau rencana kencan yang berantakan',
        subjectEn: 'our plans went completely off track on a past outing',
        detailId: 'sikap apa yang akhirnya membuat situasi itu berubah jadi kenangan lucu',
        detailEn: 'how did we turn that mishap into a warm inside memory'
      },
      {
        subjectId: 'salah satu dari kita sedang sakit atau kurang enak badan',
        subjectEn: 'one of us was feeling under the weather',
        detailId: 'perhatian kecil apa yang membuat hatimu merasa begitu dijaga',
        detailEn: 'what caring gesture made you feel profoundly looked after'
      }
    ]
  },

  // 3. Couple Dynamics & Perspective Shifts
  {
    archetype: 'couple_dynamic',
    category: 'Deep Talk',
    depth: 'personal',
    structures: {
      id: (sub, det) => `Di antara kita berdua, dalam hal ${sub}, menurutmu siapa yang lebih ${det}?`,
      en: (sub, det) => `Between the two of us, regarding ${sub}, who tends to be more ${det}?`
    },
    subtexts: {
      id: 'Jujur dengan sentuhan tawa dan kasih sayang.',
      en: 'Be candid with a loving and playful tone.'
    },
    topics: [
      {
        subjectId: 'mengambil inisiatif saat ada masalah mendadak',
        subjectEn: 'taking initiative when an unforeseen hurdle pops up',
        detailId: 'cepat berpikir praktis dan tenang menenangkan suasana',
        detailEn: 'quick to think practically while keeping composure'
      },
      {
        subjectId: 'mengingat tanggal penting atau janji kecil',
        subjectEn: 'remembering meaningful milestones and quiet promises',
        detailId: 'detail dan teliti menyiapkan kejutan manis',
        detailEn: 'attentive and meticulous in preparing surprises'
      },
      {
        subjectId: 'menghadapi perbedaan selera makanan atau film',
        subjectEn: 'reconciling different tastes in food or movies',
        detailId: 'fleksibel dan senang mengalah demi kebahagiaan pasangan',
        detailEn: 'flexible and happy to compromise for the other’s joy'
      },
      {
        subjectId: 'mengekspresikan rasa rindu saat terpisah jarak',
        subjectEn: 'expressing affection during busy separated hours',
        detailId: 'spontan mengirim kabar manis tanpa jeda',
        detailEn: 'spontaneous with heartwarming check-ins'
      }
    ]
  },

  // 4. Daily Habits & Unseen Quirks
  {
    archetype: 'daily_habit',
    category: 'Light',
    depth: 'light',
    structures: {
      id: (sub, det) => `Saat ${sub}, kebiasaan unik apa dari ${det}?`,
      en: (sub, det) => `When ${sub}, what unique quirk of ${det}?`
    },
    subtexts: {
      id: 'Kebiasaan menggemaskan yang sering tidak disadari.',
      en: 'Endearing quirks that often happen on autopilot.'
    },
    topics: [
      {
        subjectId: 'lagi fokus ngerjain sesuatu atau belajar',
        subjectEn: 'deeply focused on working or studying',
        detailId: 'ekspresi wajah atau gerakan tubuhku yang paling khas',
        detailEn: 'my facial expressions or posture that stand out most'
      },
      {
        subjectId: 'sedang menikmati makanan yang rasanya luar biasa enak',
        subjectEn: 'savoring a meal that tastes exceptionally good',
        detailId: 'reaksi spontan yang selalu membuatmu ikut tersenyum',
        detailEn: 'the spontaneous reaction that always makes you grin'
      },
      {
        subjectId: 'baru bangun tidur di pagi hari sebelum mencuci muka',
        subjectEn: 'waking up in the morning before caffeine kicks in',
        detailId: 'gaya bicara atau respon lucu yang paling kamu hafal',
        detailEn: 'the funny morning voice or reflexes you know by heart'
      }
    ]
  },

  // 5. Emotional Safety & Gentle Deep Reflections
  {
    archetype: 'emotional_safety',
    category: 'Deep Talk',
    depth: 'deep',
    structures: {
      id: (sub, det) => `Dalam hal ${sub}, bagaimana caraku agar bisa ${det}?`,
      en: (sub, det) => `Regarding ${sub}, in what ways can I best ${det}?`
    },
    subtexts: {
      id: 'Ruang aman untuk saling memahami tanpa penghakiman.',
      en: 'A safe haven to understand each other without judgment.'
    },
    topics: [
      {
        subjectId: 'memberikan ruang saat kamu sedang merasa lelah secara mental',
        subjectEn: 'giving space when your emotional battery is depleted',
        detailId: 'menjadi sandaran yang tenang tanpa menambah tekanan',
        detailEn: 'act as a steady anchor without adding any pressure'
      },
      {
        subjectId: 'merayakan setiap pencapaian kecil dalam hidupmu',
        subjectEn: 'celebrating your small daily milestones and victories',
        detailId: 'membuatmu merasa benar-benar dihargai dan dibanggakan',
        detailEn: 'make you feel genuinely cherished and championed'
      },
      {
        subjectId: 'membangun rasa percaya yang semakin kokoh setiap hari',
        subjectEn: 'deepening our bedrock of trust with every passing month',
        detailId: 'menjaga keterbukaan hati dalam setiap keputusan',
        detailEn: 'protect honesty and transparency in every decision'
      }
    ]
  }
];

// Anti-Repetition Registry for current session
const sessionHistory = new Set<string>();

export function registerQuestionHistory(id: string) {
  sessionHistory.add(id);
}

export function clearQuestionHistory() {
  sessionHistory.clear();
}

export function isQuestionInSession(id: string): boolean {
  return sessionHistory.has(id);
}

// -------------------------------------------------------------
// GENERATOR ENGINE WITH STRICT ANTI-REPETITION & TOPIC ROTATION
// -------------------------------------------------------------

export function generateDynamicQuestion(
  category: QuestionCategory = 'Deep Talk',
  depth: ConversationDepth = 'personal',
  seedIndex: number = 0,
  lang: Language = 'id',
  p1Name = 'Kamu',
  p2Name = 'Pasangan'
): BaseQuestion {
  const depthLabels: Record<ConversationDepth, { id: string; en: string }> = {
    light: { id: '🌱 Santai', en: '🌱 Light & easy' },
    fun: { id: '😄 Seru & tawa', en: '😄 Fun & playful' },
    personal: { id: '💭 Personal & jujur', en: '💭 Personal & open' },
    deep: { id: '🌙 Mendalam', en: '🌙 Deep & vulnerable' }
  };

  // Find matching templates from archetype matrix
  const relevantArchetypes = PROCEDURAL_ARCHETYPES.filter(
    (a) => a.category === category || category === 'Deep Talk'
  );

  const archetype = relevantArchetypes[seedIndex % relevantArchetypes.length] || PROCEDURAL_ARCHETYPES[0];
  const topic = archetype.topics[Math.floor(seedIndex / relevantArchetypes.length) % archetype.topics.length] || archetype.topics[0];

  const textId = archetype.structures.id(topic.subjectId, topic.detailId);
  const textEn = archetype.structures.en(topic.subjectEn, topic.detailEn);

  return {
    id: `dyn-q-${archetype.archetype}-${seedIndex}`,
    category: archetype.category,
    difficulty: depthLabels[archetype.depth][lang] || depthLabels[archetype.depth].id,
    text: lang === 'id' ? textId : textEn,
    subtext: archetype.subtexts[lang] || archetype.subtexts.id
  };
}

// Dynamic Non-Repetitive Getter for Deep Talk & Base Questions
export function getNextBaseQuestion(
  category: QuestionCategory = 'Deep Talk',
  depth: ConversationDepth = 'personal',
  seenIds: string[] = [],
  lang: Language = 'id',
  p1Name = 'Kamu',
  p2Name = 'Pasangan'
): BaseQuestion {
  // 1. Check curated seed pool
  const curated = RAW_BASE_QUESTIONS.filter((q) => {
    if (category === 'Deep Talk') return true;
    return q.category === category;
  });

  const unseenCurated = curated.filter(
    (q) => !seenIds.includes(q.id) && !sessionHistory.has(q.id) && !isQuestionSeen(category.toLowerCase().replace(/\s+/g, '-'), q.id, q.text[lang] || q.text.id)
  );

  if (unseenCurated.length > 0) {
    const pick = unseenCurated[0];
    sessionHistory.add(pick.id);
    markQuestionSeen(category.toLowerCase().replace(/\s+/g, '-'), pick.id, pick.text[lang] || pick.text.id);
    return {
      id: pick.id,
      category: pick.category,
      difficulty: pick.difficulty[lang] || pick.difficulty.id,
      text: pick.text[lang] || pick.text.id,
      subtext: pick.subtext ? (pick.subtext[lang] || pick.subtext.id) : undefined
    };
  }

  // 2. Generate from unlimited procedural combinatorial engine
  if (category === 'Deep Talk') {
    const q = generateUnlimitedDeepTalk(sessionHistory, lang, p1Name, p2Name);
    sessionHistory.add(q.id);
    markQuestionSeen('deep-talk', q.id, q.text);
    return q;
  }

  // Fallback to dynamic matrix
  let offset = seenIds.length + Math.floor(Math.random() * 100);
  let candidate = generateDynamicQuestion(category, depth, offset, lang, p1Name, p2Name);
  let attempts = 0;
  while ((sessionHistory.has(candidate.id) || isQuestionSeen(category.toLowerCase().replace(/\s+/g, '-'), candidate.id, candidate.text)) && attempts < 30) {
    offset += 7;
    attempts++;
    candidate = generateDynamicQuestion(category, depth, offset, lang, p1Name, p2Name);
  }

  sessionHistory.add(candidate.id);
  markQuestionSeen(category.toLowerCase().replace(/\s+/g, '-'), candidate.id, candidate.text);
  return candidate;
}

// Dynamic Non-Repetitive This or That Generator
export function generateDynamicThisOrThat(seed: number, lang: Language = 'id'): ThisOrThatItem {
  const item = generateUnlimitedThisOrThat(sessionHistory, lang);
  sessionHistory.add(item.id);
  markQuestionSeen('this-or-that', item.id, item.optionA.label);
  return item;
}

// Dynamic Non-Repetitive Chaos Mode Generator
export function generateDynamicChaos(seed: number, lang: Language = 'id'): ChaosItem {
  const item = generateUnlimitedChaos(sessionHistory, lang);
  sessionHistory.add(item.id);
  markQuestionSeen('chaos-mode', item.id, item.prompt);
  return item;
}

// Dynamic Non-Repetitive How Well Do You Know Me Generator
export function generateDynamicHowWell(seed: number, lang: Language = 'id'): HowWellItem {
  const item = generateUnlimitedHowWell(sessionHistory, lang);
  sessionHistory.add(item.id);
  markQuestionSeen('how-well', item.id, item.question);
  return item;
}

// Dynamic Get To Know Generator
export function generateDynamicGetToKnow(seed: number, lang: Language = 'id'): GetToKnowItem {
  const item = generateUnlimitedGetToKnow(sessionHistory, lang);
  sessionHistory.add(item.id);
  markQuestionSeen('get-to-know', item.id, item.statementA);
  return item;
}

// Dynamic Wishes Generator
export function generateDynamicWishes(seed: number, lang: Language = 'id', p1 = 'Kita', p2 = 'Pasangan') {
  const item = generateUnlimitedWishes(sessionHistory, lang, p1, p2);
  sessionHistory.add(item.id);
  markQuestionSeen('wishes', item.id, item.prompt);
  return item;
}

// Dynamic Tell Me Something Generator
export function generateDynamicTellMe(seed: number, lang: Language = 'id'): string {
  const text = generateUnlimitedTellMe(sessionHistory, lang);
  const id = `tell-dyn-${Date.now()}`;
  sessionHistory.add(id);
  markQuestionSeen('tell-me-something', id, text);
  return text;
}

// Dynamic Daily Drop Generator
export function generateDynamicDaily(seed: number, lang: Language = 'id'): string {
  const dailyOptions = [
    {
      id: 'Hal kecil apa hari ini yang bikin kamu pengen buru-buru cerita ke aku?',
      en: 'What little thing today made you want to rush and share it with me?'
    },
    {
      id: 'Bagian mana dari harimu yang paling membutuhkan suntikan semangat atau pelukan hangat?',
      en: 'Which part of your day needed a little extra boost of encouragement or a warm hug?'
    },
    {
      id: 'Kapan saat paling tenang dan melegakan yang kamu rasakan hari ini?',
      en: 'When was the most peaceful and restful moment you felt throughout today?'
    },
    {
      id: 'Kalau kamu bisa merangkum perasaanmu hari ini dalam satu kata, kata apa yang kamu pilih?',
      en: 'If you could sum up your mood today in a single word, what word would it be?'
    },
    {
      id: 'Apa satu hal yang bisa aku bantu untuk membuat malammu terasa lebih rileks?',
      en: 'What is one thing I can do to make your evening feel more relaxed and peaceful?'
    }
  ];

  const pick = dailyOptions[Math.floor(Math.random() * dailyOptions.length)];
  return pick[lang] || pick.id;
}

// -------------------------------------------------------------
// GETTER HELPERS (Mapped to active language)
// -------------------------------------------------------------

export const getThisOrThatItems = (lang: Language = 'id'): ThisOrThatItem[] => {
  return RAW_THIS_OR_THAT.map((item) => ({
    id: item.id,
    category: item.category,
    optionA: {
      label: item.optionA.label[lang] || item.optionA.label.id,
      icon: item.optionA.icon
    },
    optionB: {
      label: item.optionB.label[lang] || item.optionB.label.id,
      icon: item.optionB.icon
    },
    followUp: item.followUp[lang] || item.followUp.id
  }));
};

export const THIS_OR_THAT_ITEMS = getThisOrThatItems('id');

export const getGetToKnowItems = (lang: Language = 'id'): GetToKnowItem[] => {
  return RAW_GET_TO_KNOW.map((item) => ({
    id: item.id,
    category: item.category,
    statementA: item.statementA[lang] || item.statementA.id,
    statementB: item.statementB[lang] || item.statementB.id
  }));
};

export const GET_TO_KNOW_ITEMS = getGetToKnowItems('id');

export const getHowWellItems = (lang: Language = 'id'): HowWellItem[] => {
  return RAW_HOW_WELL.map((item) => ({
    id: item.id,
    category: item.category,
    question: item.question[lang] || item.question.id,
    options: item.options[lang] || item.options.id
  }));
};

export const HOW_WELL_ITEMS = getHowWellItems('id');

export const getChaosItems = (lang: Language = 'id'): ChaosItem[] => {
  return RAW_CHAOS.map((item) => ({
    id: item.id,
    prompt: item.prompt[lang] || item.prompt.id
  }));
};

export const CHAOS_ITEMS = getChaosItems('id');

export const getTellMePrompts = (lang: Language = 'id'): string[] => {
  return RAW_TELL_ME.map((item) => item[lang] || item.id);
};

export const TELL_ME_SOMETHING_PROMPTS = getTellMePrompts('id');

export const getWishesItems = (lang: Language = 'id') => {
  return RAW_WISHES.map((item) => ({
    id: item.id,
    prompt: item.prompt[lang] || item.prompt.id,
    subtext: item.subtext[lang] || item.subtext.id
  }));
};

export const WISHES_ITEMS = getWishesItems('id');

export const getDailyQuestions = (lang: Language = 'id'): string[] => {
  return RAW_DAILY.map((item) => item[lang] || item.id);
};

export const DAILY_QUESTIONS = getDailyQuestions('id');

export const getBaseQuestions = (lang: Language = 'id'): BaseQuestion[] => {
  return RAW_BASE_QUESTIONS.map((item) => ({
    id: item.id,
    category: item.category,
    difficulty: item.difficulty[lang] || item.difficulty.id,
    text: item.text[lang] || item.text.id,
    subtext: item.subtext ? (item.subtext[lang] || item.subtext.id) : undefined
  }));
};

export const BASE_QUESTIONS_LIBRARY = getBaseQuestions('id');
