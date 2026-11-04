import type { ReactNode } from 'react';
import { Button, type ButtonProps } from './button.js';

export interface AskTwiceProps extends Omit<ButtonProps, 'kind' | 'once' | 'confirmLabel' | 'children'> {
  /** The action, named for what it does ("Delete", "Turn off", "Remove app"). */
  children: ReactNode;
  /** What the armed button says, naming what the second press does: "Press again to delete". */
  confirm: string;
}

/**
 * A danger action that needs a second, deliberate press: for delete, turn off, reset a password,
 * remove an app or go back past unsaved work. The first press arms it and it says what will happen
 * (`confirm`), politely, to screen readers too; a second press within `armFor` (the `motion-still`
 * token unless given) acts. Esc, leaving it or the time running out puts it back. Like every
 * button, `disabled` with a `reason` keeps it focusable and says why. It is Common's danger
 * `Button`, named for what it promises; inside a confirmation already, use `<Button kind="danger" once>`.
 */
export function AskTwice({ confirm, children, ...rest }: AskTwiceProps) {
  return (
    <Button {...rest} kind="danger" confirmLabel={confirm}>
      {children}
    </Button>
  );
}
