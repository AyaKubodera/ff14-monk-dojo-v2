
import React from 'react';
import { Skill, Form } from '../types';

interface SkillButtonProps {
  skill: Skill;
  currentForm: Form;
  onClick: (skill: Skill) => void;
  disabled: boolean;
  isRecommended: boolean;
}

const SkillButton: React.FC<SkillButtonProps> = ({ skill, currentForm, onClick, disabled, isRecommended }) => {
  const isCorrectForm = skill.formRequired.includes(currentForm);
  
  return (
    <button
      onClick={() => onClick(skill)}
      disabled={disabled}
      className={`
        relative w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-100 touch-manipulation
        ${skill.color} shadow-lg
        ${isCorrectForm ? 'brightness-110' : 'opacity-40 grayscale-[0.5]'}
        ${isRecommended ? 'ring-4 ring-white animate-pulse z-20 scale-105' : 'border border-white/20'}
        ${disabled ? 'cursor-not-allowed opacity-80' : 'active:scale-90'}
      `}
    >
      <span className="text-3xl md:text-4xl mb-1">{skill.icon}</span>
      <span className="text-[10px] md:text-xs font-bold text-center leading-tight drop-shadow-md">
        {skill.name}
      </span>
      {isRecommended && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-1.5 rounded-full uppercase">
          NEXT
        </div>
      )}
    </button>
  );
};

export default SkillButton;
