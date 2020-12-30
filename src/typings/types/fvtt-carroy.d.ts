declare class FormDataExtended {
  constructor(form: HTMLFormElement | HTMLElement, editors?: Array, dtypes?: Object);

  toObject();
}

declare const DEFAULT_TOKEN: string;

declare interface RollOptions {
  parts?: any[];
  data?: any;
  event?: Event | any;
  rollMode?: string | null;
  template?: string | null;
  title?: string | null;
  speaker?: any;
  flavor?: string | null;
  fastForward?: boolean | null;
  dialogOptions?: any;
  advantage?: boolean | null;
  disadvantage?: boolean | null;
  critical?: number | null;
  fumble?: number | null;
  targetValue?: number | null;
  chatMessage?: boolean | null;
  messageData?: any;
}

declare interface RollDialog {
  template?: string | null;
  title?: string | null;
  parts?: string[];
  allowCritical?: boolean | null;
  data?: any;
  rollMode?: any;
  dialogOptions?: any;
  roll?: Function;
}

declare interface DamageRoll {
  parts?: string[];
  actor?: Actor;
  data?: any;
  event?: Event | any;
  rollMode?: string | null;
  template?: string;
  title?: string;
  speaker?: any;
  flavor?: any;
  allowCritical?: boolean;
  critical?: boolean;
  criticalBonusDice?: number;
  criticalMultiplier?: number;
  fastForward?: boolean | null;
  dialogOptions?: any;
  chatMessage?: boolean;
  messageData?: any;
  options?: Record<string, any>;
}

declare interface ChatData {
  user: string;
  type: number;
  content: HTMLElement;
  flavor: string;
  speaker: any;
  flags: Record<string, any>;
}

declare async function fromUuid(uuid: string);
