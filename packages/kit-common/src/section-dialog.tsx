import { useId, type ReactNode } from 'react';
import { Dialog as AriaDialog, Modal, ModalOverlay, Tab, TabList, TabPanel, Tabs, type Key } from 'react-aria-components';
import { Icon, type IconName } from './icon.js';
import { KeyCap } from './key-cap.js';

export interface DialogSection {
  id: string;
  label: string;
  icon: IconName;
  /** Something in this section needs the person: the tab is lit from its edge, and says so to screen readers. */
  needs?: boolean;
  /** Why this section can't show anything to this person now. It stays in the list, dimmed, and its panel says why. */
  unavailable?: string;
}

export interface SectionDialogProps {
  open: boolean;
  /** Esc, or the close button: the dialog closes and focus goes back where it was. */
  onClose: () => void;
  /** What this is ("Account"). */
  heading: string;
  /** Where in it you are, after the heading ("Sign-in and security › All sign-ins"). */
  where?: string;
  /** The close button's words, named for where it goes ("Back to the menu"). */
  closeLabel?: string;
  /** Names the list of sections for screen readers; the heading by default. */
  sectionsLabel?: string;
  sections: DialogSection[];
  selected: string;
  onSelect: (id: string) => void;
  /** Section ids followed by a rule, to group the list ("overview" puts a rule under Overview). */
  ruleAfter?: string[];
  /** The selected section's content. Lay it out with FitParts so it never scrolls. */
  children: ReactNode;
}

/**
 * A small place to work in, over everything: the heading with where you are, the sections as tabs down
 * the side, and one section's content beside them. It has no primary action: each section acts for
 * itself. Up and down move between sections and the content follows; Esc closes and focus goes back
 * where it was (React Aria). What's behind stays in place and steps back on the veil.
 * Use it for one thing's own settings or details (your account, an app's settings, a person in Admin);
 * for one decision, use Dialog.
 */
export function SectionDialog({ open, onClose, heading, where, closeLabel = 'Close', sectionsLabel, sections, selected, onSelect, ruleAfter = [], children }: SectionDialogProps) {
  const titleId = useId();
  const current = sections.find((s) => s.id === selected);
  return (
    <ModalOverlay isOpen={open} onOpenChange={(next) => !next && onClose()} isDismissable={false} className="augur-veil augur-veil-section">
      <Modal className="augur-section-dialog">
        <AriaDialog aria-labelledby={titleId} className="augur-section-dialog-frame">
          <div className="augur-section-dialog-head">
            <h2 id={titleId} className="augur-section-dialog-title">
              {heading}
              {where ? <span className="augur-section-dialog-where">› {where}</span> : null}
            </h2>
            <button type="button" className="augur-dialog-cancel" onClick={onClose}>
              <KeyCap>Esc</KeyCap>
              {closeLabel}
            </button>
          </div>
          <Tabs orientation="vertical" selectedKey={selected} onSelectionChange={(k: Key) => onSelect(String(k))} className="augur-section-dialog-main">
            <TabList aria-label={sectionsLabel ?? heading} className="augur-section-tabs">
              {sections.map((s) => (
                <Tab
                  key={s.id}
                  id={s.id}
                  className="augur-section-tab"
                  data-needs={s.needs ? true : undefined}
                  data-unavailable={s.unavailable ? true : undefined}
                  data-rule={ruleAfter.includes(s.id) ? true : undefined}
                >
                  <Icon name={s.icon} size={16} />
                  <span>{s.label}</span>
                  {s.needs ? <span className="sr-only"> (needs you)</span> : null}
                </Tab>
              ))}
            </TabList>
            <TabPanel id={selected} className="augur-section-panel">
              {current?.unavailable ? <p className="augur-tab-why">{current.unavailable}</p> : children}
            </TabPanel>
          </Tabs>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
