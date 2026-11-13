import React from "react";
import { Composition } from "remotion";
import { LESSONS, timelineFor } from "./lessons";
import { LessonVideo } from "./LessonVideo";
import { FPS, HEIGHT, WIDTH } from "./theme";

/** One composition per lesson: lesson-01 … lesson-06. */
export const RemotionRoot: React.FC = () => (
  <>
    {LESSONS.map((l) => (
      <Composition
        key={l.id}
        id={l.id}
        component={LessonVideo}
        durationInFrames={timelineFor(l.id).total}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ lessonId: l.id }}
      />
    ))}
  </>
);
