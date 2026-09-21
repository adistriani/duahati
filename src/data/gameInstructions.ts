import { GameModeId } from '../types';

export interface InstructionStep {
  number: number;
  title: { id: string; en: string };
  desc: (p1: string, p2: string, lang: 'id' | 'en') => string;
}

export interface GameInstruction {
  id: GameModeId;
  title: { id: string; en: string };
  tagline: { id: string; en: string };
  emoji: string;
  badge: { id: string; en: string };
  steps: InstructionStep[];
  tip: { id: string; en: string };
}

export const GAME_INSTRUCTIONS: Record<string, GameInstruction> = {
  'chaos': {
    id: 'chaos',
    title: { id: 'Chaos mode', en: 'Chaos mode' },
    tagline: {
      id: 'Saling tunjuk dan ketawa bareng melihat kebiasaan konyol kalian',
      en: 'Playful prompts to giggle and point fingers at each other'
    },
    emoji: '😂',
    badge: { id: 'Lucu-lucuan', en: 'Playful fun' },
    steps: [
      {
        number: 1,
        title: { id: 'Baca pertanyaannya bareng', en: 'Read the prompt together' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Lihat situasi di kartu, kira-kira siapa nih yang paling relate?`
            : `Read the prompt together and see who relates to it most!`
      },
      {
        number: 2,
        title: { id: 'Hitung 1, 2, 3... langsung tunjuk!', en: 'Count to 3 and point!' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Tunjuk siapa di antara kalian (${p1} atau ${p2}) yang paling sering ngelakuin hal itu.`
            : `Point at who between the two of you (${p1} or ${p2}) is most guilty of this!`
      },
      {
        number: 3,
        title: { id: 'Ceritain alasannya sambil ketawa', en: 'Laugh and share why' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Jelasin momen lucunya. Jangan baper ya, ini murni buat seru-seruan bareng!`
            : `Laugh it out, share the hilarious reason why you picked them, then draw the next card!`
      }
    ],
    tip: {
      id: 'Kuncinya ketawa bareng! Momen kayak gini asik banget buat ngetawain hal-hal random kita berdua.',
      en: 'Keep it lighthearted! This is the perfect moment to giggle at your funny habits together.'
    }
  },
  'deep-talk': {
    id: 'deep-talk',
    title: { id: 'Deep talk', en: 'Deep talk' },
    tagline: {
      id: 'Ngobrol lebih dalam tentang apa yang lagi kalian rasa dan pikirkan',
      en: 'Heart-to-heart talks to understand each other even more'
    },
    emoji: '💬',
    badge: { id: 'Dari hati ke hati', en: 'Heart to heart' },
    steps: [
      {
        number: 1,
        title: { id: 'Cari posisi duduk yang nyaman', en: 'Find a comfy spot' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Taruh dulu HP sebentar, cari tempat tenang biar bisa fokus ngobrol berdua.`
            : `Sit comfortably in a calm setting without any digital distractions.`
      },
      {
        number: 2,
        title: { id: 'Bacain kartunya pelan-pelan', en: 'Read the card slowly' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Satu orang bacain pertanyaannya, lalu jawab bergantian dari hati.`
            : `One of you reads the prompt aloud, then take turns sharing your truth.`
      },
      {
        number: 3,
        title: { id: 'Dengerin sampai selesai', en: 'Listen without rushing' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Dengerin cerita pasangan tanpa dipotong, nikmati obrolan jujur kalian.`
            : `Listen attentively without interrupting, and appreciate each other's openness.`
      }
    ],
    tip: {
      id: 'Nggak ada jawaban benar atau salah. Cerita apa adanya aja, yang penting saling mengerti.',
      en: 'There are no wrong answers. Honest vulnerability and kindness are what truly matter.'
    }
  },
  'this-or-that': {
    id: 'this-or-that',
    title: { id: 'This or that', en: 'This or that' },
    tagline: {
      id: 'Pilih cepat antara 2 opsi buat lihat seberapa sefrekuensi kalian',
      en: 'Quick 1-2-3 picks to see how your tastes match'
    },
    emoji: '⚡',
    badge: { id: 'Pilihan cepat', en: 'Quick pick' },
    steps: [
      {
        number: 1,
        title: { id: 'Lihat 2 pilihannya', en: 'Look at the 2 choices' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Misal: kopi vs teh, atau liburan ke pantai vs ke gunung.`
            : `Check out the two options displayed on the card.`
      },
      {
        number: 2,
        title: { id: 'Jawab barengan di hitungan ketiga', en: 'Answer together on 3' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `1, 2, 3... langsung sebut pilihan favorit kalian tanpa mikir lama!`
            : `Count 1, 2, 3 together and tap your favorite option at the exact same moment!`
      },
      {
        number: 3,
        title: { id: 'Bandingin hasilnya', en: 'Compare your picks' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Sama atau beda? Kalau beda selera, justru di situ serunya diobrolin.`
            : `See if your tastes match or contrast, and talk about why you picked what you did.`
      }
    ],
    tip: {
      id: 'Jangan kelamaan mikir, langsung pilih apa yang pertama kali kepikiran!',
      en: 'Don’t overthink it, spontaneous picks lead to the best laughs and stories!'
    }
  },
  'how-well': {
    id: 'how-well',
    title: { id: 'Seberapa paham kamu?', en: 'How well do you know me?' },
    tagline: {
      id: 'Tebak kebiasaan dan isi pikiran pasanganmu',
      en: 'Guess your partner’s little quirks and habits'
    },
    emoji: '🎯',
    badge: { id: 'Tebak pasangan', en: 'Guess partner' },
    steps: [
      {
        number: 1,
        title: { id: 'Satu orang pilih diam-diam', en: 'One chooses secretly' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Salah satu di antara ${p1} atau ${p2} memilih opsi yang paling menggambarkan dirinya.`
            : `Either ${p1} or ${p2} secretly chooses the option that best reflects them.`
      },
      {
        number: 2,
        title: { id: 'Pasangan coba tebak', en: 'Partner makes a guess' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Giliran pasangan nebak: "Kira-kira dia tadi milih yang mana ya?"`
            : `The partner tries to guess which choice was picked.`
      },
      {
        number: 3,
        title: { id: 'Buka hasilnya bareng', en: 'Reveal and compare' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Cocokin tebakannya. Kalau bener keren, kalau salah jadi tahu fakta baru!`
            : `Reveal the answer together to see if your intuition was spot on!`
      }
    ],
    tip: {
      id: 'Kalau tebakannya meleset jangan ngambek ya, anggap aja nambah wawasan baru tentang si doi.',
      en: 'If you guess wrong, no worries—it is an opportunity to learn something fresh!'
    }
  },
  'tell-me': {
    id: 'tell-me',
    title: { id: 'Katakan sesuatu padaku', en: 'Tell me something' },
    tagline: {
      id: 'Waktu yang pas buat ngungkapin hal-hal manis yang jarang terucap',
      en: 'A warm space to share sweet thoughts you rarely say out loud'
    },
    emoji: '💌',
    badge: { id: 'Ungkapan tulus', en: 'Heartfelt words' },
    steps: [
      {
        number: 1,
        title: { id: 'Baca kalimat pembukanya', en: 'Read the sentence starter' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Lihat kalimat di kartu yang bakal jadi awal cerita manis kalian.`
            : `Read the prompt starter on the card.`
      },
      {
        number: 2,
        title: { id: 'Lanjutin kalimatnya dari hati', en: 'Finish the sentence sincerely' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Sampaikan kelanjutan kalimat itu secara tulus dan jujur ke pasanganmu.`
            : `Speak or type the continuation of the sentence honestly to your partner.`
      },
      {
        number: 3,
        title: { id: 'Kasih senyum atau pelukan hangat', en: 'Give a smile or a hug' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Dengerin kata-katanya dengan rasa syukur dan hangatkan suasana.`
            : `Take in your partner’s words with gratitude, and celebrate each other with warmth.`
      }
    ],
    tip: {
      id: 'Hal sederhana yang diucapin tulus sering kali maknanya nempel lama banget di hati.',
      en: 'Genuine, tender words have the power to instantly rekindle intimacy.'
    }
  },
  'love-us': {
    id: 'love-us',
    title: { id: 'Cinta & kita', en: 'Love & us' },
    tagline: {
      id: 'Nostalgia momen manis dan awal mula kalian saling jatuh cinta',
      en: 'Reminisce about sweet memories and why you fell in love'
    },
    emoji: '💖',
    badge: { id: 'Romantis', en: 'Romance' },
    steps: [
      {
        number: 1,
        title: { id: 'Buka kartu cerita kalian', en: 'Draw a love story card' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Baca pertanyaan tentang awal ketemu, hal lucu, atau momen yang bikin jatuh cinta.`
            : `Read the prompt revolving around memories, gratitude, and romance.`
      },
      {
        number: 2,
        title: { id: 'Ceritain gantian', en: 'Take turns sharing' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Ingat-ingat lagi momen manis yang udah pernah kalian lewatin bareng.`
            : `Take turns reminiscing about special milestones and unspoken feelings.`
      },
      {
        number: 3,
        title: { id: 'Rasain hangatnya kenangan berdua', en: 'Feel the warmth together' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Bikin kalian ingat lagi alasan kenapa kalian milih buat bersama sampai sekarang.`
            : `Celebrate your unique story and how much your bond has grown.`
      }
    ],
    tip: {
      id: 'Nostalgia bareng selalu ampuh buat bikin hati berbunga-bunga lagi.',
      en: 'Remembering the early days of falling in love always brings butterflies back.'
    }
  },
  'get-to-know': {
    id: 'get-to-know',
    title: { id: 'Kenali diriku', en: 'Get to know me' },
    tagline: {
      id: 'Cari tahu kebiasaan unik dan sudut pandang pasanganmu',
      en: 'Discover personal quirks and everyday perspectives'
    },
    emoji: '🌸',
    badge: { id: 'Karakter & kebiasaan', en: 'Habits & traits' },
    steps: [
      {
        number: 1,
        title: { id: 'Baca pilihan karakternya', en: 'Read the personality choices' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Pilih mana yang paling menggambarkan kebiasaan atau sifatmu sehari-hari.`
            : `Read the options and choose which trait best mirrors your daily self.`
      },
      {
        number: 2,
        title: { id: 'Ceritain kebiasaan unikmu', en: 'Share your everyday quirks' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Jelasin kenapa kamu seperti itu, dan tanya apa pasangan udah tahu dari dulu.`
            : `Explain why you behave this way, and see if your partner already noticed this habit.`
      },
      {
        number: 3,
        title: { id: 'Temukan hal baru yang seru', en: 'Find fun new details' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Bikin kalian makin kenal lebih dekat dan makin memahami satu sama lain.`
            : `Appreciate the differences and discover delightful new commonalities.`
      }
    ],
    tip: {
      id: 'Tiap orang terus bertumbuh. Selalu ada sisi baru pasangan yang menarik buat dipahami.',
      en: 'People evolve constantly. There is always something new and wonderful to learn.'
    }
  },
  'wishes': {
    id: 'wishes',
    title: { id: 'Masa depan berdua', en: 'Wishes & future' },
    tagline: {
      id: 'Ngobrol santai tentang impian dan rencana seru ke depan',
      en: 'Dream and align your hopes and exciting future plans'
    },
    emoji: '🌙',
    badge: { id: 'Masa depan', en: 'Future dreams' },
    steps: [
      {
        number: 1,
        title: { id: 'Bayangin masa depan bareng', en: 'Picture the future together' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Baca pertanyaan seputar rencana liburan, rumah impian, atau cita-cita berdua.`
            : `Read the card about dreams, adventures, home life, or future hopes.`
      },
      {
        number: 2,
        title: { id: 'Ceritain apa yang kamu impikan', en: 'Share what you envision' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Bagikan hal-hal seru yang pengin banget kamu wujudkan bareng dia.`
            : `Share what you look forward to most in your journey together.`
      },
      {
        number: 3,
        title: { id: 'Satukan impian kalian', en: 'Unite your dreams' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Saling dukung mimpi masing-masing biar bisa jalan bareng ke tujuan yang sama.`
            : `Support each other’s aspirations and co-create a vision you both cherish.`
      }
    ],
    tip: {
      id: 'Mimpi besar itu seru kalau diobrolin dan diperjuangin bareng orang tersayang.',
      en: 'Big dreams are wonderful when shared and nurtured hand-in-hand.'
    }
  },
  'daily-drop': {
    id: 'daily-drop',
    title: { id: 'Obrolan harian', en: 'Daily drop' },
    tagline: {
      id: 'Cukup 2 menit sehari buat tetap saling dekat dan terhubung',
      en: 'Just 2 minutes a day to stay close and connected'
    },
    emoji: '☀️',
    badge: { id: 'Harian 2 menit', en: 'Daily 2-min' },
    steps: [
      {
        number: 1,
        title: { id: 'Luangkan waktu 2 menit', en: 'Take 2 quiet minutes' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Bisa pas sarapan, sebelum tidur, atau pas lagi santai sore.`
            : `Sit together over coffee, before sleep, or during an evening break.`
      },
      {
        number: 2,
        title: { id: 'Jawab pertanyaan hari ini', en: 'Answer today’s question' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Buka kartu hari ini, lalu obrolin santai berdua tanpa beban.`
            : `Draw today’s card and answer casually without any pressure.`
      },
      {
        number: 3,
        title: { id: 'Jadikan rutinitas manis', en: 'Make it a sweet ritual' },
        desc: (p1, p2, lang) =>
          lang === 'id'
            ? `Walau singkat, obrolan kecil tiap hari bikin hubungan tetap hangat.`
            : `Keep this small ritual alive every day to stay connected.`
      }
    ],
    tip: {
      id: 'Nggak perlu nunggu waktu luang lama, obrolan santai 2 menit yang rutin udah lebih dari cukup.',
      en: 'A simple, regular 2-minute chat does wonders for staying close.'
    }
  }
};

// Ensure aliases are supported
GAME_INSTRUCTIONS['tell-me-something'] = GAME_INSTRUCTIONS['tell-me'];
