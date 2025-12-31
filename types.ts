
export enum Form {
  None = 'None',
  OpoOpo = '壱の型',
  Raptor = '弐の型',
  Coeurl = '参の型',
  Formless = '無型の境地'
}

export enum BeastChakraType {
  Opo = 'Opo',
  Raptor = 'Raptor',
  Coeurl = 'Coeurl'
}

export enum NadiType {
  Lunar = 'Lunar',
  Solar = 'Solar'
}

export interface Skill {
  id: string;
  name: string;
  formRequired: Form[];
  formGranted: Form;
  beastChakraGranted?: BeastChakraType;
  isAbility?: boolean;
  icon: string;
  color: string;
}

export interface BuffStatus {
  disciplinedFist: number;
  leadenFist: boolean;
  demolishDoT: number;
  riddleOfFire: number;
  perfectBalanceStacks: number;
}

export interface RotationState {
  currentForm: Form;
  buffs: BuffStatus;
  beastChakra: BeastChakraType[];
  nadi: NadiType[];
  chakraCount: number;
  comboCount: number;
  history: string[];
  phase: 'opener' | 'standard';
}
