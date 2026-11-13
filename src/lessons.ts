import l1 from "../scripts/narration/lesson-01.json";
import l2 from "../scripts/narration/lesson-02.json";
import l3 from "../scripts/narration/lesson-03.json";
import l4 from "../scripts/narration/lesson-04.json";
import l5 from "../scripts/narration/lesson-05.json";
import l6 from "../scripts/narration/lesson-06.json";
import { timings } from "./generated";
import { buildTimeline } from "./timeline";
import type { Lesson, LessonTiming, Timeline } from "./types";

export const LESSONS = [l1, l2, l3, l4, l5, l6] as unknown as Lesson[];

export const timelineFor = (id: string): Timeline => {
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) throw new Error(`Unknown lesson ${id}`);
  const timing = (timings as Record<string, LessonTiming | null>)[id] ?? null;
  return buildTimeline(lesson, timing);
};
