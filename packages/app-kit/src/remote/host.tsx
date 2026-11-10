/**
 * What the host lends a few remote elements, beyond drawing them: the things only it may do for the
 * app (ADR 0076, 0092). The shell passes these to `QuillRemote`; without one, the element that needs
 * it still draws and says what it can't do.
 */
import { createContext, useContext } from 'react';

export interface QuillRemoteHost {
  /**
   * Fetches a reader's picture for the app, by the path its Markdown names (it has passed
   * `readerPicturePath`), under the app's own API, with the person's token; answers an address the
   * page can show (an object URL), or undefined when it couldn't.
   */
  picture?: (path: string) => Promise<string | undefined>;
  /** Takes the files the person chose with a file button, as a drop on the app's pane. */
  files?: (files: File[]) => void;
}

export const QuillRemoteHostContext = createContext<QuillRemoteHost>({});

export const useQuillRemoteHost = () => useContext(QuillRemoteHostContext);
