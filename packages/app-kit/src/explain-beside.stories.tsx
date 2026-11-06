import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Explain } from '@augur/kit-common';
import { List } from './list.js';

const ITEMS = [
  { id: 'upgrade', label: 'Upgrade to 0.14.0', what: 'The upgrade to 0.14.0 failed its health watch.', why: 'Two of your sites are serving errors to about 40 people.', canDo: 'Roll the two back to 0.13.2, or open the watch to see why.', whoElse: 'Lee Park can also roll back. Nobody else is on call.' },
  { id: 'backups', label: 'Backups', what: 'The last three nightly backups stopped at the storage step.', why: 'If the server fails now, anything changed since Monday is lost.', canDo: 'Run a backup now, or open Upgrade Centre to see the storage step.', whoElse: 'Sam Ito, the Org admin, is on call and has seen it.' },
  { id: 'disk', label: 'Disk 92% full', what: 'The Org server’s disk is 92% full.', why: 'Uploads stop at 98%, in about four days at this rate.', canDo: 'Archive old versions, or ask for more space.', whoElse: 'Nobody else can act on this.' },
];

/**
 * Explain beside an item. Pick an item in a list and its explanation stands in a column to its right, so the
 * list stays where it is and all four parts show without scrolling. Open a row (Enter, or press it) to explain it. The pattern Harry picked for Explain
 * (Rule, 6 Nov 2026); inside a Letterbox the same part sits in the frame instead.
 */
function ExplainBeside() {
  const [picked, setPicked] = useState(ITEMS[0].id);
  const item = ITEMS.find((i) => i.id === picked) ?? ITEMS[0];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: 'var(--space-5)', width: 'var(--measure-wide)' }}>
      <List
        label="Needs attention"
        noun={['item', 'items']}
        bar={false}
        items={ITEMS.map((i) => ({ id: i.id, title: i.label, status: 'needs' as const, meta: i.id === picked ? 'Shown' : undefined }))}
        onOpen={(i) => setPicked(i.id)}
      />
      <Explain what={item.what} why={item.why} canDo={item.canDo} whoElse={item.whoElse} />
    </div>
  );
}

const meta = { title: 'Patterns/Explain beside an item', component: ExplainBeside, parameters: { layout: 'centered' } } satisfies Meta<typeof ExplainBeside>;
export default meta;

export const Beside: StoryObj<typeof meta> = {};
