/**
 * A thing on the page that has actions: its kind, as the app's manifest names it in `contributes.radial`,
 * its id and its label. The shell opens the radial menu on whatever carries the mark (the app contract,
 * 6.4), so a part draws it as `data-thing`, `data-thing-id` and `data-thing-label` on its own element.
 */
export interface ThingMark {
  /** Its kind: a short word in lower case ("note"), as `contributes.radial` names it. */
  kind: string;
  /** The app's own id for it; the item's or row's id if left out. */
  id?: string;
  /** What it is called in the ring; the item's title or name if left out. */
  label?: string;
}

/** Said once each: a bad kind on every row of a long list isn't news after the first. */
const told = new Set<string>();

/** A kind as the manifest names one: lower case, a letter first, at most 40. */
const KIND = /^[a-z][a-z0-9-]{0,39}$/;

/** The attributes that mark a thing, or none when it has no mark or its kind isn't a short word. */
export function thingProps(thing: ThingMark | undefined, own: { id?: string; label?: string }): Record<string, string> {
  if (!thing) return {};
  if (typeof thing.kind !== 'string' || !KIND.test(thing.kind)) {
    const kind = String(thing.kind).slice(0, 60);
    if (!told.has(kind)) {
      told.add(kind);
      console.warn(`Quill: the thing mark “${kind}” was dropped: a kind is a short word in lower case, as the manifest names it.`);
    }
    return {};
  }
  const id = thing.id ?? own.id;
  const label = thing.label ?? own.label;
  return { 'data-thing': thing.kind, ...(id ? { 'data-thing-id': id } : {}), ...(label ? { 'data-thing-label': label } : {}) };
}
