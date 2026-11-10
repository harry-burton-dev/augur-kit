/**
 * The sandbox side of Quill's remote vocabulary (`@augur/app-kit/remote`): one remote-dom element
 * per entry, so an app describes its screen with `document.createElement('quill-list')` and plain
 * properties, in any framework or none. No React and no kit parts come with it; the shell draws
 * them. The SDK's worker runtime brings the DOM these need (remote-dom's polyfill) and connects the
 * roots; an app calls `defineQuillElements()` once, or the runtime does.
 */
import { createRemoteElement } from '@remote-dom/core/elements';
import type { QuillRemoteEvents, QuillRemoteProperties } from './types.js';
import { QUILL_REMOTE_ELEMENTS, type QuillRemoteElementName, type RemoteElementSpec } from './vocabulary.js';

export { QUILL_REMOTE_ELEMENTS, quillRemoteElementNames, isQuillRemoteElement, readerPicturePath, type QuillRemoteElementName, type RemoteElementSpec, type RemoteType } from './vocabulary.js';
export type { QuillRemoteProperties, QuillRemoteEvents, RemoteListItem, RemoteOption, RemoteTableColumn, RemoteThing, RemotePrincipal, RemoteFloorStep, RemoteFilter, RemoteMarked, RemoteChosenFile } from './types.js';

/** A Quill remote element as the sandbox holds it: its properties, set like any other. */
export type QuillRemoteElement<N extends QuillRemoteElementName = QuillRemoteElementName> = HTMLElement & Partial<QuillRemoteProperties[N]>;

/** The detail of a Quill remote element's event, for a listener: `(e) => (e as QuillRemoteEvent<'quill-list', 'open'>).detail`. */
export type QuillRemoteEvent<N extends QuillRemoteElementName, E extends keyof QuillRemoteEvents[N]> = CustomEvent<QuillRemoteEvents[N][E]>;

/** A remote-dom element constructor for one entry of the vocabulary. */
export const quillRemoteElement = (spec: RemoteElementSpec): CustomElementConstructor => {
  const Base = createRemoteElement({
    // Properties only, never reflected to attributes: remote-dom's typed attributes would also start a
    // boolean at false, where the kit part has its own default.
    properties: Object.fromEntries(Object.keys(spec.properties).map((name) => [name, { attribute: false }])),
    events: Object.keys(spec.events),
    slots: [...(spec.slots ?? [])],
  }) as unknown as CustomElementConstructor;
  const mirror = Object.entries(spec.mirror ?? {});
  if (!mirror.length) return Base;
  // A field the person types into on the host: the element keeps what they typed, so when the app
  // later sets the value (clearing it after a save, say) that is a change and reaches the host.
  return class extends (Base as unknown as { new (): HTMLElement }) {
    constructor() {
      super();
      for (const [event, property] of mirror) {
        this.addEventListener(event, (e) => {
          (this as unknown as Record<string, unknown>)[property] = (e as CustomEvent).detail;
        });
      }
    }
  };
};

/**
 * Defines every Quill remote element in the sandbox's element registry. Safe to call twice; a name
 * already defined there is left as it is.
 */
export function defineQuillElements(registry: CustomElementRegistry = customElements) {
  for (const [name, spec] of Object.entries(QUILL_REMOTE_ELEMENTS)) {
    if (!registry.get(name)) registry.define(name, quillRemoteElement(spec));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quill-page-head': QuillRemoteElement<'quill-page-head'>;
    'quill-section': QuillRemoteElement<'quill-section'>;
    'quill-selection-bar': QuillRemoteElement<'quill-selection-bar'>;
    'quill-about': QuillRemoteElement<'quill-about'>;
    'quill-more': QuillRemoteElement<'quill-more'>;
    'quill-list': QuillRemoteElement<'quill-list'>;
    'quill-table': QuillRemoteElement<'quill-table'>;
    'quill-rows': QuillRemoteElement<'quill-rows'>;
    'quill-facts': QuillRemoteElement<'quill-facts'>;
    'quill-details': QuillRemoteElement<'quill-details'>;
    'quill-state': QuillRemoteElement<'quill-state'>;
    'quill-notice': QuillRemoteElement<'quill-notice'>;
    'quill-tag': QuillRemoteElement<'quill-tag'>;
    'quill-button': QuillRemoteElement<'quill-button'>;
    'quill-text-field': QuillRemoteElement<'quill-text-field'>;
    'quill-select': QuillRemoteElement<'quill-select'>;
    'quill-checkbox': QuillRemoteElement<'quill-checkbox'>;
    'quill-editor': QuillRemoteElement<'quill-editor'>;
    'quill-palette': QuillRemoteElement<'quill-palette'>;
    'quill-tiles': QuillRemoteElement<'quill-tiles'>;
    'quill-kind-tile': QuillRemoteElement<'quill-kind-tile'>;
    'quill-add-tile': QuillRemoteElement<'quill-add-tile'>;
    'quill-reel': QuillRemoteElement<'quill-reel'>;
    'quill-dialog': QuillRemoteElement<'quill-dialog'>;
    'quill-ask-twice': QuillRemoteElement<'quill-ask-twice'>;
    'quill-choice': QuillRemoteElement<'quill-choice'>;
    'quill-checkbox-group': QuillRemoteElement<'quill-checkbox-group'>;
    'quill-date-field': QuillRemoteElement<'quill-date-field'>;
    'quill-tag-picker': QuillRemoteElement<'quill-tag-picker'>;
    'quill-steps': QuillRemoteElement<'quill-steps'>;
    'quill-progress': QuillRemoteElement<'quill-progress'>;
    'quill-status': QuillRemoteElement<'quill-status'>;
    'quill-check-list': QuillRemoteElement<'quill-check-list'>;
    'quill-step-list': QuillRemoteElement<'quill-step-list'>;
    'quill-paged-list': QuillRemoteElement<'quill-paged-list'>;
    'quill-reader': QuillRemoteElement<'quill-reader'>;
    'quill-file-button': QuillRemoteElement<'quill-file-button'>;
    'quill-people-picker': QuillRemoteElement<'quill-people-picker'>;
    'quill-floor-path': QuillRemoteElement<'quill-floor-path'>;
    'quill-filter-bar': QuillRemoteElement<'quill-filter-bar'>;
  }
}
