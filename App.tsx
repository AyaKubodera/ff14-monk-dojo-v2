
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

  const unlockAudio = () => {
    sounds.init();
    if (feedback.includes("どこかタップして")) {
      setFeedback("よし、まずは壱の型から。型の繋がりを体で覚えるのだ。");
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
    // 3つのシンボルが貯まっている時だけ必殺技ボタンを有効化
    if (state.beastChakra.length < 3) return null;
    const types = new Set(state.beastChakra);
    
    // 夢幻闘舞 (両方の那岐がある場合)
    if (state.nadi.includes(NadiType.Lunar) && state.nadi.includes(NadiType.Solar)) {
      return { id: 'phantom_rush', name: '夢幻闘舞', icon: '🌪️', color: 'bg-gradient-to-r from-purple-600 to-indigo-700 shadow-[0_0_40px_rgba(139,92,246,0.6)]' };
    }
    
    // 鳳凰の舞 (3種類バラバラ)
    if (types.size === 3) {
      return { id: 'rising_phoenix', name: '鳳凰の舞', icon: '🔥', color: 'bg-gradient-to-r from-orange-600 to-red-700 shadow-[0_0_40px_rgba(249,115,22,0.6)]' };
    }
    
    // 蒼気砲 (同じ種類3つ)
    if (types.size === 1) {
      return { id: 'elixir_field', name: '蒼気砲', icon: '🌀', color: 'bg-gradient-to-r from-blue-600 to-cyan-700 shadow-[0_0_40px_rgba(59,130,246,0.6)]' };
    }
    
    // 天回転 (それ以外)
    return { id: 'celestial_revolution', name: '天回転', icon: '💫', color: 'bg-slate-500 shadow-xl' };
  }, [state.beastChakra, state.nadi]);

  const recommendedSkillId = useMemo(() => {
    if (currentBlitz) return currentBlitz.id;
    const { currentForm, buffs, beastChakra, chakraCount, nadi } = state;
    
    if (chakraCount === 5) return 'forbidden_chakra';

    // 紅蓮の極意中、まだ踏鳴を使っていないなら「踏鳴」を推奨
    if (buffs.riddleOfFire > 10 && buffs.perfectBalanceStacks === 0 && beastChakra.length === 0) {
      return 'perfect_balance';
    }

    if (buffs.perfectBalanceStacks > 0) {
      const typesInChakra = new Set(beastChakra);
      const hasLunar = nadi.includes(NadiType.Lunar);
      const hasSolar = nadi.includes(NadiType.Solar);
      
      // 真真回し対応: 両方の那岐があるなら、次は夢幻闘舞(なんでも良いが同じの3つが楽)
      if (hasLunar && hasSolar) {
        return 'dragon_kick'; 
      }

      // 月（同じ技3つ）を優先して取る
      if (!hasLunar) {
        return 'dragon_kick'; 
      } else {
        // 太陽（3種バラバラ）を取る
        if (!typesInChakra.has(BeastChakraType.Opo)) return 'dragon_kick';
        if (!typesInChakra.has(BeastChakraType.Raptor)) return 'twin_snakes';
        return 'demolish';
      }
    }

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
    const targetName = MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name || currentBlitz?.name || "次の一手";
    setFeedback(`型が違う！「${targetName}」を打つべし。`);
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  };

  const executeSkill = useCallback((skill: Skill | any) => {
    unlockAudio();
    if (!skill.isAbility && isGCD) return;

    if (skill.id === 'forbidden_chakra' && state.chakraCount < 5) {
      triggerError();
      return;
    }
    
    if (!skill.isAbility && state.buffs.perfectBalanceStacks === 0 && !['elixir_field', 'rising_phoenix', 'phantom_rush', 'celestial_revolution'].includes(skill.id)) {
      if (!skill.formRequired.includes(state.currentForm)) {
        triggerError();
        return;
      }
    }

    if (skill.id === 'forbidden_chakra' || skill.id === 'riddle_of_fire' || skill.id === 'perfect_balance' || skill.id === 'formless_shift' || currentBlitz) {
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

      if (!skill.isAbility && newChakra < 5) {
        if (Math.random() > 0.3) newChakra++;
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
      
      // 必殺技実行
      if (['elixir_field', 'rising_phoenix', 'phantom_rush', 'celestial_revolution'].includes(skill.id)) {
        if (skill.id === 'elixir_field') !newNadi.includes(NadiType.Lunar) && newNadi.push(NadiType.Lunar);
        if (skill.id === 'rising_phoenix') !newNadi.includes(NadiType.Solar) && newNadi.push(NadiType.Solar);
        if (skill.id === 'phantom_rush') newNadi = [];
        newBeastChakra = [];
        newBuffs.perfectBalanceStacks = 0;
        return { ...prev, nadi: newNadi, beastChakra: newBeastChakra, buffs: newBuffs, currentForm: Form.Formless, history: [...prev.history, skill.name] };
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
  }, [isGCD, state, recommendedSkillId, currentBlitz]);

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
      className={`fixed inset-0 transition-all duration-300 ${isError ? 'bg-red-900/40' : 'bg-[#020617]'} text-slate-100 p-4 safe-pt flex flex-col items-center select-none overflow-hidden`}
    >
      <header className="w-full max-w-lg flex flex-col items-center mb-1">
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 via-white to-orange-500 bg-clip-text text-transparent italic">
          MONK DOJO <span className="text-xs ml-1">v2.5</span>
        </h1>
        <div className="flex gap-1 mt-2 h-6 items-center">
          {lastSkills.map((s, i) => (
            <div key={i} className={`text-[7px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 transition-all ${i === 0 ? 'opacity-100 scale-110 border-yellow-500/50' : 'opacity-20 scale-90'}`}>
              {s}
            </div>
          ))}
        </div>
      </header>

      <main className="w-full max-w-lg flex flex-col gap-4 flex-1 overflow-y-auto pb-64 pt-2 px-1">
        {/* Blitz / Recommendation Overlay */}
        <div className={`relative flex flex-col items-center py-6 rounded-[2.5rem] border-2 transition-all duration-700 min-h-[140px] justify-center ${
          currentBlitz 
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border-white shadow-[0_0_60px_rgba(99,102,241,0.5)] scale-105 z-40' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="absolute top-3 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${currentBlitz ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
            <span className={`text-[10px] uppercase font-black tracking-[0.2em] ${currentBlitz ? 'text-white' : 'text-slate-400'}`}>
              {currentBlitz ? 'Masterful Blitz Available' : 
               state.buffs.perfectBalanceStacks > 0 ? `Perfect Balance: ${state.beastChakra.length}/3` : 
               'Recommended Action'}
            </span>
          </div>
          
          {currentBlitz ? (
            <button 
              onClick={(e) => { e.stopPropagation(); executeSkill(currentBlitz); }}
              disabled={isGCD}
              className={`group relative mt-2 px-14 py-6 rounded-3xl font-black text-3xl border-4 border-white/80 overflow-hidden active:scale-95 transition-all ${currentBlitz.color}`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform" />
              <div className="relative flex flex-col items-center gap-1">
                <span className="text-5xl animate-bounce mb-1">{currentBlitz.icon}</span>
                <span className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tighter uppercase">{currentBlitz.name}</span>
              </div>
            </button>
          ) : (
            <div className={`mt-4 text-3xl font-black italic tracking-tighter ${recommendedSkillId === 'perfect_balance' ? 'text-indigo-400 animate-pulse text-4xl' : 'text-white'}`}>
              {MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name || '---'}
              {recommendedSkillId === 'perfect_balance' && <span className="block text-xs text-center mt-1 uppercase tracking-widest text-white/50">Use Perfect Balance!</span>}
            </div>
          )}
        </div>

        <StatsPanel state={state} feedback={feedback} isThinking={isThinking} />
        
        <div className="flex justify-center mt-2 opacity-30 hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); sounds.playClick(220); setState(INITIAL_ROTATION_STATE); }} className="text-[9px] px-5 py-2 bg-slate-800/50 text-slate-400 rounded-full border border-slate-700 active:bg-slate-700 uppercase tracking-widest font-bold">Reset Training</button>
        </div>
      </main>

      {/* Button Tray */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+var(--sab))] bg-slate-950/95 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          {/* oGCD / Abilities Row */}
          <div className="flex justify-center gap-2">
            {MONK_SKILLS.filter(s => s.isAbility).map(skill => {
              const isAvailable = skill.id === 'forbidden_chakra' ? state.chakraCount === 5 : true;
              const isRecommended = skill.id === recommendedSkillId;
              return (
                <button
                  key={skill.id}
                  onClick={(e) => { e.stopPropagation(); executeSkill(skill); }}
                  className={`flex flex-col items-center p-2 rounded-2xl border-2 ${skill.color} flex-1 max-w-[100px] shadow-lg active:scale-90 active:brightness-125 transition-all ${
                    !isAvailable ? 'opacity-20 grayscale pointer-events-none' : ''
                  } ${isRecommended ? 'ring-4 ring-white border-white scale-110 z-10 animate-pulse' : 'border-white/10'}`}
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap mt-1">{skill.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Main Combo Grid */}
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
        
        {/* Global Cool Down Progress Bar */}
        {isGCD && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 via-white to-cyan-400 animate-[gcd_1.95s_linear_forwards] shadow-[0_0_10px_#3b82f6]" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes gcd { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default App;
