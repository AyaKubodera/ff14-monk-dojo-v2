
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, RotationState, Skill, BeastChakraType, NadiType } from './types';
import { MONK_SKILLS, INITIAL_ROTATION_STATE } from './constants';
import SkillButton from './components/SkillButton';
import StatsPanel from './components/StatsPanel';
import { getMonkFeedback } from './services/geminiService';
import { sounds } from './services/soundService';

const App: React.FC = () => {
  const [state, setState] = useState<RotationState>(INITIAL_ROTATION_STATE);
  const [feedback, setFeedback] = useState<string>("道場へようこそ。画面をどこかタップして修行を開始せよ。");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isGCD, setIsGCD] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // 初回クリック時にオーディオを有効化
  const unlockAudio = () => {
    sounds.init();
    if (feedback.includes("どこかタップして")) {
      setFeedback("よし、まずは壱の型（猿舞連撃か双竜脚）から始めよう！");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        buffs: {
          ...prev.buffs,
          disciplinedFist: Math.max(0, prev.buffs.disciplinedFist - 1),
          demolishDoT: Math.max(0, prev.buffs.demolishDoT - 1),
          riddleOfFire: Math.max(0, prev.buffs.riddleOfFire - 1),
        }
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentBlitz = useMemo(() => {
    if (state.beastChakra.length < 3) return null;
    const types = new Set(state.beastChakra);
    if (state.nadi.includes(NadiType.Lunar) && state.nadi.includes(NadiType.Solar)) {
      return { id: 'phantom_rush', name: '夢幻闘舞', icon: '🌪️', color: 'bg-purple-600' };
    }
    if (types.size === 3) return { id: 'rising_phoenix', name: '鳳凰の舞', icon: '🔥', color: 'bg-orange-600' };
    if (types.size === 1) return { id: 'elixir_field', name: '蒼気砲', icon: '🌀', color: 'bg-blue-600' };
    return { id: 'celestial_revolution', name: '天回転', icon: '💫', color: 'bg-slate-500' };
  }, [state.beastChakra, state.nadi]);

  const recommendedSkillId = useMemo(() => {
    if (currentBlitz) return currentBlitz.id;
    const { currentForm, buffs, beastChakra, chakraCount } = state;
    
    // 闘気5なら闘気斬を最優先
    if (chakraCount === 5) return 'forbidden_chakra';

    // 踏鳴中の推奨
    if (buffs.perfectBalanceStacks > 0) {
      const hasLunar = state.nadi.includes(NadiType.Lunar);
      if (!hasLunar) return 'dragon_kick'; 
      const types = new Set(beastChakra);
      if (!types.has(BeastChakraType.Opo)) return 'dragon_kick';
      if (!types.has(BeastChakraType.Raptor)) return 'twin_snakes';
      return 'demolish';
    }

    // 通常コンボの推奨
    if (currentForm === Form.OpoOpo || currentForm === Form.Formless || currentForm === Form.None) {
      return buffs.leadenFist ? 'bootshine' : 'dragon_kick';
    }
    if (currentForm === Form.Raptor) {
      return buffs.disciplinedFist < 5 ? 'twin_snakes' : 'true_strike';
    }
    if (currentForm === Form.Coeurl) {
      return buffs.demolishDoT < 4 ? 'demolish' : 'snap_punch';
    }
    return null;
  }, [state, currentBlitz]);

  const triggerError = () => {
    setIsError(true);
    sounds.playError();
    setTimeout(() => setIsError(false), 200);
    setFeedback("型が違うぞ！次は「" + (MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name || "基本の型") + "」だ。");
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  };

  const executeSkill = useCallback((skill: Skill | any) => {
    unlockAudio();
    if (!skill.isAbility && isGCD) return;

    // 闘気斬の特別チェック
    if (skill.id === 'forbidden_chakra' && state.chakraCount < 5) {
      triggerError();
      return;
    }
    
    // 型判定
    if (!skill.isAbility && state.buffs.perfectBalanceStacks === 0) {
      if (!skill.formRequired.includes(state.currentForm)) {
        triggerError();
        return;
      }
    }

    if (skill.id === 'forbidden_chakra' || skill.id === 'riddle_of_fire' || skill.id === 'perfect_balance' || skill.id === 'formless_shift') {
      sounds.playSuccess();
    } else {
      sounds.playSkill();
    }

    if (!skill.isAbility) {
      setIsGCD(true);
      setTimeout(() => setIsGCD(false), 1950);
    }

    setState(prev => {
      const newBuffs = { ...prev.buffs };
      let newBeastChakra = [...prev.beastChakra];
      let newNadi = [...prev.nadi];
      let nextForm = skill.formGranted;
      let newChakra = prev.chakraCount;

      // 闘気蓄積 (WS使用時に80%の確率で1貯まる)
      if (!skill.isAbility && newChakra < 5) {
        if (Math.random() > 0.2) newChakra++;
      }

      if (skill.id === 'forbidden_chakra') {
        newChakra = 0;
        return { ...prev, chakraCount: newChakra, history: [...prev.history, skill.name] };
      }

      if (skill.id === 'riddle_of_fire') {
        newBuffs.riddleOfFire = 20;
        return { ...prev, buffs: newBuffs, history: [...prev.history, skill.name] };
      }
      if (skill.id === 'perfect_balance') {
        newBuffs.perfectBalanceStacks = 3;
        return { ...prev, buffs: newBuffs, history: [...prev.history, skill.name] };
      }
      if (skill.id === 'formless_shift') {
        return { ...prev, currentForm: Form.Formless, history: [...prev.history, skill.name] };
      }
      
      // 必殺技
      if (['elixir_field', 'rising_phoenix', 'phantom_rush', 'celestial_revolution'].includes(skill.id)) {
        sounds.playSuccess();
        if (skill.id === 'elixir_field') !newNadi.includes(NadiType.Lunar) && newNadi.push(NadiType.Lunar);
        if (skill.id === 'rising_phoenix') !newNadi.includes(NadiType.Solar) && newNadi.push(NadiType.Solar);
        if (skill.id === 'phantom_rush') newNadi = [];
        newBeastChakra = [];
        newBuffs.perfectBalanceStacks = 0;
        return { ...prev, nadi: newNadi, beastChakra: newBeastChakra, chakraCount: newChakra, buffs: newBuffs, currentForm: Form.Formless, history: [...prev.history, skill.name] };
      }

      if (skill.id === 'dragon_kick') newBuffs.leadenFist = true;
      if (skill.id === 'bootshine') newBuffs.leadenFist = false;
      if (skill.id === 'twin_snakes') newBuffs.disciplinedFist = 15;
      if (skill.id === 'demolish') newBuffs.demolishDoT = 18;

      if (newBuffs.perfectBalanceStacks > 0 && !skill.isAbility) {
        if (skill.beastChakraGranted) newBeastChakra.push(skill.beastChakraGranted);
        newBuffs.perfectBalanceStacks--;
        nextForm = newBuffs.perfectBalanceStacks === 0 ? Form.None : Form.Formless;
      }

      return {
        ...prev,
        currentForm: nextForm,
        buffs: newBuffs,
        beastChakra: newBeastChakra,
        chakraCount: newChakra,
        history: [...prev.history, skill.name]
      };
    });
  }, [isGCD, state, recommendedSkillId]);

  useEffect(() => {
    if (state.history.length > 0 && state.history.length % 10 === 0) {
      const updateFeedback = async () => {
        setIsThinking(true);
        const advice = await getMonkFeedback(state.history, state.currentForm);
        setFeedback(advice);
        setIsThinking(false);
      };
      updateFeedback();
    }
  }, [state.history.length]);

  const lastSkills = useMemo(() => state.history.slice(-5).reverse(), [state.history]);

  return (
    <div 
      onClick={unlockAudio}
      className={`fixed inset-0 transition-all duration-200 ${isError ? 'bg-red-900/50' : 'bg-[#020617]'} text-slate-100 p-4 safe-pt flex flex-col items-center select-none overflow-hidden`}
    >
      <header className="w-full max-w-lg flex flex-col items-center mb-2">
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 via-white to-orange-500 bg-clip-text text-transparent">
          MONK DOJO LV100
        </h1>
        <div className="flex gap-1.5 mt-2 h-7 overflow-hidden items-center">
          {lastSkills.map((s, i) => (
            <div key={i} className={`text-[9px] px-2 py-0.5 rounded border border-white/10 bg-white/5 whitespace-nowrap transition-all ${i === 0 ? 'opacity-100 scale-100 border-yellow-500/50' : 'opacity-40 scale-90'}`}>
              {s}
            </div>
          ))}
        </div>
      </header>

      <main className="w-full max-w-lg flex flex-col gap-3 flex-1 overflow-y-auto pb-64">
        <div className={`flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${currentBlitz ? 'bg-orange-500/20 border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.3)] animate-pulse' : 'bg-white/5 border-white/10'}`}>
          <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Recommended Action</span>
          {currentBlitz ? (
            <button 
              onClick={(e) => { e.stopPropagation(); executeSkill(currentBlitz); }}
              disabled={isGCD}
              className={`px-10 py-3 rounded-xl font-black text-xl shadow-2xl scale-110 border-2 border-white ring-4 ring-orange-500/50 ${currentBlitz.color}`}
            >
              {currentBlitz.icon} {currentBlitz.name}
            </button>
          ) : (
            <div className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name || '...'}
            </div>
          )}
        </div>

        <StatsPanel state={state} feedback={feedback} isThinking={isThinking} />
        
        <div className="flex justify-center mt-2">
          <button onClick={(e) => { e.stopPropagation(); sounds.playClick(220); setState(INITIAL_ROTATION_STATE); }} className="text-[9px] px-4 py-1.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700 active:bg-slate-700 uppercase tracking-widest">Reset Practice</button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+var(--sab))] bg-slate-950/95 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            {MONK_SKILLS.filter(s => s.isAbility).map(skill => {
              const isAvailable = skill.id === 'forbidden_chakra' ? state.chakraCount === 5 : true;
              return (
                <button
                  key={skill.id}
                  onClick={(e) => { e.stopPropagation(); executeSkill(skill); }}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 border-white/20 ${skill.color} flex-1 max-w-[100px] shadow-lg active:scale-95 active:brightness-125 transition-all ${!isAvailable ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                >
                  <span className="text-xl">{skill.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{skill.name}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {MONK_SKILLS.filter(s => !s.isAbility).map(skill => (
              <SkillButton
                key={skill.id}
                skill={skill}
                currentForm={state.currentForm}
                onClick={executeSkill}
                disabled={isGCD}
                isRecommended={skill.id === recommendedSkillId}
              />
            ))}
          </div>
        </div>
        {isGCD && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20"><div className="h-full bg-blue-400 animate-[gcd_1.95s_linear_forwards]" /></div>
        )}
      </div>

      <style>{`
        @keyframes gcd { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default App;
