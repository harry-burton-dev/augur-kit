import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RemoteRootElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver, type QuillReceiver } from './receiver.js';
import { defineQuillElements } from './elements.js';

/**
 * What an app's sandbox describes, drawn by the host with the real kit (the app contract, 6.7). The
 * sandbox builds a tree of Quill's remote elements (`quill-page-head`, `quill-list`, …) with plain
 * properties; the host keeps it in a receiver and draws it here. Anything outside the vocabulary is
 * dropped with a reason. In the shell the tree comes from a worker over the bridge; here it is built
 * on the page, the same tree without the worker.
 */
const meta = {
  title: 'Quill/Remote screen',
  component: QuillRemote,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof QuillRemote>;
export default meta;
type Story = StoryObj<typeof meta>;

const ensureElements = () => {
  defineQuillElements();
  if (!customElements.get('remote-root')) customElements.define('remote-root', RemoteRootElement);
};

/** A sandbox's tree, built once and connected to a fresh receiver. */
function useSandbox(build: () => HTMLElement[]): QuillReceiver {
  const [receiver] = useState(() => {
    ensureElements();
    const made = createQuillReceiver();
    const root = document.createElement('remote-root') as RemoteRootElement;
    root.append(...build());
    root.connect(made.connection as never);
    return made;
  });
  return receiver;
}

function Notes() {
  const receiver = useSandbox(() => {
    const head = document.createElement('quill-page-head');
    head.heading = 'Recent notes';
    head.summary = 'Three notes changed this week';
    head.actions = [{ id: 'note.new', label: 'New note', kind: 'primary' }];
    const list = document.createElement('quill-list');
    list.label = 'Recent notes';
    list.noun = ['note', 'notes'];
    list.items = [
      { id: 'n1', title: 'Rota for the night shift', detail: 'Team floor', meta: '2 h ago' },
      { id: 'n2', title: 'Questions for Thursday', detail: 'Personal', meta: 'Yesterday' },
      { id: 'n3', title: 'Handover checklist', detail: 'Team floor', meta: 'Mon' },
    ];
    const picked = document.createElement('quill-state');
    picked.heading = 'Pick a note to read it.';
    picked.size = 'line';
    list.addEventListener('open', (e) => {
      picked.heading = `You picked ${(e as CustomEvent<string>).detail}.`;
    });
    return [head, list, picked];
  });
  return <QuillRemote receiver={receiver} />;
}

/** A page head, a list and a line under it: opening a row sends its id back to the sandbox, which changes the line. */
export const Screen: Story = { args: { receiver: createQuillReceiver() }, render: () => <Notes /> };

function Dropped() {
  const [reasons, setReasons] = useState<string[]>([]);
  const receiver = useSandbox(() => {
    const frame = document.createElement('iframe');
    frame.title = 'Not in the kit';
    const kept = document.createElement('quill-notice');
    kept.tone = 'info';
    kept.heading = 'Only the kit draws here.';
    kept.append('The frame above was dropped, and the console says why.');
    return [frame, kept];
  });
  return (
    <>
      <QuillRemote receiver={receiver} onDrop={(reason) => setReasons((was) => (was.includes(reason) ? was : [...was, reason]))} />
      <ul aria-label="Dropped">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  );
}

/** An element outside the vocabulary (an iframe here) is dropped with what's inside it; the rest still draws. */
export const OutsideTheVocabulary: Story = { args: { receiver: createQuillReceiver() }, render: () => <Dropped /> };

function Health() {
  const receiver = useSandbox(() => {
    const checks = document.createElement('quill-check-list');
    checks.label = 'Health';
    checks.rows = [
      { id: 'services', title: 'Services', detail: 'All 9 answering', tone: 'ok', action: { label: 'See' } },
      { id: 'backup', title: 'Backup', detail: 'None in the last 3 days', tone: 'needs', action: { label: 'Back up now' } },
      { id: 'disk', title: 'Disk space', detail: '91% used on the data disk', tone: 'problem', action: { label: 'See' } },
    ];
    const steps = document.createElement('quill-step-list');
    steps.label = 'Going back a release';
    steps.steps = [
      { id: 'backup', title: 'Back up', detail: 'So nothing is lost going back', done: true, action: 'Back up again' },
      { id: 'back', title: 'Go back to 0.23.1', detail: 'The services restart one at a time', action: 'Go back' },
      { id: 'tell', title: 'Tell people', unavailable: 'There’s no way to tell them from here yet.' },
    ];
    const history = document.createElement('quill-paged-list');
    history.label = 'History';
    history.pageSize = 3;
    history.total = 14;
    history.noun = 'upgrades';
    history.items = ['0.24.0', '0.23.1', '0.23.0', '0.22.2', '0.22.1'].map((v, i) => ({ id: v, title: `Upgraded to ${v}`, detail: `${i + 2} Nov`, status: i === 0 ? ('failed' as const) : ('done' as const) }));
    history.addEventListener('more', () => undefined);
    history.addEventListener('open', () => undefined);
    return [checks, steps, history];
  });
  return <QuillRemote receiver={receiver} />;
}

/** Checks with the one that needs you lit, a way through one job, and history a page at a time: Common's parts, described by an app. */
export const ChecksStepsAndPages: Story = { args: { receiver: createQuillReceiver() }, render: () => <Health /> };
