import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QuestionCategory, QuestionItem } from '../../types';
import { BASE_QUESTIONS_LIBRARY } from '../../data/questions';
import { sound } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { BookOpen, Search, Sparkles, Filter, Play, BookmarkCheck } from 'lucide-react';

interface QuestionLibraryViewProps {
  onPlayQuestion: (q: QuestionItem) => void;
  onBackToLobby: () => void;
}

interface CategoryOption {
  id: QuestionCategory | 'all';
  name: { id: string; en: string };
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', name: { id: 'Semua kartu', en: 'All cards' }, icon: '✨' },
  { id: 'Light', name: { id: 'Santai & seru', en: 'Light & fun' }, icon: '☀️' },
  { id: 'Flirty', name: { id: 'Goda & manis', en: 'Flirty' }, icon: '💋' },
  { id: 'Deep Talk', name: { id: 'Deep talk', en: 'Deep talk' }, icon: '💭' },
  { id: 'Love', name: { id: 'Cinta & kita', en: 'Love & us' }, icon: '❤️' },
  { id: 'Communication', name: { id: 'Komunikasi', en: 'Communication' }, icon: '💬' },
  { id: 'Values', name: { id: 'Nilai hidup', en: 'Core values' }, icon: '⚖️' },
  { id: 'Family', name: { id: 'Keluarga', en: 'Family roots' }, icon: '🏡' },
  { id: 'Money', name: { id: 'Finansial & hidup', en: 'Money & life' }, icon: '🌱' },
  { id: 'Future', name: { id: 'Masa depan', en: 'Future dreams' }, icon: '🚀' },
  { id: 'Marriage', name: { id: 'Pernikahan', en: 'Marriage & life' }, icon: '💍' },
  { id: 'Children', name: { id: 'Pola asuh', en: 'Parenthood' }, icon: '🧸' },
  { id: 'LDR', name: { id: 'Jarak jauh (LDR)', en: 'Long distance' }, icon: '✈️' },
  { id: 'Intimacy', name: { id: 'Keintiman', en: 'Intimacy' }, icon: '🕯️' },
  { id: 'Reflection', name: { id: 'Refleksi diri', en: 'Reflection' }, icon: '🪞' },
  { id: 'Chaos', name: { id: 'Mode spontan', en: 'Chaos mode' }, icon: '⚡' }
];

export const QuestionLibraryView: React.FC<QuestionLibraryViewProps> = ({
  onPlayQuestion,
  onBackToLobby
}) => {
  const { language, t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<QuestionCategory | 'all'>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredQuestions = BASE_QUESTIONS_LIBRARY.filter((q) => {
    const matchCat = selectedCat === 'all' || q.category === selectedCat;
    const matchDiff = selectedDiff === 'all' || (q.difficulty && String(q.difficulty).includes(selectedDiff));
    const matchSearch =
      search === '' ||
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      (q.subtext && q.subtext.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchDiff && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EC] border border-[#E8C5BC] text-[#8E2435] text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5 text-[#8E2435]" />
          <span>{language === 'id' ? 'Koleksi kartu • 200+ pertanyaan pilihan' : 'Card vault • 200+ handcrafted questions'}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2625] font-normal">
          {language === 'id' ? '“Perpustakaan pertanyaan”' : '“The question library”'}
        </h1>
        <p className="font-serif italic text-sm sm:text-base text-[#7A6A66] max-w-md mx-auto">
          {language === 'id'
            ? 'Jelajahi beragam topik obrolan, dari canda tawa ringan hingga impian masa depan bersama.'
            : 'Explore prompts across every dimension of life, from playful banters to lifelong dreams.'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 paper-card p-5 rounded-2xl border border-[#EAE3D9] bg-white shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C7A75] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'id' ? 'Cari pertanyaan berdasarkan kata kunci...' : 'Search questions by keyword...'}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] focus:border-[#8E2435] focus:outline-hidden"
          />
        </div>

        {/* Categories scroll/wrap */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playTap();
                setSelectedCat(cat.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCat === cat.id
                  ? 'bg-[#8E2435] text-white shadow-xs'
                  : 'bg-[#FAF7F2] hover:bg-[#F3EBE7] text-[#4A3F3D] border border-[#EAE3D9]'
              }`}
            >
              <span>{cat.icon}</span> {cat.name[language]}
            </button>
          ))}
        </div>

        {/* Depth Level Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EAE1] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8C7A75] font-medium">{language === 'id' ? 'Kedalaman:' : 'Depth:'}</span>
            {[
              { val: 'all', label: language === 'id' ? 'Semua level' : 'All depths' },
              { val: 'Easy', label: language === 'id' ? '🌱 Ringan' : '🌱 Easy' },
              { val: 'deeper', label: language === 'id' ? '🌿 Lebih dalam' : '🌿 Getting deeper' },
              { val: 'Vulnerable', label: language === 'id' ? '🌙 Jujur & rentan' : '🌙 Vulnerable' },
              { val: 'Big conversation', label: language === 'id' ? '✨ Obrolan besar' : '✨ Big conversation' }
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => {
                  sound.playTap();
                  setSelectedDiff(d.val);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  selectedDiff === d.val
                    ? 'bg-[#8E2435] text-white font-medium'
                    : 'text-[#7A6A66] hover:bg-[#FAF7F2]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <span className="text-[#8C7A75]">
            {language === 'id' ? `Menampilkan ${filteredQuestions.length} kartu` : `Showing ${filteredQuestions.length} cards`}
          </span>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="paper-card rounded-2xl p-5 border border-[#EAE3D9] bg-white flex flex-col justify-between space-y-3 hover:border-[#D8A499] hover:shadow-xs transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#8C7A75]">
                <span className="font-medium text-[#8E2435] bg-[#FAF0EC] px-2 py-0.5 rounded-md">
                  {q.category}
                </span>
                <span>{q.difficulty || '🌱 Easy'}</span>
              </div>
              <h3 className="font-serif text-base sm:text-lg text-[#2B2625] leading-snug">
                “{q.text}”
              </h3>
              {q.subtext && (
                <p className="text-xs text-[#7A6A66] italic">{q.subtext}</p>
              )}
            </div>

            <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-end">
              <button
                onClick={() => onPlayQuestion(q)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs font-medium transition-all shadow-2xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{language === 'id' ? 'Buka kartu ini' : 'Play this card'}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onBackToLobby}
          className="px-6 py-2.5 rounded-full text-xs font-medium text-[#8C7A75] hover:text-[#2B2625] border border-[#EAE3D9] bg-white transition-colors"
        >
          {t('backToLobby')}
        </button>
      </div>
    </div>
  );
};

