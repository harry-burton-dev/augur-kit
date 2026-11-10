/**
 * How each element of Quill's remote vocabulary is drawn: by the kit part it names, with the
 * properties that passed, its events as callbacks that send the detail back over the bridge, and
 * its children by slot. Long lists and tables draw only the rows in view (the app contract, 6.9).
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AskTwice, Button, CheckList, CheckRow, Checkbox, CheckboxGroup, Choice, Dialog, Icon, Notice, PagedList, Progress, Select, Status, StepList, Steps, TextField, type CheckTone, type IconName } from '@augur/kit-common';
import { About } from '../about.js';
import { DateField, FileButton } from '../date.js';
import { FilterBar, type FilterDef, type FilterValue } from '../filter-bar.js';
import { PeoplePicker, type Principal } from '../people-picker.js';
import { ReadingView } from '../reading-view.js';
import { Path, type PathStep } from '../things.js';
import { useQuillRemoteHost } from './host.js';
import type { RemoteFloorStep, RemoteMarked, RemotePrincipal } from './types.js';
import { Editor } from '../editor.js';
import { List, Table, type ListItem, type TableColumn, type TableRow } from '../list.js';
import { More } from '../more.js';
import { PageHead, Section } from '../page.js';
import { Palette } from '../palette.js';
import { Reel } from '../reel.js';
import { SelectionBar } from '../selection-bar.js';
import { Details, Facts, Rows, State, Tag } from '../states.js';
import { TagPicker } from '../tag-picker.js';
import { AddTile, KindTile, Tiles } from '../tiles.js';
import { Grid, Split, Stack } from '../layout.js';
import { ThingPage } from '../thing-page.js';
import type { ThingActionId, ThingView } from '../thing-view.js';
import { AskLine, DoorGallery } from '../door-gallery.js';
import type { DoorDescriptor, DoorScore } from '../doors.js';
import { readerPicturePath, type QuillRemoteElementName } from './vocabulary.js';

/** What an element brings to its renderer. */
export interface RemoteParts {
  props: Record<string, unknown>;
  /** Present only for the events the sandbox listens to. */
  events: Record<string, (detail?: unknown) => void>;
  slots: Record<string, ReactNode[]>;
  children: ReactNode[];
}

/** From this many rows, a list or table draws only the rows in view. */
export const VIRTUAL_FROM = 200;

// The values crossed the bridge typed by the vocabulary; here they take the part's own types.
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const p = (parts: RemoteParts) => parts.props as Record<string, Any>;

/**
 * A form value the person changes here and the app may change too: the host keeps the person's
 * typing. Each value the host sends comes back from the sandbox as an echo, late; an echo of a value
 * already sent is passed by, so fast typing isn't set back. Any other value is the app's, and wins.
 */
function useHeld<T>(value: T): [T, (next: T) => void] {
  const [held, setHeld] = useState(value);
  const [was, setWas] = useState(value);
  const [sent, setSent] = useState<T[]>([]);
  if (value !== was) {
    setWas(value);
    const echo = sent.indexOf(value);
    if (echo >= 0) setSent(sent.slice(echo + 1));
    else {
      setSent([]);
      setHeld(value);
    }
  }
  const change = useCallback((next: T) => {
    setHeld(next);
    setSent((was) => [...was.slice(-99), next]);
  }, []);
  return [held, change];
}

/** One of the element's events, or nothing when the sandbox doesn't listen to it. */
const event = (parts: RemoteParts, name: string): ((detail?: unknown) => void) | undefined => parts.events[name];

type PagedItem = { id: string; title: string; detail?: string; meta?: string; status?: string };

/** A page at a time; with more to load and a `more` listener, the last page offers it. */
function RemotePagedList({ parts }: { parts: RemoteParts }) {
  const { label = '', items = [], pageSize = 5, total, noun = '', empty, busy } = p(parts);
  const list = items as PagedItem[];
  const open = event(parts, 'open');
  const more = event(parts, 'more');
  return (
    <div className="quill-paged">
      <PagedList
        label={label}
        items={list}
        pageSize={pageSize}
        keyOf={(i) => i.id}
        empty={empty}
        render={(i) => (
          <span className="quill-paged-row">
            {open ? (
              <button type="button" className="quill-paged-open" onClick={() => open(i.id)}>
                {i.title}
              </button>
            ) : (
              <b>{i.title}</b>
            )}
            {i.detail || i.meta ? <small>{[i.detail, i.meta].filter(Boolean).join(' · ')}</small> : null}
            {i.status ? <Status status={i.status as never} markOnly /> : null}
          </span>
        )}
      />
      {more && typeof total === 'number' && total > list.length ? <More shown={list.length} total={total} noun={noun} busy={busy} onMore={() => more()} /> : null}
    </div>
  );
}

/** The words selected inside a reader, the block they start in, and where they sit in `root`. */
function selectedIn(root: HTMLElement | null): (Omit<RemoteMarked, 'mark'> & { top: number; left: number }) | undefined {
  const selection = typeof document === 'undefined' ? null : document.getSelection();
  if (!root || !selection || selection.isCollapsed || !selection.rangeCount) return undefined;
  const range = selection.getRangeAt(0);
  const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  const block = start?.closest<HTMLElement>('.quill-reader [data-block]');
  if (!block || !root.contains(block)) return undefined;
  const text = selection.toString().replace(/\s+/g, ' ').trim();
  if (!text) return undefined;
  const r = range.getBoundingClientRect?.();
  const box = root.getBoundingClientRect();
  return { text, anchor: block.id, context: (block.textContent ?? '').replace(/\s+/g, ' ').trim(), top: (r?.top ?? box.top) - box.top, left: (r ? r.left + r.width / 2 : box.left) - box.left };
}

/**
 * A document to read. Its pictures come only through the host, by a path under the app's own API;
 * one whose path doesn't pass, or that the host can't fetch, is said in words. Words selected in it
 * get the app's marks beside them.
 */
function RemoteReader({ parts }: { parts: RemoteParts }) {
  const { markdown = '', title, flow, mode, size, contentsHeading, remember, marks = [], at } = p(parts);
  const { picture } = useQuillRemoteHost();
  const root = useRef<HTMLDivElement>(null);
  const [passage, setPassage] = useState<ReturnType<typeof selectedIn>>();
  const mark = event(parts, 'mark');
  const position = event(parts, 'position');
  const offered = (marks as { id: string; label: string }[]).length > 0 && Boolean(mark);
  // Stable while the host's fetcher is, so the reader fetches each picture once.
  const imageSource = useCallback(async (src: string) => {
    const path = readerPicturePath(src);
    return path && picture ? picture(path) : undefined;
  }, [picture]);
  useEffect(() => {
    if (!offered) return;
    const onSelection = () => setPassage(selectedIn(root.current));
    document.addEventListener('selectionchange', onSelection);
    return () => document.removeEventListener('selectionchange', onSelection);
  }, [offered]);
  return (
    <div className="quill-remote-reader" ref={root}>
      <ReadingView
        markdown={markdown}
        title={title}
        flow={flow}
        mode={mode}
        size={size}
        contentsHeading={contentsHeading}
        // The person's own flow and layout, kept apart from the shell's own readers.
        remember={remember ? `remote.${remember}` : undefined}
        imageSource={imageSource}
        at={at}
        onPosition={position ? (anchor) => position(anchor) : undefined}
      />
      {offered && passage ? (
        <div className="quill-reader-marks" role="toolbar" aria-label={`Selected: “${passage.text.length > 60 ? `${passage.text.slice(0, 57)}…` : passage.text}”`} style={{ top: passage.top, left: passage.left }}>
          {(marks as { id: string; label: string }[]).map((m) => (
            <Button key={m.id} kind="secondary" size="sm" onPress={() => mark!({ mark: m.id, text: passage.text, anchor: passage.anchor, context: passage.context })}>
              {m.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Opens the person's file chooser; the host takes the files, as a drop on the app's pane. */
function RemoteFileButton({ parts }: { parts: RemoteParts }) {
  const { label = '', icon: name, accept = [], disabled, reason, ...rest } = p(parts);
  const { files } = useQuillRemoteHost();
  const choose = event(parts, 'choose');
  return (
    <FileButton
      {...rest}
      label={label}
      icon={icon(name)}
      accept={(accept as string[]).join(',')}
      disabled={disabled || !files}
      reason={files ? reason : 'This screen can’t take files from here.'}
      onFiles={(chosen) => {
        files?.(chosen);
        choose?.(chosen.map((f) => ({ name: f.name, size: f.size, type: f.type })));
      }}
    />
  );
}

/** Only what the vocabulary names goes back over the bridge. */
const principalOut = ({ kind, id, name, detail, size, meta }: Principal): RemotePrincipal => ({ kind, id, name, ...(detail === undefined ? {} : { detail }), ...(size === undefined ? {} : { size }), ...(meta === undefined ? {} : { meta }) });

/** How long the picker waits for the app to answer a query. */
export const PEOPLE_ANSWER_MS = 15_000;

/**
 * The kit's people picker, asking the app: each search sends `query`, and waits for the app to set
 * `found` for those words. An answer to older words is passed by.
 */
function RemotePeoplePicker({ parts }: { parts: RemoteParts }) {
  const { value, found, label = '', ...rest } = p(parts);
  const query = event(parts, 'query');
  const waiting = useRef(new Map<string, { done: (items: Principal[]) => void; failed: (err: Error) => void }>());
  const [held, setHeld] = useState<Principal[]>(value ?? []);
  useEffect(() => setHeld(value ?? []), [value]);
  useEffect(() => {
    const answer = found as { query: string; items?: RemotePrincipal[]; error?: string } | undefined;
    const asked = answer && waiting.current.get(answer.query);
    if (!answer || !asked) return;
    waiting.current.delete(answer.query);
    if (answer.error) asked.failed(new Error(answer.error));
    else asked.done(answer.items ?? []);
  }, [found]);
  useEffect(() => () => waiting.current.clear(), []);
  const search = useCallback(
    (words: string) =>
      new Promise<Principal[]>((done, failed) => {
        if (!query) return failed(new Error('This app doesn’t look people up here.'));
        const timer = setTimeout(() => {
          waiting.current.delete(words);
          failed(new Error('The app didn’t answer. Try again.'));
        }, PEOPLE_ANSWER_MS);
        waiting.current.set(words, {
          done: (items) => (clearTimeout(timer), done(items)),
          failed: (err) => (clearTimeout(timer), failed(err)),
        });
        query(words);
      }),
    [query],
  );
  return (
    <PeoplePicker
      {...rest}
      label={label}
      search={search}
      check={(one) => (one as RemotePrincipal).reason}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next.map(principalOut));
      }}
      onPick={parts.events.pick ? (one) => parts.events.pick!(principalOut(one)) : undefined}
    />
  );
}

/** The filter bar, holding the person's choices until the app's next value. */
function RemoteFilterBar({ parts }: { parts: RemoteParts }) {
  const { label = '', filters = [], value = {}, sort = '', ...rest } = p(parts);
  const [held, setHeld] = useHeld<FilterValue>(value);
  const [sorted, setSorted] = useHeld<string>(sort);
  return (
    <FilterBar
      {...rest}
      label={label}
      filters={filters as FilterDef[]}
      value={held}
      sort={sorted}
      onChange={(next, by) => {
        setHeld(next);
        setSorted(by);
        parts.events.change?.({ value: next, sort: by });
      }}
    />
  );
}

/** A floor that can't be reached is said in words and marked red; the owner is marked. */
const floorStep = (f: RemoteFloorStep, opens: boolean): PathStep => ({
  ...(opens ? { id: f.id } : {}),
  floor: f.kind,
  title: f.name,
  ...(f.reason ? { line: f.reason } : f.line ? { line: f.line } : {}),
  ...(f.reason ? { mark: f.mark ?? 'Can’t reach', markTone: 'no' as const } : f.mark || f.owner ? { mark: f.mark ?? 'Owns it' } : {}),
  ...(f.here ? { here: true } : {}),
});

function RemoteTextField({ parts }: { parts: RemoteParts }) {
  const { value, label = '', ...rest } = p(parts);
  const [held, setHeld] = useHeld<string>(value ?? '');
  return (
    <TextField
      {...rest}
      label={label}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
      onCommit={parts.events.commit ? (next) => parts.events.commit!(next) : undefined}
    />
  );
}

function RemoteEditor({ parts }: { parts: RemoteParts }) {
  const { value, label = '', ...rest } = p(parts);
  const [held, setHeld] = useHeld<string>(value ?? '');
  return (
    <Editor
      {...rest}
      label={label}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
      onCommit={parts.events.commit ? (next) => parts.events.commit!(next) : undefined}
    />
  );
}

function RemoteSelect({ parts }: { parts: RemoteParts }) {
  const { value, label = '', options = [], ...rest } = p(parts);
  const [held, setHeld] = useHeld<string | null>(value ?? null);
  return (
    <Select
      {...rest}
      label={label}
      options={options}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
    />
  );
}

function RemoteCheckbox({ parts }: { parts: RemoteParts }) {
  const { checked, label = '', ...rest } = p(parts);
  const [held, setHeld] = useHeld<boolean>(Boolean(checked));
  return (
    <Checkbox
      {...rest}
      checked={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
    >
      {label}
    </Checkbox>
  );
}

/** The palette's query is the person's while it's open; the app filters on what it's told. */
function RemotePalette({ parts }: { parts: RemoteParts }) {
  const { open = false, placeholder = '', query = '', items = [], none, lead } = p(parts);
  const [held, setHeld] = useHeld<string>(query);
  useEffect(() => {
    if (!open) setHeld('');
  }, [open, setHeld]);
  return (
    <Palette
      open={open}
      placeholder={placeholder}
      query={held}
      items={items}
      none={none}
      lead={lead}
      onClose={() => parts.events.close?.()}
      onQuery={(next) => {
        setHeld(next);
        parts.events.query?.(next);
      }}
      onPick={(item) => parts.events.pick?.(item.id)}
    />
  );
}

/** A field whose value is a string the person picks: Choice and DateField. */
function RemoteChoice({ parts }: { parts: RemoteParts }) {
  const { value, label = '', options = [], ...rest } = p(parts);
  const [held, setHeld] = useHeld<string | null>(value ?? null);
  return (
    <Choice
      {...rest}
      label={label}
      options={options}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
    />
  );
}

function RemoteDateField({ parts }: { parts: RemoteParts }) {
  const { value, label = '', ...rest } = p(parts);
  const [held, setHeld] = useHeld<string>(value ?? '');
  return (
    <DateField
      {...rest}
      label={label}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
    />
  );
}

/**
 * Values held as a list. The sandbox echoes a new array each time, so they are compared as one
 * line, which no value can confuse: a comma would, so each is quoted.
 */
function useHeldList(value: unknown): [string[], (next: string[]) => void] {
  const given = Array.isArray(value) ? (value as string[]) : [];
  const [held, setHeld] = useHeld<string>(JSON.stringify(given));
  return [JSON.parse(held) as string[], (next) => setHeld(JSON.stringify(next))];
}

function RemoteCheckboxGroup({ parts }: { parts: RemoteParts }) {
  const { value, label = '', options = [], ...rest } = p(parts);
  const [held, setHeld] = useHeldList(value);
  return (
    <CheckboxGroup
      {...rest}
      label={label}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
    >
      {(options as { value: string; label: string; detail?: string; disabled?: boolean; reason?: string }[]).map(({ label: text, ...option }) => (
        <Checkbox key={option.value} {...option}>
          {text}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}

function RemoteTagPicker({ parts }: { parts: RemoteParts }) {
  const { value, label = '', options = [], creatable, ...rest } = p(parts);
  const [held, setHeld] = useHeldList(value);
  return (
    <TagPicker
      {...rest}
      label={label}
      options={options}
      value={held}
      onChange={(next) => {
        setHeld(next);
        parts.events.change?.(next);
      }}
      onCreate={creatable && parts.events.create ? (word) => parts.events.create!(word) : undefined}
    />
  );
}

/**
 * A dialog whose work is done in the sandbox: a submit sends the fields' values and the dialog waits,
 * busy, until the app closes it or says why not. Closing it here closes it at once, and tells the app.
 */
function RemoteDialog({ parts }: { parts: RemoteParts }) {
  const { open, heading = '', busy, error, ...rest } = p(parts);
  const [held, setHeld] = useHeld<boolean>(Boolean(open));
  const [waiting, setWaiting] = useState(false);
  useEffect(() => setWaiting(false), [open, error, busy]);
  return (
    <Dialog
      {...rest}
      open={held}
      heading={heading}
      busy={Boolean(busy) || waiting}
      error={error}
      fields={parts.slots.fields?.length ? parts.slots.fields : undefined}
      onSubmit={(values) => {
        setWaiting(true);
        parts.events.submit?.(values);
        return false;
      }}
      onClose={() => {
        setHeld(false);
        parts.events.close?.(false);
      }}
    >
      {parts.children.length ? parts.children : undefined}
    </Dialog>
  );
}

const icon = (name: unknown, size = 16) => (typeof name === 'string' ? <Icon name={name as IconName} size={size} /> : undefined);

export const renderers: Record<QuillRemoteElementName, (parts: RemoteParts) => ReactNode> = {
  'quill-page-head': (parts) => {
    const { heading = '', ...rest } = p(parts);
    return (
      <PageHead {...rest} heading={heading} onTrail={(step) => parts.events.trail?.(step.id)} onAction={(action) => parts.events.action?.(action.id)}>
        {parts.children.length ? parts.children : undefined}
      </PageHead>
    );
  },
  'quill-stack': (parts) => <Stack {...p(parts)}>{parts.children}</Stack>,
  'quill-split': (parts) => <Split aside={parts.slots.aside?.length ? parts.slots.aside : undefined}>{parts.children}</Split>,
  'quill-grid': (parts) => <Grid {...p(parts)}>{parts.children}</Grid>,
  'quill-section': (parts) => {
    const { label = '', ...rest } = p(parts);
    return (
      <Section {...rest} label={label} onAction={parts.events.action ? () => parts.events.action!() : undefined}>
        {parts.children}
      </Section>
    );
  },
  'quill-selection-bar': (parts) => {
    const { count = 0, noun = ['item', 'items'], actions = [] } = p(parts);
    return <SelectionBar count={count} noun={noun} actions={actions} onAction={(id) => parts.events.action?.(id)} onClear={() => parts.events.clear?.()} />;
  },
  'quill-about': (parts) => {
    const { what = '', owner, floor } = p(parts);
    const slot = (name: string) => (parts.slots[name]?.length ? parts.slots[name] : undefined);
    return <About what={what} owner={owner} floor={floor} lifecycle={slot('lifecycle')} links={slot('links')} history={slot('history')} />;
  },
  'quill-more': (parts) => {
    const { shown = 0, total = 0, noun = '', step, busy } = p(parts);
    return <More shown={shown} total={total} noun={noun} step={step} busy={busy} onMore={() => parts.events.more?.()} />;
  },
  'quill-list': (parts) => {
    const { label = '', items = [], ...rest } = p(parts);
    const list = items as ListItem[];
    return (
      <List
        {...rest}
        label={label}
        items={list}
        virtual={list.length >= VIRTUAL_FROM}
        onOpen={parts.events.open ? (item) => parts.events.open!(item.id) : undefined}
        onAction={parts.events.action ? (item, action) => parts.events.action!({ item: item.id, action: action.id }) : undefined}
        onRetry={parts.events.retry ? () => parts.events.retry!() : undefined}
      />
    );
  },
  'quill-table': (parts) => {
    const { columns = [], rows = [], ...rest } = p(parts);
    const all = rows as TableRow[];
    return (
      <Table
        {...rest}
        columns={columns as TableColumn[]}
        rows={all}
        virtual={all.length >= VIRTUAL_FROM}
        actions={parts.slots.actions?.length ? parts.slots.actions : undefined}
        onSort={parts.events.sort ? (sort) => parts.events.sort!(sort) : undefined}
        onSelect={parts.events.select ? (ids) => parts.events.select!(ids) : undefined}
        onOpen={parts.events.open ? (row) => parts.events.open!(row.id) : undefined}
        onRetry={parts.events.retry ? () => parts.events.retry!() : undefined}
      />
    );
  },
  'quill-rows': (parts) => <Rows {...p(parts)} />,
  'quill-facts': (parts) => <Facts {...p(parts)} />,
  'quill-details': (parts) => {
    const { items = [], ...rest } = p(parts);
    return <Details {...rest} items={items} />;
  },
  'quill-state': (parts) => {
    const { heading = '', ...rest } = p(parts);
    return <State {...rest} heading={heading} onAction={parts.events.action ? () => parts.events.action!() : undefined} />;
  },
  'quill-notice': (parts) => (
    <Notice {...p(parts)} onAction={parts.events.action ? () => parts.events.action!() : undefined}>
      {parts.children.length ? parts.children : undefined}
    </Notice>
  ),
  'quill-tag': (parts) => {
    const { label = '', ...rest } = p(parts);
    return <Tag {...rest} label={label} onRemove={parts.events.remove ? () => parts.events.remove!() : undefined} />;
  },
  'quill-button': (parts) => {
    const { label = '', icon: name, ...rest } = p(parts);
    return (
      <Button {...rest} icon={icon(name)} onPress={() => parts.events.press?.()}>
        {label}
      </Button>
    );
  },
  'quill-text-field': (parts) => <RemoteTextField parts={parts} />,
  'quill-select': (parts) => <RemoteSelect parts={parts} />,
  'quill-checkbox': (parts) => <RemoteCheckbox parts={parts} />,
  'quill-editor': (parts) => <RemoteEditor parts={parts} />,
  'quill-palette': (parts) => <RemotePalette parts={parts} />,
  'quill-tiles': (parts) => {
    const { label = '' } = p(parts);
    return <Tiles label={label}>{parts.children}</Tiles>;
  },
  'quill-kind-tile': (parts) => {
    const { kind = 'collection', name = '', eyebrow = '', ...rest } = p(parts);
    return <KindTile {...rest} kind={kind} name={name} eyebrow={eyebrow} onOpen={() => parts.events.open?.()} />;
  },
  'quill-add-tile': (parts) => {
    const { label = '', reason } = p(parts);
    return <AddTile label={label} reason={reason} onPress={() => parts.events.press?.()} />;
  },
  'quill-reel': (parts) => {
    const { label = '', items = [], ...rest } = p(parts);
    const open = parts.events.open;
    return <Reel {...rest} label={label} items={(items as { id: string; title: string }[]).map((item) => ({ ...item, onOpen: () => open?.(item.id) }))} />;
  },
  'quill-dialog': (parts) => <RemoteDialog parts={parts} />,
  'quill-ask-twice': (parts) => {
    const { label = '', confirm = '', icon: name, ...rest } = p(parts);
    return (
      <AskTwice {...rest} confirm={confirm} icon={icon(name)} onPress={() => parts.events.press?.()}>
        {label}
      </AskTwice>
    );
  },
  'quill-choice': (parts) => <RemoteChoice parts={parts} />,
  'quill-checkbox-group': (parts) => <RemoteCheckboxGroup parts={parts} />,
  'quill-date-field': (parts) => <RemoteDateField parts={parts} />,
  'quill-tag-picker': (parts) => <RemoteTagPicker parts={parts} />,
  'quill-steps': (parts) => {
    const { label = '', steps = [] } = p(parts);
    return <Steps label={label} steps={steps} />;
  },
  'quill-progress': (parts) => {
    const { label = '', ...rest } = p(parts);
    return <Progress {...rest} label={label} />;
  },
  'quill-status': (parts) => {
    const { status = 'queued', ...rest } = p(parts);
    return <Status {...rest} status={status} />;
  },
  'quill-check-list': (parts) => {
    const { label = '', rows = [] } = p(parts);
    const act = event(parts, 'act');
    return (
      <CheckList label={label}>
        {(rows as { id: string; title: string; detail?: string; tone?: CheckTone; action?: { label: string; disabled?: boolean; reason?: string } }[]).map((r) => (
          <CheckRow key={r.id} title={r.title} detail={r.detail} tone={r.tone} action={r.action && act ? { ...r.action, onPress: () => act(r.id) } : undefined} />
        ))}
      </CheckList>
    );
  },
  'quill-step-list': (parts) => {
    const { label = '', steps = [] } = p(parts);
    const act = event(parts, 'act');
    return (
      <StepList
        label={label}
        steps={(steps as { id: string; title: string; detail?: string; action?: string; done?: boolean; unavailable?: string }[]).map(({ action, ...s }) => ({
          ...s,
          ...(action && act ? { action: { label: action, onPress: () => act(s.id) } } : {}),
        }))}
      />
    );
  },
  'quill-paged-list': (parts) => <RemotePagedList parts={parts} />,
  'quill-reader': (parts) => <RemoteReader parts={parts} />,
  'quill-file-button': (parts) => <RemoteFileButton parts={parts} />,
  'quill-people-picker': (parts) => <RemotePeoplePicker parts={parts} />,
  'quill-floor-path': (parts) => {
    const { label = 'Up the floors', floors = [] } = p(parts);
    const open = event(parts, 'open');
    return (
      <div className="quill-floor-path" role="group" aria-label={label}>
        <Path steps={(floors as RemoteFloorStep[]).map((f) => floorStep(f, Boolean(open)))} onOpen={open ? (step) => step.id && open(step.id) : undefined} />
      </div>
    );
  },
  'quill-filter-bar': (parts) => <RemoteFilterBar parts={parts} />,
  'quill-thing-page': (parts) => {
    const { view, map, thing, level } = p(parts);
    const on = (name: string) => event(parts, name);
    const open = on('open');
    const source = on('source');
    const everything = on('everything');
    const toMap = on('map');
    return (
      <ThingPage
        view={view as ThingView}
        mark={thing}
        level={level === '2' ? 2 : 1}
        onAction={(id: ThingActionId) => on('action')?.(id)}
        onOpen={open ? (id) => open(id) : undefined}
        onSource={source ? (s) => source(s.id ?? s.title) : undefined}
        onEverything={everything ? () => everything() : undefined}
        onMap={map && toMap ? () => toMap() : undefined}
      />
    );
  },
  'quill-door-gallery': (parts) => {
    const { label = '', doors = [], scores = {}, ask, ...rest } = p(parts);
    const asked = event(parts, 'ask');
    const recent = event(parts, 'recent');
    return (
      <DoorGallery
        {...rest}
        label={label}
        doors={doors as DoorDescriptor[]}
        scores={scores as Record<string, DoorScore>}
        onOpen={(id) => event(parts, 'open')?.(id)}
        ask={
          ask && asked ? (
            <AskLine label={ask.label} placeholder={ask.placeholder} ask={ask.go} recentsLabel={ask.recentsLabel} recents={ask.recents} autoFocus={false} onAsk={(text) => asked(text)} onRecent={recent ? (id) => recent(id) : undefined} />
          ) : undefined
        }
      />
    );
  },
};
