// Data Atlas's doors, as configuration: the first user of the door gallery (round 6's proposed home: the ask
// line on top, then these four). Used by the scorer's corpus replay and the gallery's stories.
import type { DoorDescriptor } from './doors.js';

export const ATLAS_DOORS: DoorDescriptor[] = [
  { id: 'get-ready', name: 'Get ready for a meeting', line: 'A short brief on what you will discuss', icon: 'calendar', reads: ['meeting', 'due'], order: 1 },
  { id: 'changed', name: 'See what has changed', line: 'Since you last looked, on what you follow', icon: 'history', reads: ['change', 'moved', 'incident'], order: 2, firstDay: 'Follow a few things and their changes show here' },
  { id: 'put-right', name: 'Put something right', line: 'Something here looks wrong or out of date', icon: 'rename', reads: ['contradiction', 'queue'], order: 3 },
  { id: 'keep-an-eye', name: 'Keep an eye on something', line: 'Hear when it changes', icon: 'star', reads: ['coming'], order: 4, firstDay: "Follow your floor's most-read things" },
];

/** As AUGUR is today: it has no calendar, so the meeting door stays and says why. */
export const ATLAS_DOORS_TODAY: DoorDescriptor[] = ATLAS_DOORS.map((d) =>
  d.id === 'get-ready' ? { ...d, unavailable: { why: 'AUGUR has no calendar yet', who: 'Your administrator' } } : d,
);

/** A fifth door, added from configuration alone. */
export const QUESTIONS_DOOR: DoorDescriptor = {
  id: 'questions',
  name: 'Answer what you were asked',
  line: 'Questions people sent you',
  icon: 'messages',
  reads: ['question'],
  order: 5,
};

/** Doors past the round 6 cap, for the overflow story: the extras go to the ring. */
export const MORE_DOORS: DoorDescriptor[] = [
  QUESTIONS_DOOR,
  { id: 'new-here', name: 'See what is new here', line: 'New things on your floor', icon: 'plus', reads: ['new-thing'], order: 6 },
  { id: 'due-soon', name: 'Check what is due', line: 'Plan steps due in the next two days', icon: 'clock', reads: ['due'], order: 7 },
];
