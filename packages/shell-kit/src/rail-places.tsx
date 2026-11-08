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
  /** A place or a thing was chosen: its path below the app's own address. */
  onOpen: (path: string) => void;
  /** The kit's words, where the shell or a deployment wants its own. */
  words?: Partial<FrameWords>;
}

/** The items an app may show: each one's path must stay inside the app. Any other is dropped, with why. */
function sound(place: FramePlace, items: readonly FrameUnderItem[] | undefined): FrameUnderItem[] {
  if (!place.fills || !items) return [];
  return items.filter((item) => {
    if (insideApp(item.path)) return true;
    console.warn(`Aerie: “${item.label}” under ${place.id} was dropped: its path “${item.path}” isn’t inside the app.`);
    return false;
  });
}

/**
 * The open app's places on the rail (spec 6.3; Shell principles, "The bar shows apps, the rail shows the
 * app's pages"), and under a place that fills, the things the app put there, a notebook or a case each.
 * What sits under a place is cut at the deployment's cap and ends with "and n more", which opens the place
 * so the app can show the rest. Every row is one of the rail's tiles, so the rail's arrow keys move
 * through them all. An app with one place and nothing under it shows no list: one child is the parent.
 * Goes inside `RailPages`.
 */
export function RailPlaces({ places, under, cap = UNDER_CAP, current, onOpen, words }: RailPlacesProps) {
  const w = { ...FRAME_WORDS, ...words };
  const filled = useMemo(() => places.map((p) => ({ place: p, items: sound(p, under?.[p.id]) })), [places, under]);
  if (filled.length === 1 && !filled[0]!.items.length) return null;
  const here = (path: string) => current !== undefined && current === path;
  return (
    <>
      {filled.map(({ place, items }) => {
        const path = placePath(place);
        const { shown, more } = capUnder(items, cap);
        return (
          <div key={place.id} className="aerie-rail-place">
            <BarTile kind="page" icon={iconOf(place.icon) ?? 'list'} name={place.label} current={here(path)} onPress={() => onOpen(path)} />
            {shown.length ? (
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
                      onClick={() => onOpen(item.path)}
                    >
                      {icon ? <Icon name={icon} /> : null}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {more ? (
                  <button type="button" className="aerie-bar-tile aerie-rail-more" onClick={() => onOpen(path)}>
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
