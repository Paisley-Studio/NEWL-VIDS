// Narration timings written by scripts/production/generate_narration.py
import t1 from "./lesson-01.timing.json";
import t2 from "./lesson-02.timing.json";
import t3 from "./lesson-03.timing.json";
import t4 from "./lesson-04.timing.json";
import t5 from "./lesson-05.timing.json";
import t6 from "./lesson-06.timing.json";

export const timings: Record<string, unknown> = {
  "lesson-01": t1,
  "lesson-02": t2,
  "lesson-03": t3,
  "lesson-04": t4,
  "lesson-05": t5,
  "lesson-06": t6,
};
