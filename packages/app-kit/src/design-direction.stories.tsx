import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Dialog, Explain, Letterbox, Signal, UrgentEdge, type LetterboxAcknowledgement } from '@augur/kit-common';
import { AppFrame, RailLink } from './app-frame.js';
import { FocusField, FocusItem } from './focus.js';
import { PathTree, type PathNode } from './path-tree.js';
import type { RingAction, RingSubject } from './radial-menu.js';
import { KindTile, Tiles } from './tiles.js';

/**
 * The four design picks (PER-282 API, PER-283 visuals), each one switch away, as apps turn them on behind a
 * feature preview. Every story is the same small app; only the switches differ. Pending Harry's review.
 */

const TREE: PathNode[] = [
  {
    id: 'org',
    label: 'Organisation library',
    icon: 'library',
    count: 3,
    children: [
      {
        id: 'policy',
        label: 'Policy & Guidance',
        icon: 'folder',
        count: 4,
        children: [
          { id: 'security', label: 'Security', icon: 'folder', count: 2, needsYou: 'One standard waits for your review', children: [] },
          { id: 'people', label: 'People', icon: 'folder', count: 5, children: [] },
        ],
      },
      { id: 'weekly', label: 'Weekly updates', icon: 'series', count: 12, children: [] },
      { id: 'archive', label: 'Archive', icon: 'archive', count: 40, children: [] },
    ],
  },
  { id: 'team', label: 'Team library', icon: 'library', count: 6, children: [] },
];

/** A document's twelve verbs in the agreed directions: seven in slots, five behind More when `more` is on. */
const documentActions = (): RingAction[] => [
  { id: 'open', label: 'Open', icon: 'arrow', slot: 'n' },
  { id: 'share', label: 'Share', icon: 'people', slot: 'ne', preview: 'Choose who can read it' },
  {
    id: 'publish',
    label: 'Publish',
    icon: 'publish',
    slot: 'e',
    targets: [
      { id: 'team', label: 'Team', detail: '8 people', current: true },
      { id: 'dept', label: 'Department', detail: '49 people' },
      { id: 'org', label: 'Organisation', detail: '412 people', disabled: true, reason: 'Needs the policy owner’s approval' },
    ],
    preview: (t) => (t === 'dept' ? '41 more people can read this' : 'Publish it up a floor'),
  },
  { id: 'move', label: 'Move', icon: 'folder', slot: 'se' },
  { id: 'delete', label: 'Delete', icon: 'delete', danger: true, preview: 'Two documents cite this one; their links will say it was deleted' },
  { id: 'history', label: 'History', icon: 'clock', slot: 'sw' },
  { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
  { id: 'tags', label: 'Tags', icon: 'tag' },
  { id: 'copy', label: 'Make a copy', icon: 'plus' },
  { id: 'download', label: 'Download', icon: 'download' },
  { id: 'pin', label: 'Pin', icon: 'star' },
  { id: 'archive', label: 'Archive', icon: 'archive', disabled: true, reason: 'Only its owner can archive it', owner: 'Sam Ito' },
];

interface Picks {
  /** Focal planes: the needs-you tile pulls focus, the rest goes quiet, and a dialog racks the app back. */
  planes: boolean;
  /** Radial menu: past eight actions the ring keeps its slots and overflows into More. */
  radial: boolean;
  /** Urgent path: the see-through letterbox, with More for what doesn't fit, stepping back to the edge rule. */
  urgent: boolean;
  /** Lit path: the trail draws itself down to where you are. */
  lit: boolean;
}

function Example({ planes, radial, urgent, lit }: Picks) {
  const [path, setPath] = useState<string[]>(['org', 'policy']);
  const [said, setSaid] = useState('Right-click a tile or a row. Raise the urgent item from the button.');
  const [open, setOpen] = useState(false);
  const [edge, setEdge] = useState(false);
  const [ack, setAck] = useState<LetterboxAcknowledgement>();
  const [confirm, setConfirm] = useState(false);
  const ring = (label: string): RingSubject => ({
    label,
    actions: documentActions(),
    onAction: (id, target) => (id === 'delete' ? setConfirm(true) : setSaid(`${id}${target ? ` → ${target}` : ''}: ${label}`)),
    onAsk: (id) => setSaid(`Asked for ${id}: ${label}`),
  });
  const headline = 'Server 3 errors passed their limit; the 0.14 rollout halted at 2 of 5';
  const queue = { position: 1, total: 2, next: 'Disk 92% full on the Org server' };
  const goTo = (n: PathNode) => {
    const at = (nodes: PathNode[], trail: string[]): string[] | undefined => {
      for (const x of nodes) {
        if (x.id === n.id) return [...trail, x.id];
        const found = at(x.children ?? [], [...trail, x.id]);
        if (found) return found;
      }
      return undefined;
    };
    setPath(at(TREE, []) ?? path);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {edge && !open ? <UrgentEdge headline={headline} acknowledged={Boolean(ack)} queue={queue} onReopen={() => setOpen(true)} /> : null}
      <div style={{ flex: 1, minHeight: 0 }}>
        <AppFrame
          app={{ name: 'Artifacts', icon: 'library' }}
          onFront={() => setPath([])}
          screen={path.join('/') || 'front'}
          ringOverflow={radial ? 'more' : 'list'}
          railLabel="Libraries"
          rail={
            <>
              <RailLink icon="folder" label="Libraries" count={2} current onPress={() => setPath(['org'])} />
              <PathTree label="Libraries" nodes={TREE} path={path} onOpen={goTo} ringFor={(n) => ring(n.label)} trail={lit ? 'draw' : 'still'} />
            </>
          }
        >
          <h1 className="text-title-s">Policy &amp; Guidance</h1>
          <p className="text-meta text-ink-muted">
            <Signal kind="streak" count={3} label="to review" /> <Signal kind="bloom" label="Needs you" />
          </p>
          <FocusField pulled={planes} as="div">
            <Tiles label="Documents">
              <FocusItem>
                <KindTile kind="document" eyebrow="Document" name="Leave guidance" count="v4" onOpen={() => setSaid('Leave guidance')} ring={() => ring('Leave guidance')} />
              </FocusItem>
              <FocusItem pulled={planes}>
                <KindTile kind="document" eyebrow="Document" name="Access control standard" count="v2" state="In review" needs needsLabel="Needs your review" onOpen={() => setSaid('Access control standard')} ring={() => ring('Access control standard')} />
              </FocusItem>
              <FocusItem>
                <KindTile kind="document" eyebrow="Document" name="Code of conduct" count="v7" onOpen={() => setSaid('Code of conduct')} ring={() => ring('Code of conduct')} />
              </FocusItem>
            </Tiles>
          </FocusField>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            <Button kind="secondary" onPress={() => setOpen(true)}>
              Raise the urgent item
            </Button>
            <Button kind="tertiary" onPress={() => setConfirm(true)}>
              Open a decision
            </Button>
          </div>
          <p className="text-meta text-ink-muted" aria-live="polite">
            {said}
          </p>
        </AppFrame>
      </div>
      <Letterbox
        open={open}
        look={urgent ? 'see-through' : 'solid'}
        onStepBack={() => {
          setOpen(false);
          setEdge(true);
        }}
        acknowledged={ack}
        onAcknowledge={() => setAck({ by: 'Lee Park', at: '21:14' })}
        queue={queue}
        bars={{ top: <span>Upgrade · Org floor · Updater</span>, bottom: <span>Seen by Lee Park · resolves when errors stay under 1% for 5 minutes</span> }}
        eyebrow="Upgrade"
        heading={headline}
        summary="The bake stopped itself. Someone has to choose: roll back, retry, or hand it over."
        actions={
          <>
            <Button kind="primary" onPress={() => setOpen(false)}>
              Roll back to 0.13
            </Button>
            <Button onPress={() => setOpen(false)}>Retry server 3</Button>
          </>
        }
        more={
          urgent ? (
            <ul>
              <li>Server 1: 0.2% errors</li>
              <li>Server 2: 0.6% errors, a bump during the same step</li>
              <li>Server 3: 1.1% errors, over its 1% limit</li>
            </ul>
          ) : undefined
        }
      >
        <Explain
          what="Server 3's error rate rose to 1.1% during step 2, over its 1% limit."
          why="Two of five servers run 0.14 now; if it keeps rising, sign-ins start failing in about 20 minutes."
          canDo="Roll back, retry server 3, or hand it to the on-call admin."
          whoElse="Sam Ito is on call and has been told."
        />
      </Letterbox>
      <Dialog open={confirm} onClose={() => setConfirm(false)} heading="Delete it?" summary="A decision: the app racks back behind it rather than going black." actionLabel="Delete" danger />
    </div>
  );
}

const meta = {
  title: 'Design direction/The four picks',
  component: Example,
  parameters: { layout: 'fullscreen' },
  args: { planes: false, radial: false, urgent: false, lit: false },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every pick off: the app as it is today. */
export const AllOff: Story = {};

/** 1. Focal planes and the light language: the tile that needs you pulls focus, the rest goes quiet; "Open a decision" racks the app back. */
export const FocalPlanes: Story = { args: { planes: true } };

/** 2. The radial menu: twelve verbs, seven in their fixed directions and the rest behind More (north-west). Esc comes back out of More. */
export const RadialMenu: Story = { args: { radial: true } };

/** 3. The urgent path: the see-through letterbox with More, Acknowledge (A), and Esc stepping back to the edge rule. */
export const UrgentPath: Story = { args: { urgent: true } };

/** 4. The lit path: open a row in the rail and the trail draws itself down to where you are. */
export const LitPath: Story = { args: { lit: true } };

/** All four together, as an app with every preview on. */
export const AllFour: Story = { args: { planes: true, radial: true, urgent: true, lit: true } };
