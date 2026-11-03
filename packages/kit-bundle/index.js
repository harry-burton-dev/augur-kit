// Where the built bundle is, for a build that copies it (the AUGUR web image, the shell's dev server).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The folder holding kit.json and the files it names. */
export const kitDir = fileURLToPath(new URL('./dist/', import.meta.url));

/** The bundle's kit.json. */
export const readKit = () => JSON.parse(readFileSync(new URL('./dist/kit.json', import.meta.url), 'utf8'));
