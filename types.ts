
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
  isAbility?: boolean; // oGCD
  icon: string;
  color: string;
}

export interface BuffStatus {
  disciplinedFist: number; // 功力
  leadenFist: boolean;      // 連撃効果アップ
  demolishDoT: number;    // 破砕
  riddleOfFire: number;   // 紅蓮の極意
  perfectBalanceStacks: number; // 踏鳴スタック
}

export interface RotationState {
  currentForm: Form;
  buffs: BuffStatus;
  beastChakra: BeastChakraType[];
  nadi: NadiType[];
  comboCount: number;
  history: string[];
}
