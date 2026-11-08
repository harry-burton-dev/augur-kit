/**
 * The host side of Quill's remote vocabulary: the shell keeps what an app's sandbox describes in a
 * receiver and draws it here with the real kit. Only the vocabulary passes (ADR 0076; the app
 * contract, 6.7): an element outside it, a property it doesn't name or of the wrong type, an event
 * it doesn't send, each is dropped with a console reason, and the rest of the screen still draws.
 *
 * A dropped element stays in the receiver's tree, drawn as nothing, so the positions the sandbox's
 * later changes name still line up.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { RemoteReceiver, type RemoteReceiverElement, type RemoteReceiverNode, type RemoteReceiverRoot } from '@remote-dom/core/receivers';
import { QUILL_REMOTE_ELEMENTS, fitsRemoteType, isQuillRemoteElement, type QuillRemoteElementName, type RemoteElementSpec } from './vocabulary.js';
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

/** The values of the properties the vocabulary names and types; the rest are dropped. */
function allowed(el: RemoteReceiverElement, spec: RemoteElementSpec, drop: Drop) {
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(el.properties)) {
    const type = spec.properties[name];
    if (!type) drop(`${el.id}.${name}`, `<${el.element}> has no property “${name}”; it was dropped.`);
    else if (!fitsRemoteType(type, value)) drop(`${el.id}.${name}:type`, `<${el.element}>’s “${name}” takes a ${type}; the ${Array.isArray(value) ? 'array' : typeof value} sent was dropped.`);
    else props[name] = value;
  }
  const events: Record<string, (detail?: unknown) => void> = {};
  for (const [name, listener] of Object.entries(el.eventListeners)) {
    if (!Object.hasOwn(spec.events, name)) drop(`${el.id}@${name}`, `<${el.element}> sends no “${name}” event; its listener was dropped.`);
    else events[name] = (detail?: unknown) => void Promise.resolve(listener(detail)).catch(() => undefined);
  }
  return { props, events };
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
    if (slot === undefined && !spec.children && child.type !== 8) {
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
