export type Box = [number, number, number, number];
export type Target = Box | string;

export type Highlight = { box?: Box; target?: string; label?: string };
export type TypeAction = { box?: Box; target?: string; text: string; multiline?: boolean };
export type CursorAction = { to: [number, number] | string; click?: boolean };
export type Callout = { icon?: string; title: string; body: string; pos?: "right" | "left" | "bottom" };

export type ReplicaState = {
  role?: "admin" | "tl";
  page?: "project" | "logs";
  tab?: "overview" | "casuals" | "logs" | "financials";
  tl?: string;
  casuals?: boolean;
  logs?: boolean;
  expense?: boolean;
  modal?: null | "daily-log" | "expense" | "complete";
  checked?: number[];
};

export type Beat = {
  text: string;
  pause?: number;
  // screen / replica
  cam?: "full" | Box | string;
  image?: string;
  hl?: Highlight[];
  cursor?: CursorAction;
  type?: TypeAction[];
  check?: Box[];
  callout?: Callout;
  state?: Partial<ReplicaState>;
  sfx?: string[];
  // diagrams / closing
  show?: number | number[];
  focus?: number;
  footer?: boolean;
  next?: boolean;
};

export type Scene = {
  id: string;
  kind: "opening" | "screen" | "replica" | "diagram" | "closing" | "credits";
  chapter: string;
  image?: string;
  state?: ReplicaState;
  diagram?: string;
  data?: any;
  topics?: string[];
  takeaways?: string[];
  next?: string;
  beats: Beat[];
};

export type Lesson = {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  theme: string;
  accent: string;
  audience: string[];
  description: string;
  objectives: string[];
  scenes: Scene[];
};

export type Word = { t: number; d: number; w: string };
export type BeatTiming = { file: string; duration: number; words: Word[] };
export type LessonTiming = { lesson: string; voice: string; rate: string; beats: Record<string, BeatTiming> };

export type TimedBeat = Beat & {
  key: string;
  /** frames relative to scene start */
  start: number;
  dur: number;
  end: number;
  /** visuals lead narration slightly */
  vStart: number;
  audio?: string;
  words: Word[];
};

export type TimedScene = Omit<Scene, "beats"> & {
  index: number;
  start: number;
  duration: number;
  beats: TimedBeat[];
};

export type Timeline = {
  lesson: Lesson;
  scenes: TimedScene[];
  total: number;
  hasAudio: boolean;
};
