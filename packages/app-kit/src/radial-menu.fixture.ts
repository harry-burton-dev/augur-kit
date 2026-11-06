import type { RingAction, RingTouch } from './radial-menu.js';

/* Sample actions for the radial menu's stories: one document's verbs. Names and counts are examples. Not built. */

/** A document's verbs, each in its fixed direction, with targets, a preview, an unavailable one and a held one. */
export const documentActions: RingAction[] = [
  { id: 'open', label: 'Open', icon: 'arrow', slot: 'n' },
  {
    id: 'share',
    label: 'Share',
    icon: 'people',
    slot: 'ne',
    preview: (t) => ({ team: 'Already shared with your team', dept: '41 more people can read this', region: '230 more people can read this' })[t ?? ''] ?? 'Choose who can read it',
    targets: [
      { id: 'team', label: 'Your team', detail: '6 people', current: true },
      { id: 'dept', label: 'Department', detail: '41 people' },
      { id: 'region', label: 'Northern region', detail: '230 people' },
      { id: 'org', label: 'Everyone', disabled: true, reason: 'Only the region’s leads can share with everyone' },
    ],
  },
  { id: 'publish', label: 'Publish', icon: 'publish', slot: 'e', disabled: true, reason: 'It needs a review first', owner: 'Sam, its reviewer' },
  {
    id: 'move',
    label: 'Move',
    icon: 'folder',
    slot: 'se',
    preview: (t) => (t ? 'Two links to it will be updated' : 'Choose where it goes'),
    targets: [
      { id: 'sites', label: 'Sites', current: true },
      { id: 'people', label: 'People' },
      { id: 'weekly', label: 'Weekly updates' },
    ],
  },
  { id: 'delete', label: 'Delete', icon: 'delete', danger: true, preview: 'Three documents cite this one' },
  { id: 'history', label: 'History', icon: 'history', slot: 'sw' },
  { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
];

/** Three verbs: the ring keeps its eight directions and leaves the rest empty. */
export const fewActions: RingAction[] = [
  { id: 'open', label: 'Open', icon: 'arrow' },
  { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
  { id: 'delete', label: 'Delete', icon: 'delete', danger: true },
];

/** Eleven verbs, more than the ring has directions. */
export const manyActions: RingAction[] = [
  ...documentActions,
  { id: 'duplicate', label: 'Duplicate', icon: 'document' },
  { id: 'pin', label: 'Pin', icon: 'star' },
  { id: 'link', label: 'Copy link', icon: 'link' },
  { id: 'download', label: 'Download', icon: 'download' },
];

/** The other documents on the page, each marked with `useRingTouch` by its id. */
export const relatedDocuments: RingTouch[] = [
  { id: 'index', label: 'Policy index', effect: 'Link breaks' },
  { id: 'pack', label: 'Onboarding pack', effect: 'Loses a source' },
  { id: 'handbook', label: 'Staff handbook', effect: 'Link breaks' },
];

/** The same verbs, where Delete and Move name the other documents they touch, and Delete says how to undo it. */
export const touchingActions: RingAction[] = documentActions.map((a) => {
  if (a.id === 'delete') return { ...a, preview: 'Three documents cite this one', touches: relatedDocuments, undo: 'Undo for 30 s' };
  if (a.id === 'move') return { ...a, touches: (t?: string) => (t ? relatedDocuments.slice(0, 2).map((d) => ({ ...d, effect: 'Link updated' })) : []) };
  return a;
});
