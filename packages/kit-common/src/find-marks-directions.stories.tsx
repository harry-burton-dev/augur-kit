import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from './button.js';
import { Icon } from './icon.js';
import './find-marks-directions.stories.css';

/**
 * Round E directions (6 Nov 2026): the search field, links, key caps, loading placeholders and the busy
 * mark, in three original directions to pick from. What Harry has already settled holds in all three:
 * one search field everywhere (the shell may keep its own, defined in Aerie), and it searches as you
 * type; links are never underlined, and a link that leaves AUGUR looks the same as one that stays.
 *
 * - **A · Groove** grows from the horizon's line (Divider, Progress): things sit on a cut line rather than
 *   in a box, loading is grooves where the words will be, and busy is the line running.
 * - **B · Key** grows from Keycap and Well: search is a well, a key cap is a real small key, loading is
 *   empty wells in the shape of what comes, and busy holds the key down.
 * - **C · Readout** grows from the Stamp and the mono labels: search reads like a prompt with its count
 *   printed under it, loading is a quiet line of words and dashes, and busy counts the seconds.
 *
 * This page goes away once one is picked; the pick is built as real parts with their own story pages.
 */
const meta = {
  title: 'Common/Directions/Find and small marks',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const NAMES = ['Harbour survey 2026', 'Harbour tide tables', 'Hull inspection notes', 'Crew rota, November', 'Fuel log', 'Survey drone checklist', 'Berth bookings', 'Harbour dues'];

type Look = 'today' | 'a' | 'b' | 'c';
const LOOKS: { id: Look; name: string; from: string }[] = [
  { id: 'today', name: 'Today', from: 'What main draws now' },
  { id: 'a', name: 'A · Groove', from: 'From the horizon line (Divider, Progress). Nearest prior art: a ruled line on a paper form.' },
  { id: 'b', name: 'B · Key', from: 'From Keycap and Well. Nearest prior art: physical keyboard keycaps and their sunken sockets.' },
  { id: 'c', name: 'C · Readout', from: 'From the Stamp and mono labels. Nearest prior art: an instrument readout or a command prompt.' },
];

function Columns({ children, looks = LOOKS }: { children: (look: Look) => ReactNode; looks?: typeof LOOKS }) {
  return (
    <div className="fmd-page">
      {looks.map((l) => (
        <section key={l.id} className="fmd-col" aria-labelledby={`fmd-${l.id}`}>
          <header className="fmd-head">
            <h2 id={`fmd-${l.id}`} className="fmd-name">{l.name}</h2>
            <p className="fmd-from">{l.from}</p>
          </header>
          {children(l.id)}
        </section>
      ))}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="fmd-note">{children}</p>;
}

/* Search: one behaviour, three looks. Matches as you type, Esc clears, and the count says how many. */
function useFind() {
  const [word, setWord] = useState('');
  const found = word.trim() ? NAMES.filter((n) => n.toLocaleLowerCase().includes(word.trim().toLocaleLowerCase())) : [];
  return { word, setWord, found };
}

function Matches({ word, found, look }: { word: string; found: string[]; look: Look }) {
  if (!word.trim()) return null;
  const shown = found.slice(0, 4);
  return (
    <ul className="fmd-matches" data-look={look} aria-label="Matches">
      {shown.map((n) => {
        const i = n.toLocaleLowerCase().indexOf(word.trim().toLocaleLowerCase());
        return (
          <li key={n}>
            {n.slice(0, i)}
            <mark>{n.slice(i, i + word.trim().length)}</mark>
            {n.slice(i + word.trim().length)}
          </li>
        );
      })}
      {found.length === 0 ? <li className="fmd-none">Nothing called “{word.trim()}”.</li> : null}
    </ul>
  );
}

function SearchField({ look }: { look: Look }) {
  const { word, setWord, found } = useFind();
  const id = useId();
  const count = word.trim() ? found.length : NAMES.length;
  const input = (
    <input
      id={id}
      type="search"
      className="fmd-search-input"
      placeholder={look === 'c' ? 'type to find' : 'Find a document'}
      value={word}
      onChange={(e) => setWord(e.target.value)}
      onKeyDown={(e) => e.key === 'Escape' && setWord('')}
      aria-label="Find a document"
    />
  );
  if (look === 'today') {
    return (
      <div>
        <div className="augur-field-box">
          <Icon name="find" size={16} />
          {input}
        </div>
        <Matches word={word} found={found} look={look} />
        <Note>Four different search fields today: the shell menu, the filter bar, lists and the palette each draw their own.</Note>
      </div>
    );
  }
  if (look === 'a') {
    return (
      <div>
        <div className="fmd-search" data-look="a">
          <span className="fmd-search-label" aria-hidden="true">Find</span>
          {input}
          <span className="fmd-search-count" aria-live="polite">{word.trim() ? `${found.length} of ${NAMES.length}` : NAMES.length}</span>
        </div>
        <Matches word={word} found={found} look={look} />
        <Note>No box: the words sit on a groove, which turns ink while you write. The count sits at the end of the line. Esc clears.</Note>
      </div>
    );
  }
  if (look === 'b') {
    return (
      <div>
        <div className="fmd-search augur-field-box" data-look="b">
          <Icon name="find" size={16} />
          {input}
          {word ? (
            <button type="button" className="fmd-clear" onClick={() => setWord('')} aria-label="Clear">
              <KeyCap look="b">Esc</KeyCap>
            </button>
          ) : (
            <KeyCap look="b">/</KeyCap>
          )}
        </div>
        <Matches word={word} found={found} look={look} />
        <Note>A well, like every field. At rest a small key says which key brings you here; once you write, it becomes Esc to clear.</Note>
      </div>
    );
  }
  return (
    <div>
      <div className="fmd-search" data-look="c">
        <span className="fmd-search-label" aria-hidden="true">Find ›</span>
        {input}
      </div>
      <p className="fmd-readout" aria-live="polite">
        {word.trim() ? `${count} of ${NAMES.length} · enter opens the first` : `${NAMES.length} documents · type to narrow`}
      </p>
      <Matches word={word} found={found} look={look} />
      <Note>A flat strip with a mono prompt. Under it, one printed line says how many match and what Enter will do.</Note>
    </div>
  );
}

/* Links: never underlined; inside and outside AUGUR alike. */
function TextLink({ look, href, children }: { look: Look; href: string; children: ReactNode }) {
  if (look === 'today') return <a className="fmd-link-today" href={href}>{children}</a>;
  return (
    <a className="fmd-link" data-look={look} href={href}>
      <span className="fmd-link-words">{children}</span>
      {look !== 'b' ? <span className="fmd-link-mark" aria-hidden="true">{look === 'a' ? '→' : '↗'}</span> : null}
    </a>
  );
}

function LinksDemo({ look }: { look: Look }) {
  const notes: Record<Look, string> = {
    today: 'Today a link is the tertiary button: muted words, underlined.',
    a: 'Ink words with a short mono arrow after them. Pointing at it, a groove draws under the words from the arrow back: a line, never an underline at rest.',
    b: 'Ink words in medium weight. Pointing at it, the words come up as a soft key, the way a picked row does in a table.',
    c: 'Ink words with a small raised mono arrow. Pointing at it, the words print solid, ink on dark reversed, like a Stamp.',
  };
  return (
    <div>
      <p className="fmd-prose">
        The <TextLink look={look} href="#survey">harbour survey</TextLink> is due Friday. Tide times come from the{' '}
        <TextLink look={look} href="#tides">port authority’s tables</TextLink>, and anything odd goes in the{' '}
        <TextLink look={look} href="#hull">hull notes</TextLink>.
      </p>
      <p className="fmd-standalone">
        <TextLink look={look} href="#all">All documents</TextLink>
      </p>
      <Note>{notes[look]}</Note>
    </div>
  );
}

/* Key caps: a key to press, shown in words and menus. */
function KeyCap({ look, children }: { look: Look; children: ReactNode }) {
  if (look === 'today') return <kbd className="augur-menu-key">{children}</kbd>;
  return <kbd className="fmd-key" data-look={look}>{children}</kbd>;
}

function KeyCapsDemo({ look }: { look: Look }) {
  const notes: Record<Look, string> = {
    today: 'Today a key is only mono letters, muted, with no shape: in menus, dialogs and the shell.',
    a: 'Cut into the surface: mono letters in a small sunken tray, like the tab tray. Sits flush with the line of text.',
    b: 'A real small key: the Keycap button at its smallest, with a thicker bottom edge. Reads as something you press.',
    c: 'Printed: mono capitals in a hairline outline, flat. A combination joins with a thin plus, like a readout.',
  };
  const plus = look === 'c' ? <span className="fmd-plus">+</span> : null;
  return (
    <div className="fmd-stack">
      <p className="fmd-prose">
        Press <KeyCap look={look}>/</KeyCap> to find, or <KeyCap look={look}>Ctrl</KeyCap>
        {plus}
        <KeyCap look={look}>K</KeyCap> for everything. <KeyCap look={look}>Esc</KeyCap> closes.
      </p>
      <ul className="fmd-menu" aria-label="A menu with keys">
        <li><span>Open</span><KeyCap look={look}>Enter</KeyCap></li>
        <li><span>Rename</span><KeyCap look={look}>F2</KeyCap></li>
        <li><span>Copy link</span><span className="fmd-keys"><KeyCap look={look}>Ctrl</KeyCap>{plus}<KeyCap look={look}>L</KeyCap></span></li>
      </ul>
      <Note>{notes[look]}</Note>
    </div>
  );
}

/* Loading: what stands where the content will be. */
function LoadingDemo({ look }: { look: Look }) {
  const notes: Record<Look, string> = {
    today: 'Nothing in Common today. The shell menu has its own grey bars, and Quill states say “Loading” on the horizon.',
    a: 'Grooves where the words will be, at the length of each line. Still, with one faint light that passes along them every few seconds.',
    b: 'Empty wells in the shape of what comes: a slot for the title, smaller slots for each fact. They breathe slowly in and out.',
    c: 'No shapes at all: one quiet line says what is coming and how much, and each value it will fill shows a dash until it arrives.',
  };
  if (look === 'today') return <div><Note>{notes.today}</Note></div>;
  if (look === 'c') {
    return (
      <div role="status" aria-label="Loading the document">
        <p className="fmd-readout">Loading · harbour survey · 3 of 7 facts</p>
        <dl className="fmd-facts" data-look="c">
          <dt>Owner</dt><dd>Sam Reyes</dd>
          <dt>Changed</dt><dd>12:40</dd>
          <dt>Size</dt><dd>2.4 MB</dd>
          <dt>Tags</dt><dd><span aria-hidden="true">—</span><span className="fmd-hidden">not loaded yet</span></dd>
          <dt>Shared with</dt><dd><span aria-hidden="true">—</span><span className="fmd-hidden">not loaded yet</span></dd>
          <dt>Due</dt><dd><span aria-hidden="true">—</span><span className="fmd-hidden">not loaded yet</span></dd>
        </dl>
        <Note>{notes.c}</Note>
      </div>
    );
  }
  return (
    <div role="status" aria-label="Loading the document">
      <div className="fmd-skeleton" data-look={look}>
        <i style={{ width: '62%' }} data-size="title" />
        <i style={{ width: '94%' }} />
        <i style={{ width: '88%' }} />
        <i style={{ width: '40%' }} />
        <div className="fmd-skeleton-row">
          <i style={{ width: '30%' }} />
          <i style={{ width: '20%' }} />
          <i style={{ width: '25%' }} />
        </div>
      </div>
      <Note>{notes[look]}</Note>
    </div>
  );
}

/* Busy: something takes a moment after a press. */
function useBusy() {
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const start = () => {
    if (busy) return;
    setBusy(true);
    setSeconds(0);
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s >= 3) {
          window.clearInterval(timer.current);
          setBusy(false);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
  };
  return { busy, seconds, start };
}

function BusyKey({ look, label, still }: { look: Look; label: string; still?: boolean }) {
  const { busy, seconds, start } = useBusy();
  const on = still || busy;
  if (look === 'today') {
    return (
      <Button kind="primary" busy={on} busyLabel="Saving" onPress={start}>
        {label}
      </Button>
    );
  }
  return (
    <button type="button" className="fmd-busy augur-button" data-kind="primary" data-look={look} data-on={on || undefined} aria-busy={on} onClick={start}>
      <span className="fmd-busy-label">{on && look === 'c' ? `Saving ${still ? 2 : seconds}s` : on ? 'Saving' : label}</span>
      {on && look === 'b' ? <span className="fmd-dots" aria-hidden="true"><i /><i /><i /></span> : null}
    </button>
  );
}

function BusyDemo({ look }: { look: Look }) {
  const notes: Record<Look, string> = {
    today: 'Today: a round spinner beside the words, the one place the kit still spins.',
    a: 'No spinner. The key’s bottom edge becomes the horizon line, and a short stretch of ink runs along it until it’s done.',
    b: 'No spinner. The key stays held down, and three small square dots light in turn after the word.',
    c: 'No spinner. The words count the seconds in mono, so a slow save says how slow. Under reduced motion the count still moves, nothing else does.',
  };
  return (
    <div className="fmd-stack">
      <div className="fmd-row">
        <BusyKey look={look} label="Save" />
        <BusyKey look={look} label="Save" still />
      </div>
      <Note>Press the first to see it work for a few seconds; the second is held busy.</Note>
      <Note>{notes[look]}</Note>
    </div>
  );
}

/** One search field everywhere, matching as you type. Write “harb” in each. */
export const Search: Story = { render: () => <Columns>{(l) => <SearchField look={l} />}</Columns> };
/** Links in running text and on their own, never underlined at rest. Point at them. */
export const Links: Story = { render: () => <Columns>{(l) => <LinksDemo look={l} />}</Columns> };
/** A key to press, in a sentence and in a menu. */
export const KeyCaps: Story = { name: 'Key caps', render: () => <Columns>{(l) => <KeyCapsDemo look={l} />}</Columns> };
/** What stands where a document's content will be while it loads. */
export const Loading: Story = { render: () => <Columns>{(l) => <LoadingDemo look={l} />}</Columns> };
/** A key that takes a moment after you press it: the spinner's replacement. */
export const Busy: Story = { render: () => <Columns>{(l) => <BusyDemo look={l} />}</Columns> };
