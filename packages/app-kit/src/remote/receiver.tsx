/**
 * The host side of Quill's remote vocabulary: the shell keeps what an app's sandbox describes in a
 * receiver and draws it here with the real kit. Only the vocabulary passes (ADR 0076; the app
 * contract, 6.7): an element outside it, a property it doesn't name or of the wrong type, an event
 * it doesn't send, each is dropped with a console reason, and the rest of the screen still draws.
 *
 * A dropped element stays in the receiver's tree, drawn as nothing, so the positions the sandbox's
 * later changes name still line up.
 */
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { icons } from '@augur/kit-common';
import { RemoteReceiver, type RemoteReceiverElement, type RemoteReceiverNode, type RemoteReceiverRoot } from '@remote-dom/core/receivers';
import { QUILL_REMOTE_ELEMENTS, checkRemoteValue, isQuillRemoteElement, type QuillRemoteElementName, type RemoteElementSpec } from './vocabulary.js';
import { renderers, type RemoteParts } from './renderers.js';

/** What carries the sandbox's changes in: the bridge hands each batch of records to `mutate`. */
export interface QuillRemoteConnection {
  mutate(records: unknown[]): void;
  call(id: string, method: string, ...args: unknown[]): unknown;
}

/** One remote root's tree, as the host keeps it: the screen, an About section or a card. */
export interface QuillReceiver {
  readonly connection: QuillRemoteConnection;
}

class Receiver implements QuillReceiver {
  readonly inner = new RemoteReceiver();
  get connection(): QuillRemoteConnection {
    return this.inner.connection as unknown as QuillRemoteConnection;
  }
}

export const createQuillReceiver = (): QuillReceiver => new Receiver();

export interface QuillRemoteProps {
  receiver: QuillReceiver;
  /** Told each thing that was dropped, once, with why; it is also said on the console. */
  onDrop?: (reason: string) => void;
}

type Watchable = RemoteReceiverNode | RemoteReceiverRoot;

function useNode<T extends Watchable>(receiver: RemoteReceiver, node: T): T {
  const subscribe = useCallback(
    (changed: () => void) => {
      const stop = new AbortController();
      receiver.subscribe(node, changed, { signal: stop.signal });
      return () => stop.abort();
    },
    [receiver, node],
  );
  const current = () => (receiver.get(node) as T | undefined) ?? node;
  useSyncExternalStore(subscribe, () => current().version, () => current().version);
  return current();
}

/** Says each thing dropped once: on the console as it is drawn, and to `onDrop` once it has been. */
interface Drop {
  (key: string, reason: string): void;
  flush(): void;
}

function dropper(onDrop: (reason: string) => void): Drop {
  const said = new Set<string>();
  let pending: string[] = [];
  const drop = ((key: string, reason: string) => {
    if (said.has(key)) return;
    said.add(key);
    console.warn(`Quill remote: ${reason}`);
    pending.push(reason);
  }) as Drop;
  drop.flush = () => {
    const told = pending;
    pending = [];
    for (const reason of told) onDrop(reason);
  };
  return drop;
}

const isIcon = (name: string) => Object.hasOwn(icons, name);

/** The values of the properties the vocabulary names, checked down to every field; the rest are dropped. */
function allowed(el: RemoteReceiverElement, spec: RemoteElementSpec, drop: Drop) {
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(el.properties)) {
    if (!Object.hasOwn(spec.properties, name)) {
      drop(`${el.id}.${name}`, `<${el.element}> has no property “${name}”; it was dropped.`);
      continue;
    }
    const checked = checkRemoteValue(spec.properties[name]!, value, `<${el.element}>’s “${name}”`, isIcon);
    for (const reason of checked.dropped) drop(`${el.id}.${name}:${reason}`, reason);
    if (checked.ok && checked.value !== undefined) props[name] = checked.value;
  }
  const events: Record<string, (detail?: unknown) => void> = {};
  for (const [name, listener] of Object.entries(el.eventListeners)) {
    if (!Object.hasOwn(spec.events, name)) drop(`${el.id}@${name}`, `<${el.element}> sends no “${name}” event; its listener was dropped.`);
    else {
      const failed = (error: unknown) => console.warn(`Quill remote: <${el.element}>’s “${name}” listener failed in the sandbox:`, error);
      events[name] = (detail?: unknown) => {
        try {
          void Promise.resolve(listener(detail)).catch(failed);
        } catch (error) {
          failed(error);
        }
      };
    }
  }
  return { props, events };
}

/**
 * A part that fails to draw stops only itself: it is dropped with the reason and the rest still
 * draws. The sandbox's next change to it tries again.
 */
class Contained extends Component<{ element: string; id: string; version: number; drop: Drop; children: ReactNode }, { failed: boolean; version: number }> {
  state = { failed: false, version: this.props.version };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  static getDerivedStateFromProps(props: { version: number }, state: { failed: boolean; version: number }) {
    return props.version === state.version ? null : { failed: false, version: props.version };
  }
  componentDidCatch(error: unknown) {
    const { drop, element, id } = this.props;
    drop(`${id}!`, `<${element}> failed to draw (${error instanceof Error ? error.message : String(error)}); it was dropped.`);
    drop.flush();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Element({ receiver, node, drop }: { receiver: RemoteReceiver; node: RemoteReceiverElement; drop: Drop }): ReactNode {
  const el = useNode(receiver, node);
  // What this drawing dropped is told after it is drawn, never while (onDrop may set state).
  useEffect(() => drop.flush());
  if (!isQuillRemoteElement(el.element)) {
    drop(el.id, `<${el.element}> isn’t in Quill’s remote vocabulary; it was dropped with what’s inside it.`);
    return null;
  }
  const name: QuillRemoteElementName = el.element;
  const spec: RemoteElementSpec = QUILL_REMOTE_ELEMENTS[name];
  const { props, events } = allowed(el, spec, drop);
  const slots: Record<string, ReactNode[]> = {};
  const children: ReactNode[] = [];
  for (const child of el.children) {
    const slot = child.type === 1 ? child.attributes.slot : undefined;
    if (slot !== undefined && !spec.slots?.includes(slot)) {
      drop(`${child.id}#${slot}`, `<${el.element}> has no slot “${slot}”; what was put there was dropped.`);
      continue;
    }
    if (child.type === 8 || (child.type === 3 && !child.data.trim() && spec.children !== 'text')) continue;
    if (slot === undefined && !spec.children) {
      drop(`${el.id}>`, `<${el.element}> takes no children; they were dropped.`);
      continue;
    }
    if (slot === undefined && spec.children === 'text' && child.type === 1) {
      drop(`${child.id}>text`, `<${el.element}> takes only text inside it; <${child.element}> was dropped.`);
      continue;
    }
    const drawn = <Node key={child.id} receiver={receiver} node={child} drop={drop} />;
    if (slot !== undefined) (slots[slot] ??= []).push(drawn);
    else children.push(drawn);
  }
  const parts: RemoteParts = { props, events, slots, children };
  return (
    <Contained element={name} id={el.id} version={el.version} drop={drop}>
      <Draw name={name} parts={parts} />
    </Contained>
  );
}

/** Draws inside the boundary, so a part that throws is caught there. */
function Draw({ name, parts }: { name: QuillRemoteElementName; parts: RemoteParts }) {
  return renderers[name](parts);
}

function Node({ receiver, node, drop }: { receiver: RemoteReceiver; node: RemoteReceiverNode; drop: Drop }): ReactNode {
  if (node.type === 1) return <Element receiver={receiver} node={node} drop={drop} />;
  if (node.type === 3) return <Text receiver={receiver} node={node} />;
  return null;
}

function Text({ receiver, node }: { receiver: RemoteReceiver; node: RemoteReceiverNode }) {
  const text = useNode(receiver, node);
  return <>{'data' in text ? text.data : null}</>;
}

/** Draws one remote root's tree with the kit. */
export function QuillRemote({ receiver, onDrop }: QuillRemoteProps) {
  const inner = (receiver as Receiver).inner;
  const root = useNode(inner, inner.root);
  const drop = useMemoDrop(onDrop);
  return (
    <>
      {root.children.map((child) => (
        <Node key={child.id} receiver={inner} node={child} drop={drop} />
      ))}
    </>
  );
}

// One dropper per mounted tree, so each reason is said once.
function useMemoDrop(onDrop?: (reason: string) => void): Drop {
  const latest = useRef(onDrop);
  latest.current = onDrop;
  const [drop] = useState(() => dropper((reason) => latest.current?.(reason)));
  return drop;
}
