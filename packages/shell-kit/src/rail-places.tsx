import { useMemo } from 'react';
import { Icon } from '@augur/kit-common';
import { BarTile } from './app-bar.js';
import { capUnder, FRAME_WORDS, iconOf, insideApp, placePath, UNDER_CAP, type FramePlace, type FrameUnderItem, type FrameWords } from './frame.js';

export interface RailPlacesProps {
  /** The app's places (`contributes.places`) the person may see on this floor, in the manifest's order. */
  places: readonly FramePlace[];
  /** What the app put under its places (`ctx.frame.under`), by place id. Only a place that `fills` shows it. */
  under?: Readonly<Record<string, readonly FrameUnderItem[]>>;
  /** How many things show under one place: the deployment's number, 50 unless it says. */
  cap?: number;
  /** Where in the app the person is, below its own address, so the place or thing there is marked. */
  current?: string;
  /** A place or a thing was chosen: its path below the app's own address, and the place it is or sits under. */
  onOpen: (path: string, place: string) => void;
  /** A place itself was chosen. Given, a place's tile calls this instead of `onOpen`. */
  onPlace?: (place: string) => void;
  /** The place the person is on, by id. Given, it marks the place instead of `current`. */
  currentPlace?: string;
  /** Something that needs the person is through this place. */
  lit?: (place: string) => boolean;
  /** …and it is the first thing that does: its light breathes. */
  lead?: (place: string) => boolean;
  /** The kit's words, where the shell or a deployment wants its own. */
  words?: Partial<FrameWords>;
}

/** Said once each: a path dropped again on the next draw isn't news. */
const told = new Set<string>();
const drop = (what: string) => {
  if (told.has(what)) return;
  told.add(what);
  console.warn(what);
};

/** The items an app may show: each one's path must stay inside the app. Any other is dropped, with why. */
function sound(place: FramePlace, items: readonly FrameUnderItem[] | undefined): FrameUnderItem[] {
  if (!place.fills || !items) return [];
  return items.filter((item) => {
    if (insideApp(item.path)) return true;
    drop(`Aerie: “${item.label}” under ${place.id} was dropped: its path “${item.path}” isn’t inside the app.`);
    return false;
  });
}

/**
 * A place whose own path leaves the app isn't drawn (the registry refuses such a manifest). When the shell
 * opens places by id (`onPlace`), a place with no path of its own and nothing under it needs no path.
 */
function placeInside(place: FramePlace, byId: boolean) {
  if (byId && place.path === undefined && !place.fills) return true;
  if (insideApp(placePath(place))) return true;
  drop(`Aerie: the place ${place.id} was dropped: its path “${placePath(place)}” isn’t inside the app.`);
  return false;
}

/**
 * The open app's places on the rail (spec 6.3; Shell principles, "The bar shows apps, the rail shows the
 * app's pages"), and under a place that fills, the things the app put there, a notebook or a case each.
 * What sits under a place is cut at the deployment's cap and ends with "and n more", which opens the place
 * so the app can show the rest. Every row is one of the rail's tiles, so the rail's arrow keys move
 * through them all. An app with one place and nothing under it shows no list: one child is the parent.
 * Goes inside `RailPages`.
 */
export function RailPlaces({ places, under, cap = UNDER_CAP, current, onOpen, onPlace, currentPlace, lit, lead, words }: RailPlacesProps) {
  const w = { ...FRAME_WORDS, ...words };
  const filled = useMemo(() => places.filter((p) => placeInside(p, !!onPlace)).map((p) => ({ place: p, items: sound(p, under?.[p.id]) })), [places, under, onPlace]);
  if (filled.length === 1 && !filled[0]!.items.length) return null;
  const here = (path: string) => current !== undefined && current === path;
  return (
    <>
      {filled.map(({ place, items }) => {
        const path = placePath(place);
        const { shown, more } = capUnder(items, cap);
        return (
          <div key={place.id} className="aerie-rail-place">
            <BarTile
              kind="page"
              icon={iconOf(place.icon) ?? 'list'}
              name={place.label}
              current={currentPlace !== undefined ? currentPlace === place.id : here(path)}
              lit={lit?.(place.id)}
              lead={lead?.(place.id)}
              onPress={() => (onPlace ? onPlace(place.id) : onOpen(path, place.id))}
            />
            {shown.length || more ? (
              <div className="aerie-rail-items" role="group" aria-label={place.label}>
                {shown.map((item, i) => {
                  const icon = iconOf(item.icon);
                  return (
                    <button
                      key={`${i}-${item.path}`}
                      type="button"
                      className="aerie-bar-tile aerie-rail-under"
                      aria-current={here(item.path) ? 'page' : undefined}
                      title={item.detail}
                      onClick={() => onOpen(item.path, place.id)}
                    >
                      {icon ? <Icon name={icon} /> : null}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {more ? (
                  <button type="button" className="aerie-bar-tile aerie-rail-more" onClick={() => onOpen(path, place.id)}>
                    <span>{w.andMore(more)}</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
