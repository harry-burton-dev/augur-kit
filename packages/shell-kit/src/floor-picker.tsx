import { Icon } from '@augur/kit-common';
import { floorIconOf, floorKindOf, floorMeaning, floorStack, type ShellFloor } from './floors.js';
import type { ShellModel } from './shell-model.js';

/*
 * The floor picker: where you are among your floors, and the way to another one.
 *
 * How this file is laid out, top to bottom:
 *   1. FloorPicker   the whole picker: reads the model, lists the floors, top floor first
 *   2. FloorButton   one floor: its words (name, who sees it) and its round mark
 *
 * Its look is in floor-picker.css, beside this file. Every colour, size and duration there is a
 * token (packages/kit-common/tokens/). What a floor is called and who sees it comes from floors.ts.
 * To see it while you change it: Storybook, "Aerie / Floor picker".
 */

export interface FloorPickerProps {
  /** What the Shell knows: the floors, the one you're on, what waits on each, the open app. */
  model: ShellModel;
  /** 0 normally; -1 while the shell's menu is open, so Tab skips the picker. */
  tab: number;
}

/**
 * The floor picker at the right edge: one mark per floor from yours up to the top, the one you're
 * on lit in its colour, a dot where something waits, and the open app pinned beside your floor.
 * Pointing at it or tabbing into it opens it out to show each floor's name and who sees what's on it.
 */
export function FloorPicker({ model, tab }: FloorPickerProps) {
  if (!model.currentFloor) return null;

  // The floors to show, top floor first: the model keeps them bottom first.
  const floors = floorStack(model.floors, model.floor, model.lastTeam).reverse();
  const waiting = model.waitingByFloor();
  // Why the picker rests, when it does: the open app is the same on every floor.
  const rest = model.floorsRest;

  return (
    <nav className={`aerie-gauge${rest ? ' aerie-rest' : ''}`} aria-label="Floors" inert={model.isOpen}>
      {rest ? (
        <p className="aerie-why" id="floors-rest">
          <span>{rest}, so moving floors wouldn’t change it.</span>
        </p>
      ) : null}
      <ol>
        {floors.map((floor) => (
          <li key={floor.id}>
            <FloorButton
              floor={floor}
              here={floor.id === model.floor}
              waiting={waiting.get(floor.id) ?? 0}
              app={model.openNow}
              rest={rest}
              tab={tab}
              onGo={() => model.goToFloor(floor.id)}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface FloorButtonProps {
  floor: ShellFloor;
  /** You're on this floor. */
  here: boolean;
  /** How many things wait for you on this floor. */
  waiting: number;
  /** The app that's open, if one is. */
  app: { name: string; icon?: string } | undefined;
  /** Why floors can't be changed right now; empty when they can. */
  rest: string;
  tab: number;
  onGo: () => void;
}

/** One floor in the picker: its words, shown when the picker opens out, and its round mark. */
function FloorButton({ floor, here, waiting, app, rest, tab, onGo }: FloorButtonProps) {
  const name = floor.kind === 'personal' ? 'Your own floor' : floor.name;
  const said = [name, here ? 'you’re here' : '', waiting ? `${waiting} waiting` : ''].filter(Boolean).join(', ');

  return (
    <button
      tabIndex={tab}
      aria-label={said}
      aria-describedby={rest ? `floors-rest floor-${floor.id}` : `floor-${floor.id}`}
      aria-current={here ? 'location' : undefined}
      aria-disabled={rest && !here ? 'true' : undefined}
      data-waiting={waiting > 0 ? '' : undefined}
      onClick={() => !rest && onGo()}
    >
      {/* The words: hidden at rest, shown when the picker opens out. */}
      <span className="aerie-label" id={`floor-${floor.id}`}>
        <span>
          <b>
            {name} {here ? <em>You’re here</em> : waiting ? <em className="aerie-waiting">{waiting} waiting</em> : null}
          </b>
          <span>
            {floor.kind === 'team' ? `${floorKindOf(floor)}. ` : ''}
            {floorMeaning(floor)}
          </span>
          {here && app && !rest ? (
            <span className="aerie-bound">
              <Icon name={app.icon ?? 'apps'} size={14} />
              {app.name} is showing this floor
            </span>
          ) : null}
        </span>
      </span>

      {/* The open app, pinned beside the floor it's showing. */}
      {here && app ? (
        <span className="aerie-pinned" aria-hidden="true">
          <Icon name={app.icon ?? 'apps'} size={12} />
        </span>
      ) : null}

      {/* The round mark, with a dot when something waits here. */}
      <span className="aerie-notch">
        <Icon name={floorIconOf(floor)} size={14} />
        {waiting ? <span className="aerie-dot" /> : null}
      </span>
    </button>
  );
}
