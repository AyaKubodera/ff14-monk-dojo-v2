
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, RotationState, Skill, BeastChakraType, NadiType } from './types';
import { MONK_SKILLS, INITIAL_ROTATION_STATE } from './constants';
import SkillButton from './components/SkillButton';
import StatsPanel from './components/StatsPanel';
import { getMonkFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<RotationState>(INITIAL_ROTATION_STATE);
  const [feedback, setFeedback] = useState<string>("演武開始。紅蓮の極意と踏鳴を使いこなし、必殺技を叩き込め！");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isGCD, setIsGCD] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

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
    if (types.size === 3) return { id: 'rising_phoenix', name: '鳳凰の舞', icon: '🔥', color: 'bg-orange-500' };
    if (types.size === 1) return { id: 'elixir_field', name: '蒼気砲', icon: '🌀', color: 'bg-blue-500' };
    return { id: 'celestial_revolution', name: '天回転', icon: '💫', color: 'bg-slate-500' };
  }, [state.beastChakra, state.nadi]);

  const recommendedSkillId = useMemo(() => {
    if (currentBlitz) return currentBlitz.id;
    const { currentForm, buffs, beastChakra } = state;
    if (buffs.perfectBalanceStacks > 0) {
      const types = new Set(beastChakra);
      if (beastChakra.length < 3) {
        if (!types.has(BeastChakraType.Opo)) return 'dragon_kick';
        if (!types.has(BeastChakraType.Raptor)) return 'twin_snakes';
        if (!types.has(BeastChakraType.Coeurl)) return 'demolish';
      }
    }
    if (currentForm === Form.OpoOpo || currentForm === Form.Formless || currentForm === Form.None) {
      return buffs.leadenFist ? 'bootshine' : 'dragon_kick';
    }
    if (currentForm === Form.Raptor) {
      return buffs.disciplinedFist < 7 ? 'twin_snakes' : 'true_strike';
    }
    if (currentForm === Form.Coeurl) {
      return buffs.demolishDoT < 5 ? 'demolish' : 'snap_punch';
    }
    return null;
  }, [state, currentBlitz]);

  const triggerError = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 300);
    setFeedback("コンボミス！型を確認せよ。");
    if (navigator.vibrate) navigator.vibrate(50); // スマホのバイブ機能
  };

  const executeSkill = useCallback((skill: Skill | any) => {
    if (!skill.isAbility && isGCD) return;
    if (!skill.isAbility && state.buffs.perfectBalanceStacks === 0) {
      if (!skill.formRequired.includes(state.currentForm)) {
        triggerError();
        return;
      }
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

      if (skill.id === 'riddle_of_fire') {
        newBuffs.riddleOfFire = 20;
        return { ...prev, buffs: newBuffs, history: [...prev.history, skill.name] };
      }
      if (skill.id === 'perfect_balance') {
        newBuffs.perfectBalanceStacks = 3;
        return { ...prev, buffs: newBuffs, history: [...prev.history, skill.name] };
      }
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

      if (newBuffs.perfectBalanceStacks > 0) {
        if (skill.beastChakraGranted) newBeastChakra.push(skill.beastChakraGranted);
        newBuffs.perfectBalanceStacks--;
        nextForm = newBuffs.perfectBalanceStacks === 0 ? Form.None : Form.Formless;
      }

      return {
        ...prev,
        currentForm: nextForm,
        buffs: newBuffs,
        beastChakra: newBeastChakra,
        history: [...prev.history, skill.name]
      };
    });
  }, [isGCD, state]);

  useEffect(() => {
    if (state.history.length > 0 && state.history.length % 8 === 0) {
      const updateFeedback = async () => {
        setIsThinking(true);
        const advice = await getMonkFeedback(state.history, state.currentForm);
        setFeedback(advice);
        setIsThinking(false);
      };
      updateFeedback();
    }
  }, [state.history.length]);

  return (
    <div className={`fixed inset-0 transition-colors duration-300 ${isError ? 'bg-red-950' : 'bg-[#020617]'} text-slate-100 p-4 safe-pt flex flex-col items-center select-none overflow-hidden`}>
      <header className="w-full max-w-lg flex flex-col items-center mb-2">
        <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
          MONK DOJO LV100
        </h1>
      </header>

      <main className="w-full max-w-lg flex flex-col gap-3 flex-1 overflow-y-auto pb-48">
        <div className="flex flex-col items-center py-3 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Recommended Action</span>
          {currentBlitz ? (
            <button 
              onClick={() => executeSkill(currentBlitz)}
              disabled={isGCD}
              className={`px-8 py-2 rounded-xl font-black text-lg shadow-2xl animate-bounce border-2 border-white/50 ${currentBlitz.color}`}
            >
              {currentBlitz.icon} {currentBlitz.name}
            </button>
          ) : (
            <div className="text-lg font-black text-white animate-pulse">
              {MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name || '...'}
            </div>
          )}
        </div>

        <StatsPanel state={state} feedback={feedback} isThinking={isThinking} />
        
        <div className="flex justify-center">
          <button onClick={() => setState(INITIAL_ROTATION_STATE)} className="text-[10px] px-3 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700">RESET</button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+var(--sab))] bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <div className="flex justify-center gap-3">
            {MONK_SKILLS.filter(s => s.isAbility).map(skill => (
              <button
                key={skill.id}
                onClick={() => executeSkill(skill)}
                className={`flex flex-col items-center p-1.5 rounded-lg border border-white/10 ${skill.color} w-24 shadow-lg active:scale-95`}
              >
                <span className="text-lg">{skill.icon}</span>
                <span className="text-[8px] font-bold uppercase">{skill.name}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1">
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
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/20"><div className="h-full bg-blue-400 animate-[gcd_1.95s_linear_forwards]" /></div>
        )}
      </div>

      <style>{`
        @keyframes gcd { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default App;
