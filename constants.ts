
import { Form, Skill, BeastChakraType } from './types';

export const MONK_SKILLS: Skill[] = [
  // Opo-opo
  {
    id: 'bootshine',
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
  // Raptor
  {
    id: 'true_strike',
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
  // Coeurl
  {
    id: 'snap_punch',
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
  // oGCDs / Abilities
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
  }
];

export const INITIAL_ROTATION_STATE = {
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
  comboCount: 0,
  history: []
};
