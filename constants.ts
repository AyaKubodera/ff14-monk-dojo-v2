
import { Form, Skill, BeastChakraType, RotationState } from './types';

export const MONK_SKILLS: Skill[] = [
  {
    id: 'pouncing_barrage',
    name: '猿舞連撃',
    formRequired: [Form.OpoOpo, Form.Formless, Form.None],
    formGranted: Form.Raptor,
    beastChakraGranted: BeastChakraType.Opo,
    icon: '🐒',
    color: 'bg-yellow-500'
  },
  {
    id: 'dragon_kick',
    name: '双竜脚',
    formRequired: [Form.OpoOpo, Form.Formless, Form.None],
    formGranted: Form.Raptor,
    beastChakraGranted: BeastChakraType.Opo,
    icon: '🐉',
    color: 'bg-yellow-600'
  },
  {
    id: 'dragon_jaw',
    name: '竜頷正拳撃',
    formRequired: [Form.Raptor, Form.Formless],
    formGranted: Form.Coeurl,
    beastChakraGranted: BeastChakraType.Raptor,
    icon: '🐲',
    color: 'bg-orange-500'
  },
  {
    id: 'twin_snakes',
    name: '双掌打',
    formRequired: [Form.Raptor, Form.Formless],
    formGranted: Form.Coeurl,
    beastChakraGranted: BeastChakraType.Raptor,
    icon: '🐍',
    color: 'bg-orange-600'
  },
  {
    id: 'tiger_claw',
    name: '虎襲崩拳',
    formRequired: [Form.Coeurl, Form.Formless],
    formGranted: Form.OpoOpo,
    beastChakraGranted: BeastChakraType.Coeurl,
    icon: '🐅',
    color: 'bg-red-500'
  },
  {
    id: 'demolish',
    name: '破砕拳',
    formRequired: [Form.Coeurl, Form.Formless],
    formGranted: Form.OpoOpo,
    beastChakraGranted: BeastChakraType.Coeurl,
    icon: '💥',
    color: 'bg-red-600'
  },
  {
    id: 'forbidden_chakra',
    name: '陰陽闘気斬',
    formRequired: [],
    formGranted: Form.None,
    isAbility: true,
    icon: '⚡',
    color: 'bg-yellow-400 text-black'
  },
  {
    id: 'perfect_balance',
    name: '踏鳴',
    formRequired: [],
    formGranted: Form.None,
    isAbility: true,
    icon: '⚖️',
    color: 'bg-indigo-600'
  },
  {
    id: 'riddle_of_fire',
    name: '紅蓮の極意',
    formRequired: [],
    formGranted: Form.None,
    isAbility: true,
    icon: '🔥',
    color: 'bg-red-800'
  },
  {
    id: 'winds_of_reply',
    name: '真空波',
    formRequired: [],
    formGranted: Form.None,
    isAbility: true,
    icon: '🌪️',
    color: 'bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
  }
];

/**
 * LV100 黄金のレガシー版 最新オープナー
 * 真空波（Winds of Reply）を含む
 */
export const OPENER_SEQUENCE = [
  'dragon_kick',
  'twin_snakes',
  'demolish',
  'riddle_of_fire',
  'perfect_balance',
  'dragon_kick',
  'pouncing_barrage',
  'dragon_kick',
  'elixir_burst', 
  'winds_of_reply'
];

export const INITIAL_ROTATION_STATE: RotationState = {
  currentForm: Form.Formless,
  buffs: {
    disciplinedFist: 0,
    leadenFist: false,
    demolishDoT: 0,
    riddleOfFire: 0,
    perfectBalanceStacks: 0
  },
  beastChakra: [],
  nadi: [],
  chakraCount: 0,
  comboCount: 0,
  history: [],
  phase: 'opener'
};
