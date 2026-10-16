import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { DOMAIN_LANGUAGES, COMMON_PHRASES } from '../data/languages';
import { DOMAINS } from '../data/domains';
import { DomainId, PhraseTranslation } from '../types/world';
import { ScriptGlyphRenderer } from './ScriptGlyphRenderer';
import { CurrentSigil, RopeKnotDivider } from './OrrinIcons';
import { TongueShifterElementalBackground } from './TongueShifterElementalBackground';

interface ElementUITheme {
  elementKey: 'water' | 'air' | 'earth' | 'fire';
  elementName: string;
  elementTag: string;
  elementSubtitle: string;
  titleGradient: string;
  borderPrimary: string;
  borderSubtle: string;
  bgCard: string;
  bgHeader: string;
  badgeTheme: string;
  accentText: string;
  secondaryText: string;
  buttonActive: string;
  buttonInactive: string;
  glowBox: string;
  sigilColor: string;
  inputBorder: string;
  glyphColor: string;
  pronounceBtn: string;
  displayPrefix: string;
}

const ELEMENT_UI_THEMES: Record<DomainId, ElementUITheme> = {
  tidereach: {
    elementKey: 'water',
    elementName: 'Water & Abyssal Currents',
    elementTag: 'Water Element',
    elementSubtitle: 'Fluid wave-script with undulating, lyrical water ripples',
    titleGradient: 'from-white via-cyan-100 to-cyan-400',
    displayPrefix: '~ ~ ~',
    borderPrimary: 'border-cyan-400',
    borderSubtle: 'border-cyan-500/35',
    bgCard: 'bg-[#041420]/90',
    bgHeader: 'bg-[#03111c]/95',
    badgeTheme: 'bg-cyan-950/90 text-cyan-200 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    accentText: 'text-cyan-300',
    secondaryText: 'text-cyan-400',
    buttonActive:
      'bg-gradient-to-r from-cyan-950 via-cyan-900 to-teal-950 text-cyan-100 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] font-bold scale-[1.02]',
    buttonInactive: 'bg-[#04121d] text-cyan-300/75 border border-cyan-500/30 hover:border-cyan-400 hover:text-white',
    glowBox: 'shadow-[0_0_30px_rgba(6,182,212,0.22)]',
    sigilColor: 'text-cyan-400',
    inputBorder: 'border-cyan-500/40 focus:border-cyan-300',
    glyphColor: 'text-cyan-300',
    pronounceBtn:
      'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)]',
  },
  skydrift: {
    elementKey: 'air',
    elementName: 'Air & Tempest Updrafts',
    elementTag: 'Air Element',
    elementSubtitle: 'Lofting aero-glyphs with expansive atmospheric resonance',
    titleGradient: 'from-white via-sky-100 to-sky-400',
    displayPrefix: '· — ·',
    borderPrimary: 'border-sky-400',
    borderSubtle: 'border-sky-500/35',
    bgCard: 'bg-[#05172e]/90',
    bgHeader: 'bg-[#041122]/95',
    badgeTheme: 'bg-sky-950/90 text-sky-200 border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    accentText: 'text-sky-300',
    secondaryText: 'text-sky-400',
    buttonActive:
      'bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-sky-100 border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.6)] font-bold scale-[1.02]',
    buttonInactive: 'bg-[#051426] text-sky-300/75 border border-sky-500/30 hover:border-sky-400 hover:text-white',
    glowBox: 'shadow-[0_0_30px_rgba(56,189,248,0.22)]',
    sigilColor: 'text-sky-400',
    inputBorder: 'border-sky-500/40 focus:border-sky-300',
    glyphColor: 'text-sky-300',
    pronounceBtn:
      'bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-[0_0_18px_rgba(56,189,248,0.45)]',
  },
  stonemarch: {
    elementKey: 'earth',
    elementName: 'Earth & Lithic Bedrock',
    elementTag: 'Earth Element',
    elementSubtitle: 'Lithic cuneiform carved directly into bedrock keystones',
    titleGradient: 'from-white via-emerald-100 to-emerald-400',
    displayPrefix: '❖ ❖ ❖',
    borderPrimary: 'border-emerald-400',
    borderSubtle: 'border-emerald-500/35',
    bgCard: 'bg-[#051a10]/90',
    bgHeader: 'bg-[#04140c]/95',
    badgeTheme: 'bg-emerald-950/90 text-emerald-200 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    accentText: 'text-emerald-300',
    secondaryText: 'text-emerald-400',
    buttonActive:
      'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-emerald-100 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] font-bold scale-[1.02]',
    buttonInactive: 'bg-[#04150b] text-emerald-300/75 border border-emerald-500/30 hover:border-emerald-400 hover:text-white',
    glowBox: 'shadow-[0_0_30px_rgba(16,185,129,0.22)]',
    sigilColor: 'text-emerald-400',
    inputBorder: 'border-emerald-500/40 focus:border-emerald-300',
    glyphColor: 'text-emerald-300',
    pronounceBtn:
      'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.45)]',
  },
  emberhold: {
    elementKey: 'fire',
    elementName: 'Fire & Thermal Crucible',
    elementTag: 'Fire Element',
    elementSubtitle: 'Incandescent pyre-runes forged within basalt calderas',
    titleGradient: 'from-white via-amber-200 to-orange-500',
    displayPrefix: '▲ ▲ ▲',
    borderPrimary: 'border-orange-500',
    borderSubtle: 'border-orange-500/35',
    bgCard: 'bg-[#1c0a06]/90',
    bgHeader: 'bg-[#140603]/95',
    badgeTheme: 'bg-orange-950/90 text-orange-200 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.35)]',
    accentText: 'text-orange-400',
    secondaryText: 'text-orange-300',
    buttonActive:
      'bg-gradient-to-r from-orange-950 via-orange-900 to-amber-950 text-orange-100 border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)] font-bold scale-[1.02]',
    buttonInactive: 'bg-[#150704] text-orange-300/75 border border-orange-500/30 hover:border-orange-400 hover:text-white',
    glowBox: 'shadow-[0_0_30px_rgba(249,115,22,0.22)]',
    sigilColor: 'text-orange-400',
    inputBorder: 'border-orange-500/40 focus:border-orange-300',
    glyphColor: 'text-orange-300',
    pronounceBtn:
      'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.45)]',
  },
};

// Global set to prevent garbage collection of SpeechSynthesisUtterance in Chromium
const activeUtterances = new Set<SpeechSynthesisUtterance>();
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch (_) {}
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

/**
 * Bulletproof procedural formant and harmonic audio synthesis:
 * Generates an authentic vocal formant articulation of the word's syllables
 * alongside a domain-specific elemental resonant harmonic chime.
 * Works 100% offline, on any device and browser, with 0 external dependencies.
 */
/**
 * Returns the best local offline voice installed on the user's OS.
 * Excludes remote "Online (Natural)" cloud voices (e.g. Edge cloud streaming)
 * which frequently freeze or fail on localhost.
 */
function getBestLocalVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const sysVoices = window.speechSynthesis.getVoices();
  const voices = sysVoices && sysVoices.length > 0 ? sysVoices : cachedVoices;
  if (!voices || voices.length === 0) return null;
  cachedVoices = voices;

  const isLocalOffline = (v: SpeechSynthesisVoice) =>
    !v.name.toLowerCase().includes('online') &&
    !v.name.toLowerCase().includes('natural') &&
    v.localService !== false;

  const english = voices.filter((v) => v.lang.startsWith('en'));
  const offlineEnglish = english.filter(isLocalOffline);

  return (
    offlineEnglish.find((v) => v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Zira') || v.name.includes('Google')) ||
    offlineEnglish[0] ||
    english.find((v) => !v.name.toLowerCase().includes('online')) ||
    english[0] ||
    voices[0]
  );
}



/**
 * Bulletproof Web Speech Synthesis:
 * Uses offline local system voices to prevent Edge/Chrome cloud-voice freezes on localhost.
 */
function speakWithTTS(
  nativeText: string,
  phoneticText: string,
  domain: DomainId,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 900);
    return;
  }

  const cleanPhonetic = phoneticText
    ? phoneticText.replace(/[\[\]]/g, '').replace(/[-/–—]/g, ' ').trim()
    : nativeText;
  const spokenText = cleanPhonetic || nativeText;

  const doSpeak = () => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'en-US';
      utterance.volume = 1.0;

      if (domain === 'emberhold') {
        utterance.pitch = 0.8;
        utterance.rate = 0.88;
      } else if (domain === 'skydrift') {
        utterance.pitch = 1.15;
        utterance.rate = 0.95;
      } else if (domain === 'stonemarch') {
        utterance.pitch = 0.72;
        utterance.rate = 0.82;
      } else {
        // tidereach
        utterance.pitch = 0.95;
        utterance.rate = 0.9;
      }

      const voice = getBestLocalVoice();
      if (voice) {
        utterance.voice = voice;
      }

      activeUtterances.add(utterance);

      const cleanup = () => {
        activeUtterances.delete(utterance);
        if (onEnd) onEnd();
      };

      utterance.onend = cleanup;
      utterance.onerror = cleanup;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
    }
  };

  try {
    window.speechSynthesis.cancel();
  } catch (_) {}

  setTimeout(doSpeak, 35);
}

export const TongueShifter: React.FC = () => {
  const { currentDomain, setDomain, soundEnabled } = useLedger();

  const [selectedPhrase, setSelectedPhrase] = useState<PhraseTranslation>(COMMON_PHRASES[0]);
  const [customText, setCustomText] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [vocabSearch, setVocabSearch] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const domainLang = DOMAIN_LANGUAGES[currentDomain];
  const domainInfo = DOMAINS[currentDomain];
  const phraseTranslation = selectedPhrase.domainTranslations[currentDomain];
  const uiTheme = ELEMENT_UI_THEMES[currentDomain];

  const renderCustomTranslation = (input: string) => {
    if (!input.trim()) return null;
    const words = input.trim().split(/\s+/);
    const translatedWords = words.map((w, idx) => {
      const vocabList = domainLang.vocabulary;
      const match = vocabList.find((v) => v.english.toLowerCase() === w.toLowerCase());
      if (match) return match.native;
      const pseudoWord = vocabList[(w.length * 7 + idx * 11) % vocabList.length].native;
      return pseudoWord;
    });

    return {
      nativeText: translatedWords.join(' '),
      phonetic: translatedWords.map((w) => w.toUpperCase()).join(' - '),
    };
  };

  const customResult = customText ? renderCustomTranslation(customText) : null;
  const currentNativeWord = customResult ? customResult.nativeText : phraseTranslation.nativeText;
  const currentPhonetic = customResult ? customResult.phonetic : phraseTranslation.phonetic;

  // Audio Speech Synthesis / Read Aloud Pronunciation Function
  const speakPronunciation = (nativeText: string, phoneticText?: string, identifier?: string) => {
    if (identifier) {
      setSpeakingWord(identifier);
    }
    setIsSpeaking(true);

    const phonetic = phoneticText || nativeText;

    // Direct voice pronunciation
    speakWithTTS(nativeText, phonetic, currentDomain, () => {
      setIsSpeaking(false);
      setSpeakingWord((prev) => (prev === identifier ? null : prev));
    });

    // 3. Fallback safety timer proportional to phrase length
    const duration = Math.max(3500, (phonetic.length || 20) * 80);
    setTimeout(() => {
      setIsSpeaking(false);
      setSpeakingWord((prev) => (prev === identifier ? null : prev));
    }, duration);
  };

  const filteredVocab = domainLang.vocabulary.filter((v) => {
    const matchesSearch =
      v.english.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.native.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.meaning.toLowerCase().includes(vocabSearch.toLowerCase());
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Element', 'Travel', 'Gear', 'Role', 'Item', 'Danger', 'Commerce', 'Social'];

  return (
    <div
      className="ts-themed flex-1 flex flex-col p-3 sm:p-6 max-w-7xl mx-auto w-full gap-6 relative"
      data-ts-element={uiTheme.elementKey}
    >
      {/* REALISTIC DYNAMIC ELEMENTAL BACKGROUND (Fire burning, Waterfall pouring, Tree growing, or Storm) */}
      <TongueShifterElementalBackground domainId={currentDomain} />

      {/* Main Foreground Content Container */}
      <div className="relative z-20 flex flex-col gap-6">
        {/* Top Banner: Script & Dialect Header Capsule in ELEMENT-DRIVEN THEME */}
        <div
          className={`${uiTheme.bgHeader} rounded-3xl p-5 sm:p-6 border ${uiTheme.borderSubtle} ${uiTheme.glowBox} flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 backdrop-blur-md transition-all duration-500`}
        >
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 rounded-full ${uiTheme.badgeTheme} flex items-center justify-center flex-shrink-0 transition-colors shadow-lg`}
            >
              <span className="material-symbols-outlined text-[26px]">translate</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="ts-display font-serif font-bold text-lg sm:text-2xl text-white tracking-wide">
                  <span className="text-white">The Tongue Shifter</span>{' '}
                  <span className="text-white/40 font-light">&</span>{' '}
                  <span className={`bg-gradient-to-r ${uiTheme.titleGradient} bg-clip-text text-transparent font-black drop-shadow-sm`}>
                    Script Codex
                  </span>
                </h2>
                <span
                  className={`font-label text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${uiTheme.badgeTheme}`}
                >
                  {domainLang.languageName} · {domainLang.scriptName}
                </span>
                <span
                  className="font-label text-[10px] uppercase font-bold px-3 py-1 rounded-full border bg-black/60 text-white border-white/20 shadow-sm"
                >
                  <span className={uiTheme.accentText}>●</span> {uiTheme.elementTag}
                </span>
              </div>
              <p className="font-serif text-xs sm:text-sm text-gray-200 mt-1.5 max-w-2xl leading-relaxed">
                Each Domain speaks an elemental dialect with its own invented writing system and rigid social taboos.
                Currently attuned to the <span className="text-white font-bold px-2 py-0.5 rounded-md bg-white/10 border border-white/20">{domainInfo.name}</span>{' '}
                Current (<span className={`font-bold ${uiTheme.accentText}`}>{uiTheme.elementName}</span>).
              </p>
            </div>
          </div>

          {/* Domain Target Dialect Switcher Capsules - Always uniform 1-row layout across all domains */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap flex-shrink-0 overflow-x-auto max-w-full py-1">
            {(['tidereach', 'skydrift', 'stonemarch', 'emberhold'] as DomainId[]).map((dId) => {
              const isSelected = currentDomain === dId;
              const cfg = ELEMENT_UI_THEMES[dId];
              return (
                <button
                  key={dId}
                  onClick={() => setDomain(dId)}
                  className={`font-label text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isSelected ? cfg.buttonActive : cfg.buttonInactive
                  }`}
                  title={`Switch Tongue Shifter to ${DOMAINS[dId].name} (${DOMAINS[dId].element})`}
                >
                  <CurrentSigil domain={dId} size={15} className={cfg.sigilColor} />
                  <span className={isSelected ? 'text-white' : ''}>{DOMAINS[dId].name}</span>
                  <span className="text-[10px] font-mono opacity-90">({DOMAINS[dId].element})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Translator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Phrases & Input (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Quick Phrases Selector in Element Capsule Box */}
            <div
              className={`${uiTheme.bgCard} rounded-3xl border ${uiTheme.borderSubtle} p-5 ${uiTheme.glowBox} backdrop-blur-md transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-label text-[11px] uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${uiTheme.accentText} bg-current`}></span>
                  Essential Courier Inquiries
                </span>
                <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 ${uiTheme.accentText} uppercase`}>
                  {COMMON_PHRASES.length} Inscriptions
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {COMMON_PHRASES.map((phrase) => {
                  const isSelected = selectedPhrase.id === phrase.id && !customText;
                  return (
                    <button
                      key={phrase.id}
                      onClick={() => {
                        setSelectedPhrase(phrase);
                        setCustomText('');
                      }}
                      className={`text-left p-3 rounded-2xl border transition-all text-xs font-serif flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? `${uiTheme.badgeTheme} font-semibold scale-[1.01] shadow-lg`
                          : 'bg-black/40 border-white/10 hover:border-white/30 text-gray-300 hover:text-white'
                      }`}
                    >
                      <span
                        className={`font-label text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white text-black font-extrabold shadow-sm' : uiTheme.badgeTheme
                        }`}
                      >
                        {phrase.category}
                      </span>
                      <span className={`flex-1 truncate ${isSelected ? 'text-white font-bold' : 'text-gray-200'}`}>
                        {phrase.commonText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Message Field */}
            <div
              className={`${uiTheme.bgCard} rounded-3xl border ${uiTheme.borderSubtle} p-5 ${uiTheme.glowBox} backdrop-blur-md transition-all`}
            >
              <label className="font-label text-[11px] uppercase font-bold text-white tracking-wider block mb-2 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${uiTheme.accentText} bg-current`}></span>
                Compose Free Courier Message
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Where is water and shelter? My satchel seals are intact..."
                rows={3}
                className={`w-full bg-black/60 text-white font-serif text-xs p-3.5 rounded-2xl border ${uiTheme.inputBorder} focus:outline-none resize-none transition-colors shadow-inner`}
              />
              {customText && (
                <div className="mt-2.5 flex justify-between items-center">
                  <span className="font-label text-[10.5px] font-bold text-white flex items-center gap-1.5">
                    <span className="text-white/60">Live Translation:</span>
                    <span className={uiTheme.accentText}>{domainLang.languageName}</span>
                  </span>
                  <button
                    onClick={() => setCustomText('')}
                    className="font-label text-[10px] text-white/80 hover:text-white underline cursor-pointer"
                  >
                    Clear Custom Text
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inscribed Translation Display (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Luminous Inscribed Plate Card with Elemental Bounding Box */}
            <div
              className={`${uiTheme.bgCard} rounded-3xl border-2 ${uiTheme.borderPrimary} p-5 sm:p-6 ${uiTheme.glowBox} flex flex-col gap-4 relative backdrop-blur-md transition-all`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CurrentSigil domain={currentDomain} size={20} className={uiTheme.sigilColor} />
                  <span className="font-serif font-bold text-sm sm:text-base text-white">
                    Inscribed in <span className="text-white font-bold">{domainLang.scriptName}</span>
                  </span>
                </div>
                <span className="font-label text-[10px] uppercase font-bold text-white bg-black/60 px-3 py-0.5 rounded-full border border-white/20 shadow-sm">
                  <span className={uiTheme.accentText}>Plate #</span>{currentDomain.slice(0, 3).toUpperCase()}-77
                </span>
              </div>

              {/* Fictional Script Glyphs Area with Neon Elemental Glow */}
              <div
                className={`p-6 sm:p-8 rounded-2xl bg-black/60 border ${uiTheme.borderSubtle} flex flex-col items-center justify-center min-h-[150px] ${uiTheme.glyphColor} overflow-x-auto overflow-y-hidden text-center shadow-inner relative z-10 w-full`}
              >
                <div className="w-full flex justify-center items-center py-2 px-1">
                  <ScriptGlyphRenderer
                    text={currentNativeWord}
                    domainId={currentDomain}
                    size="lg"
                    showGlow={true}
                  />
                </div>
              </div>

              {/* Translation & Pronunciation Row */}
              <div className="space-y-3 pt-3 relative z-20">
                <div className="flex items-center justify-end">
                  {/* PRONUNCIATION BUTTON TO READ ALOUD */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      speakPronunciation(currentNativeWord, currentPhonetic, 'main');
                    }}
                    className={`relative z-30 font-label text-xs font-semibold px-5 py-2.5 min-h-[42px] rounded-full ${uiTheme.pronounceBtn} flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md select-none`}
                    title="Click to pronounce this phrase aloud"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] text-white pointer-events-none ${isSpeaking && speakingWord === 'main' ? 'animate-bounce' : ''}`}
                    >
                      {isSpeaking && speakingWord === 'main' ? 'graphic_eq' : 'volume_up'}
                    </span>
                    <span className="text-white font-bold pointer-events-none select-none">
                      {isSpeaking && speakingWord === 'main' ? 'Pronouncing...' : 'Pronounce Aloud'}
                    </span>
                  </button>
                </div>

                {/* Main Inscribed Word Display: Dual-tone White Core with Vibrant Elemental Glow */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/15 relative overflow-hidden group shadow-inner">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                    <span className={`font-mono text-[10.5px] tracking-widest uppercase font-bold ${uiTheme.accentText} flex items-center gap-1.5`}>
                      <span className="opacity-75">{uiTheme.displayPrefix}</span>
                      <span className="text-white font-serif">{domainLang.languageName}</span>
                      <span className="opacity-75">{uiTheme.displayPrefix}</span>
                    </span>
                    <span className="text-[10px] text-white/70 font-label tracking-wide italic">
                      {uiTheme.elementSubtitle}
                    </span>
                  </div>

                  <p className="ts-display ts-quote-glow font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-wide break-words my-2 selection:bg-white selection:text-black">
                    <span className="text-white/50 text-xl mr-1 font-normal select-none">“</span>
                    <span className="text-white">{currentNativeWord}</span>
                    <span className="text-white/50 text-xl ml-1 font-normal select-none">”</span>
                  </p>

                  <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent mt-3" />
                </div>

                {/* Phonetic Pronunciation Box in Inherent Elemental Color + Crisp White */}
                <div className={`flex items-center justify-between p-3.5 rounded-2xl bg-black/65 border ${uiTheme.borderSubtle} flex-wrap gap-2.5 shadow-sm`}>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`material-symbols-outlined text-[18px] ${uiTheme.accentText}`}>record_voice_over</span>
                    <span className="font-sans text-xs text-white/90">
                      Pronunciation Syllables:{' '}
                      <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 inline-flex items-center gap-1 shadow-inner">
                        <span className="text-white/60">[ </span>
                        <span className={`${uiTheme.accentText} tracking-wider font-extrabold drop-shadow-sm`}>{currentPhonetic}</span>
                        <span className="text-white/60"> ]</span>
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      speakPronunciation(currentPhonetic, currentPhonetic, 'syllables');
                    }}
                    className={`relative z-20 font-label text-[11px] ${uiTheme.buttonInactive} px-4 py-2 min-h-[36px] rounded-full cursor-pointer flex items-center gap-1.5 transition-all active:scale-[0.98] ml-auto sm:ml-0 font-medium select-none`}
                  >
                    <span className="material-symbols-outlined text-[14px] pointer-events-none">hearing</span>
                    <span className="text-white pointer-events-none select-none">Hear Syllables</span>
                  </button>
                </div>
              </div>

              {/* Literal Meaning in Crisp White and Glowing Elemental Color */}
              <div className={`pt-2.5 border-t ${uiTheme.borderSubtle}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${uiTheme.accentText} bg-current animate-pulse`} />
                  <span className="font-label text-[10px] uppercase font-bold text-white tracking-wider">
                    Literal Translation & World Meaning
                  </span>
                </div>
                <p className={`font-serif italic text-xs ${uiTheme.accentText} mt-1.5 leading-relaxed`}>
                  <span className="text-white not-italic font-medium">World Meaning:{' '}</span>
                  {customResult
                    ? `Procedural phonetic equivalent transcribed under ${domainLang.grammarRules}`
                    : phraseTranslation.literalMeaning}
                </p>
              </div>

              {/* Cultural Etiquette / Taboo Warning Banner Capsule in Inherent Elemental Palette */}
              {(phraseTranslation.etiquetteWarning || phraseTranslation.isTaboo) && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 bg-black/65 ${
                    phraseTranslation.isTaboo
                      ? 'text-red-200 border-red-500/60 bg-red-950/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                      : `border ${uiTheme.borderSubtle} shadow-sm`
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 ${
                      phraseTranslation.isTaboo ? 'text-red-400' : uiTheme.accentText
                    }`}
                  >
                    {phraseTranslation.isTaboo ? 'gavel' : 'info'}
                  </span>
                  <div>
                    <span className={`font-label text-[10.5px] uppercase font-bold block ${
                      phraseTranslation.isTaboo ? 'text-red-300' : 'text-white'
                    }`}>
                      {phraseTranslation.isTaboo ? 'Critical Cultural Taboo' : 'Domain Etiquette Advisory'}
                    </span>
                    <p className={`font-serif text-xs mt-0.5 leading-relaxed ${
                      phraseTranslation.isTaboo ? 'text-red-200' : 'text-gray-200'
                    }`}>
                      {phraseTranslation.etiquetteWarning}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <RopeKnotDivider />

        {/* Vocabulary Lexicon Explorer in Elemental Theme */}
        <div
          className={`${uiTheme.bgCard} rounded-3xl p-5 sm:p-6 border ${uiTheme.borderSubtle} ${uiTheme.glowBox} space-y-4 backdrop-blur-md transition-all`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-amber-400">auto_stories</span>
                <h3 className="font-serif font-bold text-lg text-white">
                  <span className="text-white">{domainInfo.name}</span>{' '}
                  <span className={`bg-gradient-to-r ${uiTheme.titleGradient} bg-clip-text text-transparent`}>Lexicon</span>{' '}
                  <span className="text-white/80 font-normal">({domainLang.vocabulary.length} Words)</span>
                </h3>
                <span className={`font-label text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${uiTheme.badgeTheme}`}>
                  {uiTheme.elementName}
                </span>
              </div>
              <p className="font-serif text-xs text-gray-200 mt-0.5">
                <span className="text-white/60">Grammar Law:</span> <span className="text-white font-medium">{domainLang.grammarRules}</span>
              </p>
            </div>

            {/* Search Box Capsule */}
            <div className="w-full md:w-72 relative">
              <input
                type="text"
                placeholder="Search vocabulary..."
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                className={`w-full bg-black/60 text-white font-serif text-xs pl-8 pr-3 py-2 rounded-full border ${uiTheme.inputBorder} focus:outline-none transition-colors shadow-inner placeholder:text-gray-400`}
              />
              <span className={`material-symbols-outlined text-[16px] ${uiTheme.accentText} absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none`}>
                search
              </span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-label text-[11px] font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? `${uiTheme.badgeTheme} font-bold scale-[1.02] shadow-md`
                    : 'bg-black/40 text-gray-300 border-white/10 hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Vocabulary Grid with Individual Read-Aloud Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {filteredVocab.map((w, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl bg-black/50 border ${uiTheme.borderSubtle} flex flex-col justify-between gap-2 hover:border-white/40 transition-colors shadow-sm group`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-white tracking-tight">{w.english}</span>
                  <span
                    className={`font-label text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${uiTheme.badgeTheme}`}
                  >
                    {w.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                    <span className={`ts-display font-serif font-bold text-sm ${uiTheme.accentText} drop-shadow-sm truncate`}>
                      {w.native}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        speakPronunciation(w.native, w.phonetic, `vocab-${idx}`);
                      }}
                      className={`relative z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 select-none ${
                        speakingWord === `vocab-${idx}`
                          ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.85)] scale-110'
                          : 'bg-white/10 hover:bg-white/25 text-white hover:scale-105 active:scale-95'
                      }`}
                      title={`Listen to pronunciation of ${w.native} [${w.phonetic}]`}
                      aria-label={`Listen to ${w.native}`}
                    >
                      <span
                        className={`material-symbols-outlined text-[15px] pointer-events-none ${
                          speakingWord === `vocab-${idx}` ? 'animate-pulse text-amber-500 font-bold' : ''
                        }`}
                      >
                        {speakingWord === `vocab-${idx}` ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>
                  </div>
                  <ScriptGlyphRenderer text={w.native} domainId={currentDomain} size="sm" showGlow={false} />
                </div>

                <div className="text-[11px] text-gray-200 flex items-center gap-1.5 flex-wrap">
                  <span className={`font-mono font-semibold text-[10px] ${uiTheme.accentText}`}>[{w.phonetic}]</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white font-medium">{w.meaning}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
